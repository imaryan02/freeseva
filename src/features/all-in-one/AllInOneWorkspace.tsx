import React, { useState, useRef } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import {
  AllInOneEngine, 
  type BatchItem, 
  type BatchItemResult 
} from '../../utils/engines/AllInOneEngine';
import { PdfProcessingEngine } from '../../utils/engines/PdfProcessingEngine';
import {
  Download,
  Trash2,
  ShieldCheck,
  FileCheck,
  FileText,
  ImageIcon,
  Folder,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PenTool,
  FileEdit,
  AlertTriangle
} from 'lucide-react';

export const AllInOneWorkspace: React.FC = () => {
  const [queue, setQueue] = useState<BatchItem[]>([]);
  const [results, setResults] = useState<Record<string, BatchItemResult>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [zipProgress, setZipProgress] = useState<string>('');
  const [warningModal, setWarningModal] = useState<{
    itemName: string;
    itemId: string;
    targetKB: number;
    originalKB: number;
    isTextPdf?: boolean;
    resolve: (choice: 'proceed' | 'increase' | 'monochrome') => void;
  } | null>(null);

  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const activeUploadType = useRef<'photo' | 'signature' | 'document' | 'generic'>('generic');

  const sanitizeFileName = (name: string): string => {
    return name.replace(/[\\/:*?"<>|]/g, '_');
  };

  const handleUploadTrigger = (type: 'photo' | 'signature' | 'document' | 'generic') => {
    activeUploadType.current = type;
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = ''; // Reset to ensure change event fires for same file
      hiddenInputRef.current.click();
    }
  };

  const handleFileSelect = async (files: File[]) => {
    const newItems: BatchItem[] = [];

    for (const file of files) {
      const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
      const isSign = file.name.toLowerCase().includes('sign') || file.name.toLowerCase().includes('signature');
      
      let targetType: 'photo' | 'signature' | 'document' | 'generic' = activeUploadType.current;
      
      // Auto detect overrides if it is PDF or sign and they clicked "Generic" or did a generic upload
      if (activeUploadType.current === 'generic') {
        if (isPdf) {
          targetType = 'document';
        } else if (isSign) {
          targetType = 'signature';
        } else {
          targetType = 'photo';
        }
      }

      // Default configs based on target category
      const mode: 'compress' | 'resize' = 'compress';
      let minSizeKB = 20;
      let maxSizeKB = 50;
      let resizeWidth = 350;
      let resizeHeight = 450;
      const resizeUnit: 'px' | 'cm' | 'inch' = 'px';
      let outputFormat: 'jpeg' | 'png' | 'pdf' = 'jpeg';

      if (targetType === 'document') {
        minSizeKB = 50;
        maxSizeKB = 100;
        outputFormat = 'pdf';
      } else if (targetType === 'signature') {
        minSizeKB = 10;
        maxSizeKB = 20;
        resizeWidth = 400;
        resizeHeight = 200;
      }

      // Create preview immediately
      let previewUrl = '';
      if (isPdf) {
        try {
          previewUrl = await PdfProcessingEngine.renderPageToUrl(file, 1, 0.2);
        } catch (err) {
          console.error('Failed to render PDF preview:', err);
        }
      } else {
        previewUrl = URL.createObjectURL(file);
      }

      // Strip original extension from filename to populate initial editable customName
      const dotIndex = file.name.lastIndexOf('.');
      const initialName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      const cleanName = sanitizeFileName(initialName);

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        targetType,
        mode,
        minSizeKB,
        maxSizeKB,
        resizeWidth,
        resizeHeight,
        resizeUnit,
        maintainAspectRatio: true,
        outputFormat,
        customName: cleanName,
        previewUrl,
        sizeMode: 'range',
      });
    }

    setQueue((prev) => [...prev, ...newItems]);
    setZipBlob(null);
    setZipProgress('');
  };

  const updateItemSettings = (id: string, updates: Partial<BatchItem>) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, ...updates };
          
          // Sync default configuration ranges when targetType is changed manually in dropdown
          if (updates.targetType) {
            updated.sizeMode = 'range';
            if (updates.targetType === 'document') {
              updated.outputFormat = 'pdf';
              updated.minSizeKB = 50;
              updated.maxSizeKB = 100;
              updated.mode = 'compress';
            } else if (updates.targetType === 'signature') {
              updated.outputFormat = 'jpeg';
              updated.minSizeKB = 10;
              updated.maxSizeKB = 20;
              updated.resizeWidth = 400;
              updated.resizeHeight = 200;
            } else {
              updated.outputFormat = 'jpeg';
              updated.minSizeKB = 20;
              updated.maxSizeKB = 50;
              updated.resizeWidth = 350;
              updated.resizeHeight = 450;
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  const applyStandardFormTargets = () => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.targetType === 'signature') {
          return {
            ...item,
            mode: 'compress',
            sizeMode: 'range',
            minSizeKB: 10,
            maxSizeKB: 20,
          };
        }

        if (item.targetType === 'document') {
          return {
            ...item,
            mode: 'compress',
            sizeMode: 'range',
            minSizeKB: 100,
            maxSizeKB: 200,
          };
        }

        return {
          ...item,
          mode: 'compress',
          sizeMode: 'range',
          minSizeKB: 20,
          maxSizeKB: 50,
        };
      })
    );
    setZipBlob(null);
    setZipProgress('');
  };

  const removeItem = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl && !item.file.type.includes('pdf')) {
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
    setZipProgress('Starting batch compilation...');

    // Validate and auto-correct any invalid parameters on execute
    const validatedQueue = queue.map((item) => {
      const sanitizedName = sanitizeFileName(item.customName.trim() || 'file');
      if (item.mode === 'compress' && item.maxSizeKB <= item.minSizeKB) {
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

    const newResults: Record<string, BatchItemResult> = {};
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
      setZipProgress(`Processing item ${i + 1} of ${queue.length}: ${item.customName}`);

      let currentItem = item;
      const originalKB = item.file.size / 1024;
      const isPdf = item.file.type.includes('pdf') || item.file.name.toLowerCase().endsWith('.pdf');
      const isCompress = item.mode === 'compress';

      if (isCompress) {
        let isDrastic = false;
        if (isPdf) {
          // Small PDF files (under 350KB) are text-based. Aggressive compression may need rasterization.
          if (originalKB < 350 && item.maxSizeKB < originalKB) {
            isDrastic = true;
          } else if (item.maxSizeKB < originalKB * 0.4) {
            isDrastic = true;
          }
        } else if (!isPdf && item.maxSizeKB < originalKB * 0.15) {
          isDrastic = true;
        }

        if (isDrastic) {
          setZipProgress(`Awaiting quality decision for ${item.customName}...`);
          const choice = await new Promise<'proceed' | 'increase' | 'monochrome'>((res) => {
            setWarningModal({
              itemName: item.customName,
              itemId: item.id,
              targetKB: item.maxSizeKB,
              originalKB: Math.round(originalKB),
              isTextPdf: isPdf && originalKB < 350,
              resolve: res,
            });
          });

          if (choice === 'increase') {
            const increaseAmount = isPdf ? 45 : 25;
            const newMax = item.maxSizeKB + increaseAmount;
            const newMin = item.minSizeKB > 0 ? Math.max(10, item.minSizeKB + Math.round(increaseAmount * 0.4)) : 0;
            
            updateItemSettings(item.id, {
              maxSizeKB: newMax,
              minSizeKB: newMin
            });

            currentItem = {
              ...item,
              maxSizeKB: newMax,
              minSizeKB: newMin
            };
          }
        }
      }

      try {
        const processedFile = await AllInOneEngine.processItem(currentItem, () => {
          setResults((prev) => ({
            ...prev,
            [item.id]: {
              ...prev[item.id],
              status: 'processing',
            },
          }));
        });

        const previewUrl = processedFile.type.includes('pdf')
          ? ''
          : URL.createObjectURL(processedFile);

        setResults((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            status: 'completed',
            processedFile,
            previewUrl,
          },
        }));

        compiledFiles.push(processedFile);
      } catch (err: unknown) {
        console.error(`Error processing ${item.file.name}:`, err);
        setResults((prev) => ({
          ...prev,
          [item.id]: {
            ...prev[item.id],
            status: 'failed',
            error: err instanceof Error ? err.message : 'Processing failed',
          },
        }));
      }
    }

    if (compiledFiles.length > 0) {
      setZipProgress('Packing output documents inside ZIP compression structures...');
      try {
        const compiledZip = await AllInOneEngine.compileZip(compiledFiles);
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

  const triggerZipDownload = () => {
    if (!zipBlob) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipBlob);
    link.download = `freeSeva_package_${Date.now().toString().slice(-6)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerSingleDownload = (id: string) => {
    const res = results[id];
    if (!res || !res.processedFile) return;
    const link = document.createElement('a');
    link.href = res.previewUrl || URL.createObjectURL(res.processedFile);
    link.download = res.processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  const resetWorkspace = () => {
    queue.forEach((item) => {
      if (item.previewUrl && !item.file.type.includes('pdf')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
    Object.values(results).forEach((res) => {
      if (res.previewUrl) {
        URL.revokeObjectURL(res.previewUrl);
      }
    });
    setQueue([]);
    setResults({});
    setZipBlob(null);
    setZipProgress('');
  };

  return (
    <PageLayout
      title="All-in-One Package Workspace"
      description="Prepare and package multiple files concurrently. Upload Photos, Signatures, or PDFs, select modes, rename files, and download everything in one compiled ZIP."
    >
      <div className="flex flex-col gap-8">
        {/* Hidden File Input orchestrating upload triggers */}
        <input
          type="file"
          ref={hiddenInputRef}
          multiple
          className="hidden"
          accept="image/*,application/pdf"
          onChange={(e) => {
            if (e.target.files) {
              handleFileSelect(Array.from(e.target.files));
            }
          }}
        />

        {/* Initial Intake Cards grid if workspace is empty */}
        {queue.length === 0 && (
          <div className="flex flex-col gap-6">
            <div className="text-center max-w-xl mx-auto mb-4">
              <h2 className="text-lg font-black text-navy-950 font-display">Select standard document categories to add:</h2>
              <p className="text-xs text-navy-500 font-semibold mt-1">
                Each category pre-loads guidelines and settings to speed up your Indian exam/job applications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Photo scanner card */}
              <button
                type="button"
                onClick={() => handleUploadTrigger('photo')}
                className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-navy-200 hover:border-brand-500 bg-white hover:bg-brand-50/20 rounded-2xl shadow-sm transition-all duration-200 text-center cursor-pointer active:scale-[0.98]"
              >
                <div className="p-4 bg-navy-50 text-navy-600 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all duration-200">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <span className="font-bold text-navy-900 text-sm block">Add Photo Scan</span>
                <span className="text-[10px] text-navy-500 font-medium leading-relaxed mt-1 block">JPG / JPEG, Auto target: 20KB - 50KB limits</span>
              </button>

              {/* Signature scanner card */}
              <button
                type="button"
                onClick={() => handleUploadTrigger('signature')}
                className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-navy-200 hover:border-brand-500 bg-white hover:bg-brand-50/20 rounded-2xl shadow-sm transition-all duration-200 text-center cursor-pointer active:scale-[0.98]"
              >
                <div className="p-4 bg-navy-50 text-navy-600 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all duration-200">
                  <PenTool className="h-6 w-6" />
                </div>
                <span className="font-bold text-navy-900 text-sm block">Add Signature Scan</span>
                <span className="text-[10px] text-navy-500 font-medium leading-relaxed mt-1 block">Ink contrast boosted, Auto target: 10KB - 20KB limits</span>
              </button>

              {/* PDF Document card */}
              <button
                type="button"
                onClick={() => handleUploadTrigger('document')}
                className="group flex flex-col items-center justify-center p-6 border-2 border-dashed border-navy-200 hover:border-brand-500 bg-white hover:bg-brand-50/20 rounded-2xl shadow-sm transition-all duration-200 text-center cursor-pointer active:scale-[0.98]"
              >
                <div className="p-4 bg-navy-50 text-navy-600 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-brand-100 group-hover:text-brand-600 transition-all duration-200">
                  <FileText className="h-6 w-6" />
                </div>
                <span className="font-bold text-navy-900 text-sm block">Add PDF Document</span>
                <span className="text-[10px] text-navy-500 font-medium leading-relaxed mt-1 block">Flattened structures, Auto target: 50KB - 100KB limits</span>
              </button>
            </div>
          </div>
        )}

        {/* Workspace Display */}
        {queue.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Queue Panel */}
            <div className="lg:col-span-9 flex flex-col gap-6">
              <Card className="flex flex-col gap-5">
                {/* Header with mini upload shortcuts */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-navy-100 pb-4 gap-4">
                  <div>
                    <span className="text-sm font-black text-navy-900 font-display">Workspace Grid</span>
                    <span className="ml-2 bg-brand-50 border border-brand-150 text-brand-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {queue.length} Queue Items
                    </span>
                  </div>

                  {/* Smaller toolbar triggers */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleUploadTrigger('photo')}
                      className="px-2.5 py-1.5 bg-navy-50 hover:bg-navy-100 border border-navy-200 text-[10px] font-bold rounded-lg text-navy-700 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <ImageIcon className="h-3 w-3 text-navy-500" /> + Photo
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUploadTrigger('signature')}
                      className="px-2.5 py-1.5 bg-navy-50 hover:bg-navy-100 border border-navy-200 text-[10px] font-bold rounded-lg text-navy-700 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <PenTool className="h-3 w-3 text-navy-500" /> + Signature
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUploadTrigger('document')}
                      className="px-2.5 py-1.5 bg-navy-50 hover:bg-navy-100 border border-navy-200 text-[10px] font-bold rounded-lg text-navy-700 flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <FileText className="h-3 w-3 text-navy-500" /> + PDF
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/40 p-3 select-none">
                  <span className="text-[10px] font-black uppercase tracking-wider text-brand-800 mr-1">
                    Quick Package
                  </span>
                  <button
                    type="button"
                    onClick={applyStandardFormTargets}
                    disabled={isProcessing}
                    className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-brand-200 bg-white text-brand-800 hover:bg-brand-100 disabled:opacity-50"
                  >
                    Standard Form Targets
                  </button>
                  <span className="text-[10px] font-semibold text-navy-500">
                    Photo 20-50KB, Signature 10-20KB, PDF 100-200KB
                  </span>
                </div>

                {/* Queue list container with Horizontal Scroll fallback */}
                <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                  <div className="flex flex-col gap-4 pr-1">
                    {queue.map((item) => {
                      const result = results[item.id];
                      return (
                        <div
                          key={item.id}
                          className="flex flex-col xl:flex-row xl:items-center justify-between p-4 bg-navy-50/70 border border-navy-200 rounded-xl hover:bg-navy-50 transition-all gap-4 w-full xl:min-w-max animate-fadeIn"
                        >
                          {/* Left Group: Thumbnail + Output Name Name (Keeps side-by-side even on mobile) */}
                          <div className="flex items-center gap-3.5 w-full xl:w-auto">
                            <div className="w-12 h-12 rounded-lg bg-navy-200 flex-shrink-0 overflow-hidden border border-navy-300 flex items-center justify-center shadow-sm relative">
                              {item.previewUrl ? (
                                <img
                                  src={item.previewUrl}
                                  alt="preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : item.file.type.includes('pdf') ? (
                                <FileText className="h-5 w-5 text-navy-500" />
                              ) : (
                                <ImageIcon className="h-5 w-5 text-navy-500" />
                              )}
                              <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.2 select-none" title={`Original file size: ${formatBytes(item.file.size)}`}>
                                {formatBytes(item.file.size)}
                              </span>
                            </div>

                            {/* Editable Name option to rewrite existing names */}
                            <div className="flex-grow xl:flex-grow-0 flex flex-col gap-0.5 min-w-[130px] xl:min-w-[150px]">
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
                              {/* Visual Current Size Indicator under editable name block */}
                              <div className="text-[10px] text-navy-500 mt-1 font-semibold flex flex-wrap items-center gap-1.5 select-none">
                                <span>Orig: <strong className="text-navy-850">{formatBytes(item.file.size)}</strong></span>
                                {result?.processedFile && result.status === 'completed' && (
                                  <>
                                    <span className="text-navy-300 font-normal">•</span>
                                    <span className="text-brand-700 bg-brand-50 border border-brand-100 rounded px-1 flex items-center gap-0.5 animate-fadeIn">
                                      Current: <strong className="font-extrabold">{formatBytes(result.processedFile.size)}</strong>
                                    </span>
                                    {result.processedFile.size >= item.file.size && (item.file.type.includes('pdf') || item.file.name.toLowerCase().endsWith('.pdf')) && (
                                      <span className="text-[9px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-1 font-extrabold" title="This text-based PDF is already highly optimized. Further compression would inflate its size, so the original was kept for best quality and size.">
                                        Original Kept
                                      </span>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Middle Group: Settings (Stacked grid on mobile, horizontal columns on desktop) */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:flex xl:flex-row xl:items-center xl:justify-between xl:w-auto xl:gap-6 flex-1 border-t xl:border-t-0 border-navy-100/70 pt-3 xl:pt-0">
                            
                            {/* File Type auto detected */}
                            <div>
                              <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1.5 select-none">
                                File Type (Auto)
                              </label>
                              <div className="flex items-center">
                                <span className={`px-2.5 py-1.5 text-[11px] font-extrabold uppercase rounded-lg border tracking-wide select-none ${
                                  item.file.type.includes('pdf') || item.file.name.endsWith('.pdf')
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : item.file.type.includes('png') || item.file.name.endsWith('.png')
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                    : item.file.type.includes('webp') || item.file.name.endsWith('.webp')
                                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                                    : 'bg-sky-50 text-sky-700 border-sky-200'
                                }`}>
                                  {item.file.type.includes('pdf') || item.file.name.endsWith('.pdf') ? 'PDF Document' :
                                   item.file.type.includes('png') || item.file.name.endsWith('.png') ? 'PNG Image' :
                                   item.file.type.includes('webp') || item.file.name.endsWith('.webp') ? 'WEBP Image' : 'JPG Image'}
                                </span>
                              </div>
                            </div>

                            {/* Operation select: compress or resize */}
                            <div>
                              <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1">
                                Operation Mode
                              </label>
                              <select
                                value={item.mode}
                                onChange={(e) => updateItemSettings(item.id, { mode: e.target.value as BatchItem['mode'] })}
                                disabled={isProcessing || item.targetType === 'document'}
                                className="w-full px-2 py-1 text-[11px] font-bold bg-white border border-navy-200 rounded-lg cursor-pointer disabled:bg-navy-100 disabled:text-navy-400 text-navy-800"
                              >
                                <option value="compress">Compress to size</option>
                                <option value="resize">Resize dimensions</option>
                              </select>
                            </div>

                            {/* Custom Parameters column */}
                            <div className="col-span-2">
                              {item.mode === 'compress' ? (
                                <div className="flex flex-col gap-1">
                                  <div className="flex justify-between items-center max-w-[175px]">
                                    <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider select-none">
                                      Size Target
                                    </label>
                                    <div className="flex bg-navy-150 border border-navy-200 rounded p-0.5">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const prevMax = item.maxSizeKB || 50;
                                          updateItemSettings(item.id, {
                                            sizeMode: 'range',
                                            minSizeKB: Math.max(5, Math.floor(prevMax * 0.4))
                                          });
                                        }}
                                        className={`text-[8px] font-extrabold rounded px-1 tracking-wide uppercase select-none transition-all cursor-pointer ${
                                          (item.sizeMode || 'range') === 'range'
                                            ? 'text-brand-700 bg-white shadow-xs'
                                            : 'text-navy-500 hover:text-navy-700 bg-transparent'
                                        }`}
                                      >
                                        Range
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateItemSettings(item.id, {
                                            sizeMode: 'single',
                                            minSizeKB: 0
                                          });
                                        }}
                                        className={`text-[8px] font-extrabold rounded px-1 tracking-wide uppercase select-none transition-all cursor-pointer ${
                                          item.sizeMode === 'single'
                                            ? 'text-brand-700 bg-white shadow-xs'
                                            : 'text-navy-500 hover:text-navy-700 bg-transparent'
                                        }`}
                                      >
                                        Single
                                      </button>
                                    </div>
                                  </div>

                                  {(item.sizeMode || 'range') === 'range' ? (
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 bg-white border border-navy-200 rounded-lg px-2 py-0.5 max-w-[195px]">
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
                                        className="w-14 px-1.5 py-0.5 text-center focus:outline-none font-bold text-brand-700 text-[11px]"
                                        placeholder="Max"
                                      />
                                      <span className="text-[10px] text-navy-400 uppercase font-bold select-none ml-auto pr-0.5">KB</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 bg-white border border-navy-200 rounded-lg px-2 py-0.5 max-w-[195px]">
                                      <span className="text-[10px] text-navy-400 font-bold select-none px-0.5">Under</span>
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
                              ) : (
                                <div>
                                  <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1">
                                    Dimensions resize parameters
                                  </label>
                                  <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1 bg-white border border-navy-200 rounded-lg px-1.5 py-0.5 max-w-[185px]">
                                      <input
                                        type="number"
                                        value={item.resizeWidth}
                                        onChange={(e) => updateItemSettings(item.id, { resizeWidth: Math.max(1, parseInt(e.target.value, 10) || 0) })}
                                        disabled={isProcessing}
                                        className="w-9 px-0.5 py-0.5 text-center focus:outline-none text-[11px] font-bold text-brand-750"
                                      />
                                      <span className="text-navy-300 font-normal">x</span>
                                      <input
                                        type="number"
                                        value={item.resizeHeight}
                                        onChange={(e) => updateItemSettings(item.id, { resizeHeight: Math.max(1, parseInt(e.target.value, 10) || 0) })}
                                        disabled={isProcessing}
                                        className="w-9 px-0.5 py-0.5 text-center focus:outline-none text-[11px] font-bold text-brand-750"
                                      />
                                      <select
                                        value={item.resizeUnit}
                                        onChange={(e) => updateItemSettings(item.id, { resizeUnit: e.target.value as BatchItem['resizeUnit'] })}
                                        disabled={isProcessing}
                                        className="text-[10px] bg-transparent outline-none cursor-pointer text-navy-600 ml-1 font-semibold"
                                      >
                                        <option value="px">px</option>
                                        <option value="cm">cm</option>
                                        <option value="inch">in</option>
                                      </select>
                                      <button
                                        type="button"
                                        onClick={() => updateItemSettings(item.id, { maintainAspectRatio: !item.maintainAspectRatio })}
                                        disabled={isProcessing}
                                        className={`ml-1 text-[9px] font-bold rounded px-1 transition-all ${
                                          item.maintainAspectRatio ? 'text-brand-600 bg-brand-50' : 'text-navy-400 bg-navy-100'
                                        }`}
                                        title={item.maintainAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                                      >
                                        {item.maintainAspectRatio ? 'Lock' : 'Free'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Format & Actions Area (Enclosed perfectly in card border) */}
                          <div className="flex flex-row xl:flex-col items-center justify-end xl:items-end gap-3.5 border-t xl:border-t-0 border-navy-100/70 pt-3 xl:pt-0 min-w-[140px] w-full xl:w-auto">
                            
                            {/* Output Format Select */}
                            <div className="text-right">
                              <label className="block text-[8px] font-bold text-navy-400 uppercase tracking-wider mb-0.5">
                                Format
                              </label>
                              <select
                                value={item.outputFormat}
                                onChange={(e) => updateItemSettings(item.id, { outputFormat: e.target.value as BatchItem['outputFormat'] })}
                                disabled={isProcessing || item.targetType === 'document'}
                                className="px-1.5 py-0.5 text-[10px] font-bold bg-white border border-navy-200 rounded cursor-pointer disabled:bg-navy-100 disabled:text-navy-400 text-navy-850 font-semibold"
                              >
                                {item.targetType === 'document' ? (
                                  <option value="pdf">PDF</option>
                                ) : (
                                  <>
                                    <option value="jpeg">JPG</option>
                                    <option value="png">PNG</option>
                                  </>
                                )}
                              </select>
                            </div>

                            {/* Row Status & Downloads */}
                            <div className="flex items-center gap-1.5">
                              {result && (
                                <div className="flex items-center gap-1 select-none">
                                  {result.status === 'processing' && (
                                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded-full flex items-center gap-0.5">
                                      <Spinner size="sm" /> Run
                                    </span>
                                  )}
                                  {result.status === 'completed' && (
                                    <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 border border-brand-100 rounded-full flex items-center gap-0.5" title={result.processedFile ? `Processed size: ${formatBytes(result.processedFile.size)}` : ''}>
                                      <CheckCircle2 className="h-3 w-3 text-brand-600" /> Done
                                    </span>
                                  )}
                                  {result.status === 'failed' && (
                                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-100 rounded-full flex items-center gap-0.5" title={result.error}>
                                      <XCircle className="h-3 w-3" /> Error
                                    </span>
                                  )}
                                </div>
                              )}

                              {result?.status === 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => triggerSingleDownload(item.id)}
                                  className="px-3 py-1.5 text-xs text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 font-bold flex items-center justify-center gap-1.5 w-full xl:w-auto mt-2 xl:mt-0"
                                  title="Download compiled file"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                disabled={isProcessing}
                                className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-655 border border-red-100 rounded disabled:opacity-50"
                                title="Delete row"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>

                          </div>

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Footer buttons inside card */}
                <div className="mt-4 border-t border-navy-150 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="flex gap-2 items-center text-xs font-semibold text-navy-500 select-none">
                    <HelpCircle className="h-4 w-4 text-brand-500" />
                    <span>Click 'Compile Package' to execute sizes/dimensions resizing.</span>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      onClick={resetWorkspace}
                      disabled={isProcessing}
                      className="border border-navy-200 font-bold"
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="primary"
                      onClick={executeBatch}
                      disabled={isProcessing || queue.length === 0}
                      className="flex items-center justify-center gap-1.5 font-bold"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Compile Package
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Status Panel */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              {/* ZIP Panel */}
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
                      <span>ZIP Compiled!</span>
                    </div>

                    <div className="text-xs text-navy-600 font-semibold bg-navy-50 rounded-xl p-3 border border-navy-100 flex justify-between select-none">
                      <span>Total ZIP footprint:</span>
                      <span className="font-bold text-brand-700">{formatBytes(zipBlob.size)}</span>
                    </div>

                    {queue.length === 1 ? (
                      <div className="flex flex-col gap-2.5">
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                          onClick={() => triggerSingleDownload(queue[0].id)}
                        >
                          <Download className="h-4 w-4" />
                          Download File
                        </Button>
                        <Button
                          variant="outline"
                          size="md"
                          className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-white"
                          onClick={triggerZipDownload}
                        >
                          <Download className="h-4 w-4" />
                          Download as ZIP Archive
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                        onClick={triggerZipDownload}
                      >
                        <Download className="h-4 w-4" />
                        Download ZIP Package
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10 text-navy-500 border-2 border-dashed border-navy-200 rounded-xl flex flex-col items-center justify-center select-none">
                    <Folder className="h-10 w-10 text-navy-300 mb-2 animate-pulse" />
                    <span className="text-xs font-semibold">ZIP Output Ready</span>
                    <span className="text-[10px] text-navy-400 mt-1">Download ZIP populated upon compilation</span>
                  </div>
                )}
              </Card>

              {/* Secure badge */}
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
                  👉 <strong>Tip</strong>: Increasing the limit by 25–45 KB will allow a cleaner compression profile with perfect legibility while still keeping your file highly optimized.
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
                  className="flex-1 px-4 py-2.5 bg-navy-100 hover:bg-navy-200 text-navy-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center select-none"
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
                  className="flex-1 px-4 py-2.5 bg-navy-50 hover:bg-navy-100 border border-navy-250 text-navy-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center select-none"
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
