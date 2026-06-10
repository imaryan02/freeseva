import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { PdfProcessingEngine } from '../../utils/engines/PdfProcessingEngine';
import { 
  Download, 
  ShieldCheck, 
  FileCheck,
  FileText,
  AlertTriangle,
  FileEdit,
  Trash2,
  Folder,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UploadCloud
} from 'lucide-react';

interface PdfBatchItem {
  id: string;
  file: File;
  customName: string;
  compressionStrategy: 'preset' | 'custom';
  compressionLevel: 'low' | 'medium' | 'high';
  sizeMode: 'range' | 'single';
  minSizeKB: number;
  maxSizeKB: number;
  previewUrl: string; // Cache page 1 preview
}

interface PdfBatchItemResult {
  id: string;
  originalFile: File;
  processedFile: File | null;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error?: string;
  savingsPercentage?: number;
}

export const PdfCompressor: React.FC = () => {
  const [queue, setQueue] = useState<PdfBatchItem[]>([]);
  const [results, setResults] = useState<Record<string, PdfBatchItemResult>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [zipProgress, setZipProgress] = useState<string>('');
  
  const [warningModal, setWarningModal] = useState<{
    itemName: string;
    targetKB: number;
    originalKB: number;
    isTextPdf?: boolean;
    resolve: (choice: 'proceed' | 'increase') => void;
  } | null>(null);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const sanitizeFileName = (name: string): string => {
    return name.replace(/[\\/:*?"<>|]/g, '_');
  };

  const handleUploadTrigger = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = ''; // Reset input to ensure trigger fires
      hiddenInputRef.current.click();
    }
  };

  const handleFileSelect = async (files: File[]) => {
    const newItems: PdfBatchItem[] = [];

    for (const file of files) {
      let previewUrl = '';
      try {
        previewUrl = await PdfProcessingEngine.renderPageToUrl(file, 1, 0.2);
      } catch (err) {
        console.error('Failed to render PDF preview:', err);
      }

      const dotIndex = file.name.lastIndexOf('.');
      const initialName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      const cleanName = sanitizeFileName(initialName);

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        customName: cleanName,
        compressionStrategy: 'custom',
        compressionLevel: 'medium',
        sizeMode: 'range',
        minSizeKB: 50,
        maxSizeKB: 100,
        previewUrl,
      });
    }

    setQueue((prev) => [...prev, ...newItems]);
    setZipBlob(null);
    setZipProgress('');
  };

  const updateItemSettings = (id: string, updates: Partial<PdfBatchItem>) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
  };

  const applyPresetToQueue = (
    preset: Pick<PdfBatchItem, 'sizeMode' | 'minSizeKB' | 'maxSizeKB'>
  ) => {
    setQueue((prev) => prev.map((item) => ({ ...item, ...preset, compressionStrategy: 'custom' })));
    setZipBlob(null);
    setZipProgress('');
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((i) => i.id !== id);
    });
    setResults((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const executeBatch = async () => {
    if (queue.length === 0) return;
    setIsProcessing(true);
    setZipBlob(null);
    setZipProgress('Starting PDF batch compilation...');

    // Validate parameters
    const validatedQueue = queue.map((item) => {
      const sanitizedName = sanitizeFileName(item.customName.trim() || 'document');
      if (item.compressionStrategy === 'custom' && item.maxSizeKB <= item.minSizeKB) {
        return {
          ...item,
          customName: sanitizedName,
          maxSizeKB: item.minSizeKB + 10,
        };
      }
      return {
        ...item,
        customName: sanitizedName,
      };
    });
    setQueue(validatedQueue);

    const newResults: Record<string, PdfBatchItemResult> = {};
    validatedQueue.forEach((item) => {
      newResults[item.id] = {
        id: item.id,
        originalFile: item.file,
        processedFile: null,
        status: 'processing',
      };
    });
    setResults(newResults);

    const compiledFiles: File[] = [];

    for (let i = 0; i < validatedQueue.length; i++) {
      const item = validatedQueue[i];
      setZipProgress(`Processing document ${i + 1} of ${queue.length}: ${item.customName}`);

      let currentItem = item;
      const originalKB = item.file.size / 1024;
      const ext = 'pdf';
      const finalName = `${item.customName}.${ext}`;

      if (item.compressionStrategy === 'custom') {
        let isDrastic = false;
        if (originalKB < 350 && item.maxSizeKB < originalKB) {
          isDrastic = true;
        } else if (item.maxSizeKB < originalKB * 0.4) {
          isDrastic = true;
        }

        if (isDrastic) {
          setZipProgress(`Awaiting quality decision for ${item.customName}...`);
          const choice = await new Promise<'proceed' | 'increase'>((res) => {
            setWarningModal({
              itemName: finalName,
              targetKB: item.maxSizeKB,
              originalKB: Math.round(originalKB),
              isTextPdf: originalKB < 350,
              resolve: res,
            });
          });

          if (choice === 'increase') {
            const increaseAmount = 45;
            const newMax = item.maxSizeKB + increaseAmount;
            const newMin = item.minSizeKB > 0 ? Math.max(10, item.minSizeKB + Math.round(increaseAmount * 0.4)) : 0;
            
            updateItemSettings(item.id, {
              maxSizeKB: newMax,
              minSizeKB: newMin,
            });

            currentItem = {
              ...item,
              maxSizeKB: newMax,
              minSizeKB: newMin,
            };
          }
        }
      }

      try {
        let compressionResult;
        if (currentItem.compressionStrategy === 'preset') {
          compressionResult = await PdfProcessingEngine.compress(
            currentItem.file,
            currentItem.compressionLevel,
            undefined,
            true,
            currentItem.maxSizeKB,
            currentItem.sizeMode === 'range' ? currentItem.minSizeKB : 0
          );
        } else {
          compressionResult = await PdfProcessingEngine.compress(
            currentItem.file,
            'low',
            undefined,
            true,
            currentItem.maxSizeKB,
            currentItem.sizeMode === 'range' ? currentItem.minSizeKB : 0
          );
        }

        const finalFile = new File([compressionResult.file], finalName, { type: 'application/pdf' });

        const savingsPercentage = Math.max(
          0,
          Math.round(((currentItem.file.size - finalFile.size) / currentItem.file.size) * 100)
        );

        setResults((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            status: 'completed',
            processedFile: finalFile,
            savingsPercentage,
          },
        }));

        compiledFiles.push(finalFile);
      } catch (err: unknown) {
        console.error(`Error processing ${item.file.name}:`, err);
        setResults((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            status: 'failed',
            error: err instanceof Error ? err.message : 'Compression failed',
          },
        }));
      }
    }

    if (compiledFiles.length > 0) {
      setZipProgress('Packing output PDFs inside ZIP package structures...');
      try {
        const zip = new JSZip();
        const nameCounts: Record<string, number> = {};

        for (const file of compiledFiles) {
          let name = file.name;
          if (nameCounts[name] !== undefined) {
            nameCounts[name]++;
            const lastDot = name.lastIndexOf('.');
            if (lastDot !== -1) {
              name = `${name.substring(0, lastDot)}_(${nameCounts[name]})${name.substring(lastDot)}`;
            } else {
              name = `${name}_(${nameCounts[name]})`;
            }
          } else {
            nameCounts[name] = 0;
          }
          
          zip.file(name, file);
        }

        const compiledZip = await zip.generateAsync({ type: 'blob' });
        setZipBlob(compiledZip);
        setZipProgress('ZIP archive compiled successfully!');
      } catch (zipErr) {
        console.error('Failed to compile ZIP:', zipErr);
        setZipProgress('Batch processed, but ZIP compilation failed.');
      }
    } else {
      setZipProgress('All queue elements failed processing constraints.');
    }

    setIsProcessing(false);
  };

  const triggerSingleDownload = (id: string) => {
    const res = results[id];
    if (!res || !res.processedFile) return;
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(res.processedFile);
    link.href = objectUrl;
    link.download = res.processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  };

  const triggerZipDownload = () => {
    if (!zipBlob) return;
    const link = document.createElement('a');
    const objectUrl = URL.createObjectURL(zipBlob);
    link.href = objectUrl;
    link.download = `freeSeva_pdfs_package_${Date.now().toString().slice(-6)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  };

  const resetWorkspace = () => {
    queue.forEach((item) => {
      if (item.previewUrl) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    setQueue([]);
    setResults({});
    setZipBlob(null);
    setZipProgress('');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <PageLayout
      title="PDF Compressor Workspace"
      description="Compress and package multiple PDF documents concurrently. Select presets, rename files, and download everything in one compiled ZIP."
    >
      <div className="flex flex-col gap-8 animate-fadeIn">
        {/* Hidden File Input for Workspace expansion triggers */}
        <input
          type="file"
          ref={hiddenInputRef}
          multiple
          className="hidden"
          accept="application/pdf"
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(Array.from(e.target.files));
            }
          }}
        />

        {/* Empty State: Single large drag-drop upload box */}
        {queue.length === 0 && (
          <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
            <div className="text-center max-w-xl mx-auto mb-2 select-none">
              <h2 className="text-lg font-black text-navy-950 font-display">Upload PDF documents to compress:</h2>
              <p className="text-xs text-navy-500 font-semibold mt-1">
                Upload one or multiple PDF documents. Customize footprint limits and filenames in the workspace.
              </p>
            </div>

            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="application/pdf"
              multiple={true}
              maxSizeMB={25}
              label="Upload PDF Documents"
              helperText="Upload standard PDF files up to 25MB each"
            />
          </div>
        )}

        {/* Workspace Display */}
        {queue.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Queue Panel */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              <Card className="flex flex-col gap-5">
                
                {/* Header matching AllInOne with count badge and add shortcuts */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-navy-100 pb-4 gap-4 select-none">
                  <div>
                    <span className="text-sm font-black text-navy-900 font-display">Workspace Grid</span>
                    <span className="ml-2 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {queue.length} {queue.length === 1 ? 'Queue Item' : 'Queue Items'}
                    </span>
                  </div>

                  {/* Add PDF button */}
                  <div>
                    <button
                      type="button"
                      onClick={handleUploadTrigger}
                      disabled={isProcessing}
                      className="px-3 py-1.5 bg-navy-50 hover:bg-navy-100 border border-navy-200 text-[10px] font-bold rounded-lg text-navy-700 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                    >
                      <UploadCloud className="h-3.5 w-3.5 text-navy-500" /> + Add PDF
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/40 p-3 select-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-800 mr-1">
                    Quick Targets
                  </span>
                  <button
                    type="button"
                    onClick={() => applyPresetToQueue({ sizeMode: 'single', minSizeKB: 0, maxSizeKB: 100 })}
                    disabled={isProcessing}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-brand-200 bg-white text-brand-800 hover:bg-brand-100 disabled:opacity-50"
                  >
                    Under 100KB
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetToQueue({ sizeMode: 'range', minSizeKB: 100, maxSizeKB: 200 })}
                    disabled={isProcessing}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-brand-200 bg-white text-brand-800 hover:bg-brand-100 disabled:opacity-50"
                  >
                    100-200KB
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPresetToQueue({ sizeMode: 'single', minSizeKB: 0, maxSizeKB: 300 })}
                    disabled={isProcessing}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-brand-200 bg-white text-brand-800 hover:bg-brand-100 disabled:opacity-50"
                  >
                    Under 300KB
                  </button>
                </div>

                {/* Grid Rows Container with Horizontal Scroll fallback */}
                <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                  <div className="flex flex-col gap-4 pr-1">
                    {queue.map((item) => {
                      const result = results[item.id];
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col lg:flex-row lg:items-center justify-between p-4 bg-navy-50/70 border border-navy-200 rounded-xl hover:bg-navy-50 transition-all gap-4 animate-fadeIn w-full lg:min-w-max"
                        >
                          {/* Left Group: Thumbnail + Output Name (Keeps side-by-side even on mobile) */}
                          <div className="flex items-center gap-4 w-full lg:w-auto">
                            {/* 1. Preview / Thumbnail */}
                            <div className="w-12 h-12 rounded-lg bg-navy-200 flex-shrink-0 overflow-hidden border border-navy-300 flex items-center justify-center shadow-sm relative select-none">
                              {item.previewUrl ? (
                                <img
                                  src={item.previewUrl}
                                  alt="preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <FileText className="h-5 w-5 text-navy-500" />
                              )}
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.2 select-none" title={`Original size: ${formatBytes(item.file.size)}`}>
                                {formatBytes(item.file.size)}
                              </span>
                            </div>

                            {/* 2. OUTPUT FILE NAME */}
                            <div className="flex-1 lg:flex-initial flex flex-col gap-0.5 min-w-[130px] lg:min-w-[150px]">
                              <span className="text-[9px] uppercase tracking-wider font-bold text-navy-450 select-none flex items-center gap-0.5">
                                <FileEdit className="h-2.5 w-2.5" /> Output File Name
                              </span>
                              <input
                                type="text"
                                value={item.customName}
                                onChange={(e) => updateItemSettings(item.id, { customName: sanitizeFileName(e.target.value) })}
                                disabled={isProcessing}
                                className="px-2 py-1 text-xs border border-navy-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold text-navy-800 bg-white w-full max-w-[140px]"
                                placeholder="Rename file..."
                              />
                              <div className="text-[9px] text-navy-500 mt-1 font-semibold flex flex-wrap items-center gap-1 select-none">
                                <span>Orig: <strong className="text-navy-850">{formatBytes(item.file.size)}</strong></span>
                                {result?.processedFile && result.status === 'completed' && (
                                  <>
                                    <span className="text-navy-300 font-normal select-none">•</span>
                                    <span className="text-brand-700 bg-brand-50 border border-brand-100 rounded px-1 flex items-center gap-0.5 animate-fadeIn">
                                      Final: <strong className="font-extrabold">{formatBytes(result.processedFile.size)}</strong>
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Middle Group: Settings (Fluid flexbox wrapping on mobile/tablet, horizontal columns on desktop) */}
                          <div className="flex flex-wrap gap-4 w-full lg:flex-nowrap lg:flex-row lg:items-center lg:justify-between lg:w-auto lg:gap-6 flex-1 border-t lg:border-t-0 border-navy-100/70 pt-3 lg:pt-0">
                            {/* 3. FILE TYPE (AUTO) */}
                            <div className="flex-1 min-w-[110px] select-none">
                              <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1.5 select-none">
                                File Type (Auto)
                              </label>
                              <span className="inline-block px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-lg border border-emerald-250 bg-emerald-50 text-emerald-700 tracking-wide">
                                PDF Document
                              </span>
                            </div>

                            {/* 4. OPERATION MODE */}
                            <div className="flex-1 min-w-[130px]">
                              <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1.5 select-none">
                                Operation Mode
                              </label>
                              <select
                                disabled={true}
                                className="w-full px-2 py-1 text-[11px] font-bold bg-navy-50 border border-navy-200 rounded-lg cursor-not-allowed text-navy-400"
                              >
                                <option>Compress to size</option>
                              </select>
                            </div>

                            {/* 5. SIZE TARGET */}
                            <div className="flex-1 min-w-[210px]">
                              <div className="flex flex-col gap-1">
                                <div className="flex justify-between items-center max-w-[195px] select-none">
                                  <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider">
                                    Size Target
                                  </label>
                                  <div className="flex bg-navy-150 border border-navy-200 rounded p-0.5">
                                    <button
                                      type="button"
                                      onClick={() => updateItemSettings(item.id, { sizeMode: 'range', minSizeKB: Math.max(5, Math.floor(item.maxSizeKB * 0.4)) })}
                                      disabled={isProcessing}
                                      className={`text-[8px] font-extrabold rounded px-1.5 py-0.5 tracking-wide uppercase select-none transition-all cursor-pointer ${
                                        item.sizeMode === 'range'
                                          ? 'text-brand-700 bg-white shadow-xs font-black'
                                          : 'text-navy-500 hover:text-navy-700 bg-transparent'
                                      }`}
                                    >
                                      Range
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => updateItemSettings(item.id, { sizeMode: 'single', minSizeKB: 0 })}
                                      disabled={isProcessing}
                                      className={`text-[8px] font-extrabold rounded px-1.5 py-0.5 tracking-wide uppercase select-none transition-all cursor-pointer ${
                                        item.sizeMode === 'single'
                                          ? 'text-brand-700 bg-white shadow-xs font-black'
                                          : 'text-navy-500 hover:text-navy-700 bg-transparent'
                                      }`}
                                    >
                                      Single
                                    </button>
                                  </div>
                                </div>

                                {item.sizeMode === 'range' ? (
                                  <div className="flex items-center gap-1 bg-white border border-navy-200 rounded-lg px-2 py-0.5 max-w-[195px]">
                                    <input
                                      type="number"
                                      value={item.minSizeKB}
                                      onChange={(e) => updateItemSettings(item.id, { minSizeKB: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                                      onBlur={() => {
                                        if (item.maxSizeKB <= item.minSizeKB) {
                                          updateItemSettings(item.id, { maxSizeKB: item.minSizeKB + 10 });
                                        }
                                      }}
                                      disabled={isProcessing}
                                      className="w-14 px-1.5 py-0.5 text-center focus:outline-none text-[11px]"
                                      placeholder="Min"
                                    />
                                    <span className="text-navy-300 font-normal select-none px-1">to</span>
                                    <input
                                      type="number"
                                      value={item.maxSizeKB}
                                      onChange={(e) => updateItemSettings(item.id, { maxSizeKB: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                                      onBlur={() => {
                                        if (item.maxSizeKB <= item.minSizeKB) {
                                          updateItemSettings(item.id, { maxSizeKB: item.minSizeKB + 10 });
                                        }
                                      }}
                                      disabled={isProcessing}
                                      className="w-14 px-1.5 py-0.5 text-center focus:outline-none font-bold text-brand-750 text-[11px]"
                                      placeholder="Max"
                                    />
                                    <span className="text-[9px] text-navy-400 uppercase font-bold select-none ml-auto pr-0.5">KB</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 bg-white border border-navy-200 rounded-lg px-2 py-0.5 max-w-[195px]">
                                    <span className="text-[10px] text-navy-455 font-bold select-none px-0.5">Under</span>
                                    <input
                                      type="number"
                                      value={item.maxSizeKB}
                                      onChange={(e) => updateItemSettings(item.id, { maxSizeKB: Math.max(5, parseInt(e.target.value, 10) || 5) })}
                                      disabled={isProcessing}
                                      className="w-16 px-1.5 py-0.5 text-center focus:outline-none font-bold text-brand-700 text-[11px]"
                                      placeholder="Limit"
                                    />
                                    <span className="text-[10px] text-navy-400 uppercase font-bold select-none ml-auto pr-0.5">KB</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right Group: Row Actions (Enclosed perfectly in card border) */}
                          <div className="flex items-center gap-2.5 justify-end w-full lg:w-auto lg:min-w-[135px] border-t lg:border-t-0 border-navy-100/70 pt-3 lg:pt-0">
                            {result && (
                              <div className="flex items-center gap-1 select-none">
                                {result.status === 'processing' && (
                                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded-full flex items-center gap-0.5">
                                    <Spinner size="sm" />
                                  </span>
                                )}
                                {result.status === 'completed' && (
                                  <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 border border-brand-100 rounded-full flex items-center gap-0.5 animate-fadeIn">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" /> Done
                                  </span>
                                )}
                                {result.status === 'failed' && (
                                  <span className="text-[10px] font-bold text-red-650 bg-red-50 px-2 py-0.5 border border-red-100 rounded-full flex items-center gap-0.5" title={result.error}>
                                    <XCircle className="h-3.5 w-3.5" /> Error
                                  </span>
                                )}
                              </div>
                            )}

                            {result?.status === 'completed' && (
                              <button
                                type="button"
                                onClick={() => triggerSingleDownload(item.id)}
                                className="p-1.5 text-brand-600 hover:bg-brand-50 border border-brand-100 rounded transition-all cursor-pointer active:scale-95"
                                title="Download PDF"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              disabled={isProcessing}
                              className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-650 border border-red-100 rounded transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer notes and compile actions */}
                <div className="mt-4 border-t border-navy-150 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2 items-center text-xs font-semibold text-navy-500 select-none">
                    <HelpCircle className="h-4 w-4 text-navy-400" />
                    <span>Click 'Compress PDF Documents' to execute PDF size compression constraints.</span>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      onClick={resetWorkspace}
                      disabled={isProcessing}
                      className="border border-navy-200 font-bold"
                    >
                      Clear Workspace
                    </Button>
                    <Button
                      variant="primary"
                      onClick={executeBatch}
                      disabled={isProcessing || queue.length === 0}
                      className="flex items-center justify-center gap-1.5 font-bold"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Compress PDF Documents
                    </Button>
                  </div>
                </div>

              </Card>
            </div>

            {/* Right Status Panel */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* ZIP Package Card */}
              <Card className="flex flex-col gap-5">
                <h3 className="text-sm font-bold text-navy-900 border-b border-navy-100 pb-2.5 flex items-center gap-2 select-none">
                  <Folder className="h-5 w-5 text-brand-600" />
                  ZIP Package Archive
                </h3>

                {zipProgress && (
                  <div className="bg-navy-50 border border-navy-150 rounded-xl p-3.5 flex flex-col gap-2 animate-fadeIn text-xs text-navy-600 select-none">
                    <div className="flex items-center gap-1.5 font-bold text-navy-800">
                      {isProcessing ? <Spinner size="sm" /> : <CheckCircle2 className="h-4 w-4 text-brand-600" />}
                      <span>Processing Log:</span>
                    </div>
                    <p className="font-mono text-[9px] leading-relaxed bg-white border border-navy-200 rounded p-2 text-navy-500 break-all whitespace-pre-wrap">
                      {zipProgress}
                    </p>
                  </div>
                )}

                {zipBlob ? (
                  <div className="flex flex-col gap-4 animate-fadeIn">
                    <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                      <FileCheck className="h-5 w-5 text-brand-600 animate-bounce" />
                      <span>ZIP Archive Ready!</span>
                    </div>

                    <div className="text-xs text-navy-600 font-semibold bg-navy-50 rounded-xl p-3 border border-navy-100 flex justify-between select-none">
                      <span>ZIP package footprint:</span>
                      <span className="font-bold text-brand-700">{formatBytes(zipBlob.size)}</span>
                    </div>

                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full flex items-center justify-center gap-2 text-sm font-bold"
                      onClick={triggerZipDownload}
                    >
                      <Download className="h-4 w-4" />
                      Download ZIP Package
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-10 text-navy-500 border-2 border-dashed border-navy-200 rounded-xl flex flex-col items-center justify-center select-none">
                    <Folder className="h-10 w-10 text-navy-300 mb-2 animate-pulse" />
                    <span className="text-xs font-semibold">ZIP Output Ready</span>
                    <span className="text-[10px] text-navy-450 mt-1">Download ZIP populated upon compilation</span>
                  </div>
                )}
              </Card>

              {/* Secure guarantee badge */}
              <div className="flex items-center gap-2.5 p-3.5 bg-brand-50/50 border border-brand-100 rounded-2xl text-brand-800 text-xs font-semibold select-none shadow-sm">
                <ShieldCheck className="h-5 w-5 text-brand-600 flex-shrink-0" />
                <div>
                  <span className="font-bold block">100% Client Processing</span>
                  <span className="text-[10px] text-navy-500 leading-snug block">Zero server transfers. Absolute data confidentiality.</span>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Extreme compression Warning Modal dialog */}
      {warningModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-navy-150 shadow-2xl max-w-md w-full overflow-hidden p-6 flex flex-col gap-4 animate-scaleUp">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-3 bg-amber-50 rounded-xl animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-navy-900 text-sm font-display leading-tight">
                  High Compression Warning
                </h3>
                <p className="text-[10px] text-navy-500 font-semibold mt-0.5 uppercase tracking-wide">
                  Legibility degradation likely
                </p>
              </div>
            </div>

            <p className="text-xs text-navy-600 leading-relaxed font-semibold">
              {warningModal.isTextPdf ? (
                <span>
                  This document contains <strong className="text-navy-900">clean text</strong>. To compress it from <strong className="text-navy-850">{warningModal.originalKB} KB</strong> down to under <strong className="text-brand-700">{warningModal.targetKB} KB</strong>, the engine will first try <strong>smart optimization</strong> (text stays perfect). If that's not enough, it will convert pages to images which <strong>may reduce readability slightly</strong>.
                </span>
              ) : (
                <span>
                  To shrink <strong className="text-navy-900">"{warningModal.itemName}"</strong> from <strong className="text-navy-850">{warningModal.originalKB} KB</strong> down to under <strong className="text-brand-700">{warningModal.targetKB} KB</strong>, the engine must apply aggressive compression. Text may become blurry or hard to read.
                </span>
              )}
            </p>

            <div className="bg-navy-50 border border-navy-150 rounded-xl p-3 text-[10px] text-navy-500 font-semibold leading-relaxed">
              {warningModal.isTextPdf ? (
                <span>
                  👉 <strong>Recommendation</strong>: The engine automatically tries the best method first (keeping text sharp). If the portal strictly needs a smaller file, click <strong>Proceed</strong>. To keep full readability, click <strong>Increase Limit</strong>.
                </span>
              ) : (
                <span>
                  👉 <strong>Tip</strong>: Increasing the limit by 45 KB will allow a cleaner compression profile with perfect legibility while still keeping your file highly optimized.
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 mt-2">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const resolveFn = warningModal.resolve;
                    setWarningModal(null);
                    resolveFn('proceed');
                  }}
                  className="flex-1 px-4 py-2.5 bg-navy-100 hover:bg-navy-200 text-navy-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center select-none font-semibold"
                >
                  Proceed Anyway
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const resolveFn = warningModal.resolve;
                    setWarningModal(null);
                    resolveFn('increase');
                  }}
                  className="flex-1 px-4 py-2.5 bg-navy-50 hover:bg-navy-100 border border-navy-250 text-navy-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center select-none font-semibold"
                >
                  Increase Limit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};
