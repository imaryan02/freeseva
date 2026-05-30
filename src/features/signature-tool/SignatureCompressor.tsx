import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { SignatureCompressionEngine } from '../../utils/engines/SignatureCompressionEngine';
import type { SignatureProcessingOptions } from '../../utils/engines/SignatureCompressionEngine';
import { 
  Download, 
  ShieldCheck, 
  FileCheck,
  AlertTriangle,
  FileEdit,
  Trash2,
  Folder,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UploadCloud,
  ImageIcon
} from 'lucide-react';

interface SignatureBatchItem {
  id: string;
  file: File;
  customName: string;
  minSizeKB: number;
  maxSizeKB: number;
  sizeMode: 'range' | 'single';
  contrastBoost: boolean;
  threshold: number;
  outputFormat: 'png' | 'jpeg';
  preserveTransparency: boolean;
  previewUrl: string;
}

interface SignatureBatchItemResult {
  id: string;
  originalFile: File;
  processedFile: File | null;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error?: string;
  savingsPercentage?: number;
  width?: number;
  height?: number;
}

export const SignatureCompressor: React.FC = () => {
  const [queue, setQueue] = useState<SignatureBatchItem[]>([]);
  const [results, setResults] = useState<Record<string, SignatureBatchItemResult>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [zipProgress, setZipProgress] = useState<string>('');
  
  const [warningModal, setWarningModal] = useState<{
    itemName: string;
    targetKB: number;
    originalKB: number;
    resolve: (choice: 'proceed' | 'increase') => void;
  } | null>(null);

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const sanitizeFileName = (name: string): string => {
    return name.replace(/[\\/:*?"<>|]/g, '_');
  };

  const padBlob = (blob: Blob, minKB: number): Blob => {
    const minBytes = minKB * 1024;
    if (blob.size >= minBytes) {
      return blob;
    }
    const paddingSize = minBytes - blob.size;
    const padding = new Uint8Array(paddingSize);
    return new Blob([blob, padding], { type: blob.type });
  };

  const handleUploadTrigger = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
      hiddenInputRef.current.click();
    }
  };

  const handleFileSelect = async (files: File[]) => {
    const newItems: SignatureBatchItem[] = [];

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      
      const dotIndex = file.name.lastIndexOf('.');
      const initialName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      const cleanName = sanitizeFileName(initialName);

      const isPng = file.type === 'image/png' || file.name.endsWith('.png');

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        customName: cleanName,
        minSizeKB: 10,
        maxSizeKB: 20,
        sizeMode: 'range',
        contrastBoost: true,
        threshold: 165,
        outputFormat: isPng ? 'png' : 'jpeg',
        preserveTransparency: isPng,
        previewUrl,
      });
    }

    setQueue((prev) => [...prev, ...newItems]);
    setZipBlob(null);
    setZipProgress('');
  };

  const updateItemSettings = (id: string, updates: Partial<SignatureBatchItem>) => {
    setQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
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
    setZipProgress('Starting signature batch processing...');

    // Validate parameters
    const validatedQueue = queue.map((item) => {
      const sanitizedName = sanitizeFileName(item.customName.trim() || 'signature');
      if (item.maxSizeKB <= item.minSizeKB) {
        return {
          ...item,
          customName: sanitizedName,
          maxSizeKB: item.minSizeKB + 5,
        };
      }
      return {
        ...item,
        customName: sanitizedName,
      };
    });
    setQueue(validatedQueue);

    const newResults: Record<string, SignatureBatchItemResult> = {};
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
      setZipProgress(`Processing signature ${i + 1} of ${queue.length}: ${item.customName}`);

      let currentItem = item;
      const originalKB = item.file.size / 1024;
      const ext = item.outputFormat === 'png' ? 'png' : 'jpg';
      const finalName = `${item.customName}.${ext}`;

      let targetKB = item.maxSizeKB;
      let minKB = item.sizeMode === 'range' ? item.minSizeKB : 0;

      // drastic warning check
      let isDrastic = false;
      if (targetKB < originalKB * 0.1) {
        isDrastic = true;
      }

      if (isDrastic) {
        setZipProgress(`Awaiting quality decision for ${item.customName}...`);
        const choice = await new Promise<'proceed' | 'increase'>((res) => {
          setWarningModal({
            itemName: finalName,
            targetKB: targetKB,
            originalKB: Math.round(originalKB),
            resolve: res,
          });
        });

        if (choice === 'increase') {
          const increaseAmount = 15;
          const newMax = targetKB + increaseAmount;
          const newMin = minKB > 0 ? Math.max(5, minKB + Math.round(increaseAmount * 0.4)) : 0;
          
          updateItemSettings(item.id, {
            maxSizeKB: newMax,
            minSizeKB: newMin,
          });

          currentItem = {
            ...item,
            maxSizeKB: newMax,
            minSizeKB: newMin,
          };
          targetKB = newMax;
          minKB = newMin;
        }
      }

      try {
        let finalTargetKB = targetKB;
        if (minKB > 0 && targetKB > minKB) {
          finalTargetKB = minKB + (targetKB - minKB) * 0.8; // Target 80% up the range
        } else {
          finalTargetKB = targetKB * 0.9;
        }
        finalTargetKB = Math.max(3, finalTargetKB);

        const processingOptions: SignatureProcessingOptions = {
          contrastBoost: currentItem.contrastBoost,
          threshold: currentItem.threshold,
          outputFormat: currentItem.outputFormat,
          preserveTransparency: currentItem.outputFormat === 'png' && currentItem.preserveTransparency,
        };

        const compressionResult = await SignatureCompressionEngine.processAndCompress(
          currentItem.file,
          finalTargetKB,
          processingOptions
        );

        let finalFile = compressionResult.file;

        // Apply padding if below minimum limit
        if (currentItem.sizeMode === 'range' && minKB > 0 && finalFile.size < minKB * 1024) {
          const paddedBlob = padBlob(finalFile, minKB);
          finalFile = new File([paddedBlob], finalName, { type: finalFile.type });
        } else {
          finalFile = new File([finalFile], finalName, { type: finalFile.type });
        }

        const savingsPercentage = Math.max(
          0,
          Math.round(((currentItem.file.size - finalFile.size) / currentItem.file.size) * 100)
        );

        const updatedResult: SignatureBatchItemResult = {
          id: currentItem.id,
          originalFile: currentItem.file,
          processedFile: finalFile,
          status: 'completed',
          savingsPercentage,
          width: compressionResult.width,
          height: compressionResult.height,
        };

        setResults((prev) => ({
          ...prev,
          [currentItem.id]: updatedResult,
        }));

        compiledFiles.push(finalFile);
      } catch (error: any) {
        console.error(`Signature processing failed for ${item.customName}:`, error);
        setResults((prev) => ({
          ...prev,
          [item.id]: {
            id: item.id,
            originalFile: item.file,
            processedFile: null,
            status: 'failed',
            error: error.message || 'Processing failed',
          },
        }));
      }
    }

    if (compiledFiles.length > 0) {
      setZipProgress('Creating ZIP package...');
      try {
        const zip = new JSZip();
        compiledFiles.forEach((file) => {
          zip.file(file.name, file);
        });
        const content = await zip.generateAsync({ type: 'blob' });
        setZipBlob(content);
        setZipProgress('ZIP archive compiled successfully.');
      } catch (zipErr: any) {
        console.error('ZIP generation failed:', zipErr);
        setZipProgress(`ZIP compilation error: ${zipErr.message || 'ZIP failed'}`);
      }
    } else {
      setZipProgress('No files were successfully processed to bundle.');
    }

    setIsProcessing(false);
  };

  const triggerSingleDownload = (id: string) => {
    const result = results[id];
    if (result?.processedFile) {
      const url = URL.createObjectURL(result.processedFile);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.processedFile.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const triggerZipDownload = () => {
    if (!zipBlob) return;
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'SignatureCompressor_package.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
    const k = 1024;
    return (bytes / k).toFixed(2) + ' KB';
  };

  return (
    <PageLayout
      title="Signature Compressor"
      description="Clean scanner background noise, sharpen ink strokes, and compress signatures strictly below 10KB or 20KB."
    >
      
      {/* Hidden input for toolbar addition shortcut */}
      <input
        type="file"
        ref={hiddenInputRef}
        onChange={(e) => {
          if (e.target.files) {
            handleFileSelect(Array.from(e.target.files));
          }
        }}
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Empty State */}
      {queue.length === 0 && (
        <div className="max-w-4xl mx-auto">
          <DragDropUpload
            onFileSelect={handleFileSelect}
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={8}
            multiple={true}
            label="Upload Signature Captures"
            helperText="Drag & drop or browse to upload photos of your signatures (up to 8MB each)"
          />
          <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none max-w-md mx-auto">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Processed locally in browser memory. No data is shared.</span>
          </div>
        </div>
      )}

      {/* Workspace Display */}
      {queue.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          {/* Left Queue Panel */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <Card className="flex flex-col gap-5">
              
              {/* Header with count badge and add shortcuts */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-navy-100 pb-4 gap-4 select-none">
                <div>
                  <span className="text-sm font-black text-navy-900 font-display">Workspace Grid</span>
                  <span className="ml-2 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {queue.length} {queue.length === 1 ? 'Signature' : 'Signatures'}
                  </span>
                </div>

                {/* Add Signature button */}
                <div>
                  <button
                    type="button"
                    onClick={handleUploadTrigger}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-navy-50 hover:bg-navy-100 border border-navy-200 text-[10px] font-bold rounded-lg text-navy-700 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-navy-500" /> + Add Signature
                  </button>
                </div>
              </div>

              {/* Grid Rows Container with Horizontal Scroll fallback */}
              <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                <div className="flex flex-col gap-4 min-w-[760px] pr-1">
                  {queue.map((item) => {
                    const result = results[item.id];
                    return (
                      <div
                        key={item.id}
                        className="flex flex-row items-center justify-between p-4 bg-navy-50/70 border border-navy-200 rounded-xl hover:bg-navy-50 transition-all gap-4 animate-fadeIn"
                      >
                        {/* 1. Preview / Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-navy-200 flex-shrink-0 overflow-hidden border border-navy-300 flex items-center justify-center shadow-sm relative select-none">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt="preview"
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-navy-500" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.2 select-none" title={`Original size: ${formatBytes(item.file.size)}`}>
                            {formatBytes(item.file.size)}
                          </span>
                        </div>

                        {/* 2. Output File Name */}
                        <div className="flex-1 flex flex-col gap-0.5 min-w-[130px]">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-navy-450 select-none flex items-center gap-0.5">
                            <FileEdit className="h-2.5 w-2.5" /> Output Name
                          </span>
                          <input
                            type="text"
                            value={item.customName}
                            onChange={(e) => updateItemSettings(item.id, { customName: sanitizeFileName(e.target.value) })}
                            disabled={isProcessing}
                            className="px-2 py-1 text-xs border border-navy-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-500 font-bold text-navy-800 bg-white max-w-[140px]"
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

                        {/* 3. File Type Badge */}
                        <div className="min-w-[80px] select-none">
                          <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">
                            Type
                          </label>
                          <span className="px-2 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border border-brand-200 bg-brand-50 text-brand-750 tracking-wide">
                            {item.file.type.includes('png') ? 'PNG' : (item.file.type.includes('webp') ? 'WEBP' : 'JPG')}
                          </span>
                        </div>

                        {/* 4. Contrast & Ink Boost parameters */}
                        <div className="min-w-[140px] flex flex-col gap-1">
                          <label className="flex items-center gap-1.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={item.contrastBoost}
                              onChange={(e) => updateItemSettings(item.id, { contrastBoost: e.target.checked })}
                              disabled={isProcessing}
                              className="h-3.5 w-3.5 rounded border-navy-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                            />
                            <span className="text-[10px] font-bold text-navy-800">Clean & Sharp Ink</span>
                          </label>
                          {item.contrastBoost && (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex justify-between items-center text-[8px] text-navy-450 font-bold select-none">
                                <span>Tolerance:</span>
                                <span className="font-black text-navy-800">{item.threshold}</span>
                              </div>
                              <input
                                type="range"
                                min={100}
                                max={220}
                                value={item.threshold}
                                onChange={(e) => updateItemSettings(item.id, { threshold: parseInt(e.target.value, 10) })}
                                disabled={isProcessing}
                                className="w-full h-1 bg-navy-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                              />
                            </div>
                          )}
                        </div>

                        {/* 5. Size Target */}
                        <div className="flex-grow-0 min-w-[185px]">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between items-center max-w-[180px] select-none">
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
                              <div className="flex items-center gap-1 bg-white border border-navy-200 rounded-lg px-2 py-0.5 max-w-[180px]">
                                <input
                                  type="number"
                                  value={item.minSizeKB}
                                  onChange={(e) => updateItemSettings(item.id, { minSizeKB: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                                  onBlur={() => {
                                    if (item.maxSizeKB <= item.minSizeKB) {
                                      updateItemSettings(item.id, { maxSizeKB: item.minSizeKB + 5 });
                                    }
                                  }}
                                  disabled={isProcessing}
                                  className="w-12 px-1 py-0.5 text-center focus:outline-none text-[11px]"
                                  placeholder="Min"
                                />
                                <span className="text-navy-300 font-normal select-none px-0.5">to</span>
                                <input
                                  type="number"
                                  value={item.maxSizeKB}
                                  onChange={(e) => updateItemSettings(item.id, { maxSizeKB: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                                  onBlur={() => {
                                    if (item.maxSizeKB <= item.minSizeKB) {
                                      updateItemSettings(item.id, { maxSizeKB: item.minSizeKB + 5 });
                                    }
                                  }}
                                  disabled={isProcessing}
                                  className="w-12 px-1 py-0.5 text-center focus:outline-none font-bold text-brand-750 text-[11px]"
                                  placeholder="Max"
                                />
                                <span className="text-[9px] text-navy-400 uppercase font-bold select-none ml-auto pr-0.5">KB</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-xs font-semibold text-navy-700 bg-white border border-navy-200 rounded-lg px-2 py-0.5 max-w-[180px]">
                                <span className="text-[10px] text-navy-450 font-bold select-none px-0.5">Under</span>
                                <input
                                  type="number"
                                  value={item.maxSizeKB}
                                  onChange={(e) => updateItemSettings(item.id, { maxSizeKB: Math.max(3, parseInt(e.target.value, 10) || 3) })}
                                  disabled={isProcessing}
                                  className="w-14 px-1 py-0.5 text-center focus:outline-none font-bold text-brand-700 text-[11px]"
                                  placeholder="Limit"
                                />
                                <span className="text-[10px] text-navy-400 uppercase font-bold select-none ml-auto pr-0.5">KB</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 6. Output Format */}
                        <div className="min-w-[85px] flex flex-col gap-1">
                          <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider select-none">
                            Format
                          </label>
                          <select
                            value={item.outputFormat}
                            onChange={(e) => {
                              const fmt = e.target.value as 'png' | 'jpeg';
                              updateItemSettings(item.id, { 
                                outputFormat: fmt, 
                                preserveTransparency: fmt === 'png' ? item.preserveTransparency : false 
                              });
                            }}
                            disabled={isProcessing}
                            className="w-full px-1.5 py-1 text-[11px] font-bold bg-white border border-navy-200 rounded-lg cursor-pointer"
                          >
                            <option value="jpeg">JPG</option>
                            <option value="png">PNG</option>
                          </select>
                          {item.outputFormat === 'png' && (
                            <label className="flex items-center gap-1 cursor-pointer select-none mt-1">
                              <input
                                type="checkbox"
                                checked={item.preserveTransparency}
                                onChange={(e) => updateItemSettings(item.id, { preserveTransparency: e.target.checked })}
                                disabled={isProcessing}
                                className="h-3 w-3 rounded border-navy-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                              />
                              <span className="text-[9px] font-semibold text-navy-700">Keep Alpha</span>
                            </label>
                          )}
                        </div>

                        {/* 7. Row Actions */}
                        <div className="flex items-center gap-1.5 justify-end min-w-[80px]">
                          {result && (
                            <div className="flex items-center gap-1 select-none">
                              {result.status === 'processing' && (
                                <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 border border-amber-100 rounded-full flex items-center gap-0.5">
                                  <Spinner size="sm" />
                                </span>
                              )}
                              {result.status === 'completed' && (
                                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 border border-brand-100 rounded-full flex items-center gap-0.5 animate-fadeIn" title={result.savingsPercentage !== undefined ? `Savings: -${result.savingsPercentage}% • Dimensions: ${result.width}x${result.height}px` : ''}>
                                  <CheckCircle2 className="h-3.5 w-3.5 text-brand-600" /> Done
                                </span>
                              )}
                              {result.status === 'failed' && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 border border-red-100 rounded-full flex items-center gap-0.5" title={result.error}>
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
                              title="Download compressed signature"
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

              {/* Grid Footer Actions */}
              <div className="mt-4 border-t border-navy-150 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-2 items-center text-xs font-semibold text-navy-500 select-none">
                  <HelpCircle className="h-4 w-4 text-navy-400" />
                  <span>Click 'Process Signatures' to clean scanner background tints and apply size targets.</span>
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
                    Process Signatures
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
                <div className="bg-navy-50 border border-navy-155 rounded-xl p-3.5 flex flex-col gap-2 animate-fadeIn text-xs text-navy-600 select-none">
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
                    <span>ZIP footprint:</span>
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
                <div className="text-center py-10 text-navy-505 border-2 border-dashed border-navy-200 rounded-xl flex flex-col items-center justify-center select-none">
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
              <span>
                To shrink <strong className="text-navy-900">"{warningModal.itemName}"</strong> from <strong className="text-navy-850">{warningModal.originalKB} KB</strong> down to under <strong className="text-brand-700">{warningModal.targetKB} KB</strong>, the engine must apply aggressive compression. Text may become blurry or hard to read.
              </span>
            </p>

            <div className="bg-navy-50 border border-navy-150 rounded-xl p-3 text-[10px] text-navy-500 font-semibold leading-relaxed">
              <span>
                👉 <strong>Tip</strong>: Increasing the limit by 15 KB will allow a cleaner compression profile with perfect legibility while still keeping your file highly optimized.
              </span>
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
                  className="flex-grow px-4 py-2.5 bg-navy-100 hover:bg-navy-200 text-navy-700 font-bold text-xs rounded-xl transition-all cursor-pointer text-center select-none font-semibold animate-fadeIn"
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
                  className="flex-grow px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center select-none font-semibold shadow-md active:scale-95 animate-fadeIn"
                >
                  Increase Size Limit (+15KB)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </PageLayout>
  );
};
