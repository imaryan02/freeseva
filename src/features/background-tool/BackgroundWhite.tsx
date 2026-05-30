import React, { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { BackgroundWhiteEngine } from '../../utils/engines/BackgroundWhiteEngine';
import { 
  Download, 
  ShieldCheck, 
  FileCheck,
  FileEdit,
  Trash2,
  Folder,
  Play,
  CheckCircle2,
  XCircle,
  HelpCircle,
  UploadCloud,
  ImageIcon,
  Sparkles,
  Pipette,
  Sun
} from 'lucide-react';

interface BackgroundBatchItem {
  id: string;
  file: File;
  customName: string;
  mode: 'lightness' | 'chromakey';
  tolerance: number;
  targetColor: { r: number; g: number; b: number } | null;
  imageSrc: string;
  previewUrl: string;
}

interface BackgroundBatchItemResult {
  id: string;
  originalFile: File;
  processedFile: File | null;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error?: string;
  previewUrl?: string;
}

export const BackgroundWhite: React.FC = () => {
  const [queue, setQueue] = useState<BackgroundBatchItem[]>([]);
  const [results, setResults] = useState<Record<string, BackgroundBatchItemResult>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);
  const [zipProgress, setZipProgress] = useState<string>('');

  const imageRef = useRef<HTMLImageElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const activeItem = queue.find((item) => item.id === activeId);
  const activeResult = activeId ? results[activeId] : null;

  const sanitizeFileName = (name: string): string => {
    return name.replace(/[\\/:*?"<>|]/g, '_');
  };

  const handleUploadTrigger = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
      hiddenInputRef.current.click();
    }
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image element'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files: File[]) => {
    const newItems: BackgroundBatchItem[] = [];

    for (const file of files) {
      const previewUrl = URL.createObjectURL(file);
      
      const dotIndex = file.name.lastIndexOf('.');
      const initialName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
      const cleanName = sanitizeFileName(initialName);

      const imageSrc = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        customName: cleanName,
        mode: 'lightness',
        tolerance: 30,
        targetColor: null,
        imageSrc,
        previewUrl,
      });
    }

    setQueue((prev) => {
      const updated = [...prev, ...newItems];
      if (updated.length > 0 && !activeId) {
        setActiveId(updated[0].id);
      }
      return updated;
    });
    setZipBlob(null);
    setZipProgress('');
  };

  const updateItemSettings = (id: string, updates: Partial<BackgroundBatchItem>) => {
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
      const filtered = prev.filter((i) => i.id !== id);
      if (activeId === id) {
        setActiveId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
    setResults((prev) => {
      const updated = { ...prev };
      delete updated[id];
      return updated;
    });
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!activeItem || activeItem.mode !== 'chromakey' || !imageRef.current) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const naturalX = Math.min(img.naturalWidth - 1, Math.max(0, Math.floor((x / rect.width) * img.naturalWidth)));
    const naturalY = Math.min(img.naturalHeight - 1, Math.max(0, Math.floor((y / rect.height) * img.naturalHeight)));

    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      try {
        const pixelData = ctx.getImageData(naturalX, naturalY, 1, 1).data;
        const color = { r: pixelData[0], g: pixelData[1], b: pixelData[2] };
        
        updateItemSettings(activeItem.id, { targetColor: color });
      } catch (err) {
        console.error('Error grabbing pixel color:', err);
      }
    }
  };

  // Debounced auto whitening for active item to make UI responsive
  useEffect(() => {
    if (!activeItem) return;

    const timer = setTimeout(async () => {
      if (activeItem.mode === 'chromakey' && !activeItem.targetColor) return;

      setResults((prev) => ({
        ...prev,
        [activeItem.id]: {
          id: activeItem.id,
          originalFile: activeItem.file,
          processedFile: prev[activeItem.id]?.processedFile || null,
          status: 'processing',
        }
      }));

      try {
        const cleanResult = await BackgroundWhiteEngine.whiten(activeItem.file, {
          mode: activeItem.mode,
          tolerance: activeItem.tolerance,
          targetColor: activeItem.targetColor || undefined,
        });

        setResults((prev) => ({
          ...prev,
          [activeItem.id]: {
            id: activeItem.id,
            originalFile: activeItem.file,
            processedFile: cleanResult.file,
            status: 'completed',
            previewUrl: cleanResult.previewUrl,
          }
        }));
      } catch (err: any) {
        console.error(err);
        setResults((prev) => ({
          ...prev,
          [activeItem.id]: {
            id: activeItem.id,
            originalFile: activeItem.file,
            processedFile: null,
            status: 'failed',
            error: err.message || 'Whitening failed',
          }
        }));
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [activeItem?.mode, activeItem?.tolerance, activeItem?.targetColor]);

  const executeBatch = async () => {
    if (queue.length === 0) return;
    setIsProcessing(true);
    setZipBlob(null);
    setZipProgress('Starting batch background whitening...');

    const validatedQueue = queue.map((item) => {
      const sanitizedName = sanitizeFileName(item.customName.trim() || 'image');
      return {
        ...item,
        customName: sanitizedName,
      };
    });
    setQueue(validatedQueue);

    const compiledFiles: File[] = [];

    for (let i = 0; i < validatedQueue.length; i++) {
      const item = validatedQueue[i];
      setZipProgress(`Whitening image ${i + 1} of ${queue.length}: ${item.customName}`);

      let targetColor = item.targetColor;
      if (item.mode === 'chromakey' && !targetColor) {
        try {
          const img = await loadImage(item.file);
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const pixelData = ctx.getImageData(0, 0, 1, 1).data;
            targetColor = { r: pixelData[0], g: pixelData[1], b: pixelData[2] };
          }
        } catch (err) {
          console.error('Failed to get fallback target color:', err);
        }
      }

      setResults((prev) => ({
        ...prev,
        [item.id]: {
          id: item.id,
          originalFile: item.file,
          processedFile: prev[item.id]?.processedFile || null,
          status: 'processing',
        }
      }));

      try {
        const cleanResult = await BackgroundWhiteEngine.whiten(item.file, {
          mode: item.mode,
          tolerance: item.tolerance,
          targetColor: targetColor || undefined,
        });

        const ext = 'jpg';
        const finalName = `${item.customName}_whitebg.${ext}`;
        const renamedFile = new File([cleanResult.file], finalName, { type: cleanResult.file.type });

        setResults((prev) => ({
          ...prev,
          [item.id]: {
            id: item.id,
            originalFile: item.file,
            processedFile: renamedFile,
            status: 'completed',
            previewUrl: cleanResult.previewUrl,
          }
        }));

        compiledFiles.push(renamedFile);
      } catch (error: any) {
        console.error(`Whitening failed for ${item.customName}:`, error);
        setResults((prev) => ({
          ...prev,
          [item.id]: {
            id: item.id,
            originalFile: item.file,
            processedFile: null,
            status: 'failed',
            error: error.message || 'Whitening failed',
          }
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
      setZipProgress('No files were successfully processed.');
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
    link.download = 'WhiteBackground_package.zip';
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
    setActiveId(null);
    setZipBlob(null);
    setZipProgress('');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <PageLayout
      title="White Background Generator"
      description="Erase tinted paper backgrounds, clean grey photo margins, or select custom background colors to replace with solid white."
    >
      
      <input
        type="file"
        ref={hiddenInputRef}
        onChange={(e) => {
          if (e.target.files) {
            handleFileSelect(Array.from(e.target.files));
          }
        }}
        multiple
        accept="image/*"
        className="hidden"
      />

      {/* Empty State */}
      {queue.length === 0 && (
        <div className="max-w-4xl mx-auto">
          <DragDropUpload
            onFileSelect={handleFileSelect}
            accept="image/*"
            maxSizeMB={10}
            multiple={true}
            label="Upload Passport Photos or Scans"
            helperText="Drag & drop or browse to upload any standard image file (up to 10MB each)"
          />
          <div className="flex items-center justify-center gap-2 mt-6 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none max-w-md mx-auto">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Processing runs locally in your browser context. Absolutely private.</span>
          </div>
        </div>
      )}

      {/* Workspace Display */}
      {queue.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          {/* Left Grid Panel */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Card className="flex flex-col gap-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-navy-100 pb-4 gap-4 select-none">
                <div>
                  <span className="text-sm font-black text-navy-900 font-display">Workspace Grid</span>
                  <span className="ml-2 bg-emerald-50 border border-emerald-150 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">
                    {queue.length} {queue.length === 1 ? 'Image' : 'Images'}
                  </span>
                </div>

                {/* Add Image */}
                <div>
                  <button
                    type="button"
                    onClick={handleUploadTrigger}
                    disabled={isProcessing}
                    className="px-3 py-1.5 bg-navy-50 hover:bg-navy-100 border border-navy-200 text-[10px] font-bold rounded-lg text-navy-700 flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                  >
                    <UploadCloud className="h-3.5 w-3.5 text-navy-500" /> + Add Image
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
                        onClick={() => setActiveId(item.id)}
                        className={`flex flex-row items-center justify-between p-4 border rounded-xl transition-all gap-4 cursor-pointer ${
                          activeId === item.id 
                            ? 'border-brand-500 bg-brand-50/20 shadow-sm ring-1 ring-brand-500/10' 
                            : 'border-navy-200 bg-navy-50/70 hover:bg-navy-50'
                        }`}
                      >
                        {/* 1. Preview / Thumbnail */}
                        <div className="w-12 h-12 rounded-lg bg-navy-200 flex-shrink-0 overflow-hidden border border-navy-300 flex items-center justify-center shadow-sm relative select-none">
                          {item.previewUrl ? (
                            <img
                              src={item.previewUrl}
                              alt="preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-5 w-5 text-navy-500" />
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.2 select-none" title={`Original size: ${formatBytes(item.file.size)}`}>
                            {formatBytes(item.file.size)}
                          </span>
                        </div>

                        {/* 2. Output File Name */}
                        <div className="flex-1 flex flex-col gap-0.5 min-w-[130px]" onClick={(e) => e.stopPropagation()}>
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

                        {/* 3. File Type (Auto) */}
                        <div className="min-w-[80px] select-none">
                          <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">
                            Type
                          </label>
                          <span className="px-2 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border border-brand-200 bg-brand-50 text-brand-750 tracking-wide">
                            {item.file.type.includes('png') ? 'PNG' : (item.file.type.includes('webp') ? 'WEBP' : 'JPG')}
                          </span>
                        </div>

                        {/* 4. Cleaning Mode select */}
                        <div className="min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                          <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1.5 select-none">
                            Cleaning Mode
                          </label>
                          <select
                            value={item.mode}
                            onChange={(e) => {
                              const selectedMode = e.target.value as 'lightness' | 'chromakey';
                              updateItemSettings(item.id, { 
                                mode: selectedMode, 
                                tolerance: selectedMode === 'lightness' ? 30 : 12 
                              });
                            }}
                            disabled={isProcessing}
                            className="w-full px-2 py-1 text-[11px] font-bold bg-white border border-navy-200 rounded-lg cursor-pointer"
                          >
                            <option value="lightness">Auto Lightness</option>
                            <option value="chromakey">Color Picker</option>
                          </select>
                        </div>

                        {/* 5. Parameters & Tolerance slider */}
                        <div className="min-w-[150px] flex flex-col gap-1" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-between items-center text-[9px] font-bold text-navy-450 select-none">
                            <span>Tolerance: {item.tolerance}%</span>
                            {item.mode === 'chromakey' && (
                              <div 
                                className="h-3 w-3 rounded-full border border-navy-300 shadow-sm"
                                style={{
                                  backgroundColor: item.targetColor 
                                    ? `rgb(${item.targetColor.r},${item.targetColor.g},${item.targetColor.b})` 
                                    : 'transparent'
                                }}
                              />
                            )}
                          </div>
                          <input
                            type="range"
                            min={5}
                            max={item.mode === 'lightness' ? 90 : 40}
                            value={item.tolerance}
                            onChange={(e) => updateItemSettings(item.id, { tolerance: parseInt(e.target.value, 10) })}
                            disabled={isProcessing}
                            className="w-full h-1 bg-navy-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                          />
                          {item.mode === 'chromakey' && !item.targetColor && (
                            <span className="text-[8px] text-amber-600 font-bold select-none animate-pulse">
                              ⚠️ Select color on right canvas
                            </span>
                          )}
                        </div>

                        {/* 6. Row Actions */}
                        <div className="flex items-center gap-1.5 justify-end min-w-[80px]" onClick={(e) => e.stopPropagation()}>
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
                              title="Download white bg image"
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
                  <span>Click 'Wipe Backgrounds' to process background clearing and compile white images.</span>
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
                    Wipe Backgrounds
                  </Button>
                </div>
              </div>

            </Card>
          </div>

          {/* Right Status & Live Picker Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6 select-none">
            
            {/* Active Preview & Color Picker */}
            {activeItem && (
              <Card className="flex flex-col gap-4 animate-fadeIn">
                <h3 className="text-xs font-bold text-navy-850 uppercase tracking-wider border-b border-navy-100 pb-2.5 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-brand-600" />
                  {activeItem.mode === 'chromakey' ? 'Click background to pick color' : 'Active Item Preview'}
                </h3>

                {/* Loading / Rendering state */}
                {activeResult?.status === 'processing' && (
                  <div className="flex flex-col items-center justify-center h-[200px] border border-navy-200 rounded-lg bg-navy-50">
                    <Spinner size="md" label="Clearing color tints..." />
                  </div>
                )}

                {/* Show processed file preview if completed */}
                {activeResult?.status === 'completed' && activeResult.previewUrl && (
                  <div className="relative border border-navy-200 rounded-lg overflow-hidden bg-navy-100 flex items-center justify-center p-2 h-[200px]">
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                      backgroundImage: 'radial-gradient(#475569 1px, transparent 0)',
                      backgroundSize: '12px 12px',
                    }}></div>
                    <img
                      ref={imageRef}
                      src={activeResult.previewUrl}
                      alt="Whitened Result"
                      onClick={handleImageClick}
                      className={`max-h-[180px] object-contain z-10 ${activeItem.mode === 'chromakey' ? 'cursor-crosshair' : ''}`}
                      title={activeItem.mode === 'chromakey' ? 'Click to select another color' : ''}
                    />
                  </div>
                )}

                {/* Show original preview if idle, failed or color not selected yet */}
                {activeResult?.status !== 'processing' && activeResult?.status !== 'completed' && (
                  <div className="relative border border-navy-200 rounded-lg overflow-hidden bg-navy-100 flex items-center justify-center p-2 h-[200px]">
                    <img
                      ref={imageRef}
                      src={activeItem.imageSrc}
                      alt="Source capture"
                      onClick={handleImageClick}
                      className={`max-h-[180px] object-contain ${activeItem.mode === 'chromakey' ? 'cursor-crosshair border border-brand-400 border-dashed' : ''}`}
                      title={activeItem.mode === 'chromakey' ? 'Click to select background color' : ''}
                    />
                  </div>
                )}

                {/* Color picker tips */}
                <div className="text-[10px] font-semibold text-navy-500 leading-normal">
                  {activeItem.mode === 'lightness' ? (
                    <div className="flex gap-1.5 items-start">
                      <Sun className="h-3.5 w-3.5 text-brand-650 flex-shrink-0" />
                      <span>Sweeping pixels with lightness values matching your sensitivity. Ideal for scanner yellowing.</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-1.5 items-start">
                        <Pipette className="h-3.5 w-3.5 text-brand-650 flex-shrink-0" />
                        <span>Click anywhere on the preview canvas above to lock the background shade.</span>
                      </div>
                      {activeItem.targetColor ? (
                        <div className="flex justify-between items-center bg-navy-50 border border-navy-100 rounded-lg p-2 mt-1">
                          <span>Target color hue: <strong className="text-navy-800">RGB({activeItem.targetColor.r}, {activeItem.targetColor.g}, {activeItem.targetColor.b})</strong></span>
                          <div 
                            className="h-4 w-4 rounded-md border border-navy-200 shadow-inner"
                            style={{ backgroundColor: `rgb(${activeItem.targetColor.r},${activeItem.targetColor.g},${activeItem.targetColor.b})` }}
                          />
                        </div>
                      ) : (
                        <div className="text-center py-1 bg-amber-50 border border-amber-100 text-amber-700 font-bold rounded-lg mt-1 animate-pulse">
                          ⚠️ Click background in canvas above
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            )}

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

    </PageLayout>
  );
};

export default BackgroundWhite;
