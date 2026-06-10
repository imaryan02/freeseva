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
  Brain,
  Zap,
  RefreshCw,
} from 'lucide-react';

interface BackgroundBatchItem {
  id: string;
  file: File;
  customName: string;
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
  const [modelStatus, setModelStatus] = useState<'not_initialized' | 'loading' | 'ready' | 'error'>('not_initialized');
  const [modelProgress, setModelProgress] = useState<string>('');

  const hiddenInputRef = useRef<HTMLInputElement>(null);

  const activeItem = queue.find((item) => item.id === activeId);
  const activeResult = activeId ? results[activeId] : null;

  // If model is already warm, transition immediately to ready
  useEffect(() => {
    if (BackgroundWhiteEngine.preloaded) {
      setModelStatus('ready');
    }
  }, []);

  const initializeModel = () => {
    setModelStatus('loading');
    BackgroundWhiteEngine.preload((phase, pct) => {
      setModelProgress(`${phase}: ${pct}%`);
    })
      .then(() => {
        setModelStatus('ready');
        setModelProgress('');
      })
      .catch((err) => {
        console.error('Failed to initialize local AI model:', err);
        setModelStatus('error');
        setModelProgress('Model failed to load');
      });
  };

  const sanitizeFileName = (name: string): string => {
    return name.replace(/[\\/:*?"<>|]/g, '_');
  };

  const handleUploadTrigger = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.value = '';
      hiddenInputRef.current.click();
    }
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

  const processSingleItem = async (id: string) => {
    const item = queue.find((i) => i.id === id);
    if (!item) return;

    setResults((prev) => ({
      ...prev,
      [id]: {
        id,
        originalFile: item.file,
        processedFile: prev[id]?.processedFile || null,
        status: 'processing',
      }
    }));

    try {
      const cleanResult = await BackgroundWhiteEngine.whiten(item.file);
      const ext = 'jpg';
      const finalName = `${sanitizeFileName(item.customName.trim() || 'image')}_whitebg.${ext}`;
      const renamedFile = new File([cleanResult.file], finalName, { type: cleanResult.file.type });

      setResults((prev) => ({
        ...prev,
        [id]: {
          id,
          originalFile: item.file,
          processedFile: renamedFile,
          status: 'completed',
          previewUrl: cleanResult.previewUrl,
        }
      }));
    } catch (error: unknown) {
      console.error(`Whitening failed for ${item.customName}:`, error);
      setResults((prev) => ({
        ...prev,
        [id]: {
          id,
          originalFile: item.file,
          processedFile: null,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Background removal failed',
        }
      }));
    }
  };

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
      setZipProgress(`Removing background ${i + 1} of ${queue.length}: ${item.customName}`);

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
        const cleanResult = await BackgroundWhiteEngine.whiten(item.file);

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
      } catch (error: unknown) {
        console.error(`Whitening failed for ${item.customName}:`, error);
        setResults((prev) => ({
          ...prev,
          [item.id]: {
            id: item.id,
            originalFile: item.file,
            processedFile: null,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Background removal failed',
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
      } catch (zipErr: unknown) {
        console.error('ZIP generation failed:', zipErr);
        setZipProgress(`ZIP compilation error: ${zipErr instanceof Error ? zipErr.message : 'ZIP failed'}`);
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
      description="AI-powered person segmentation removes the background and replaces it with solid white. 100% local, private processing."
    >
      
      {modelStatus === 'not_initialized' && (
        <div className="max-w-xl mx-auto my-8 animate-fadeIn select-none">
          <Card className="p-8 border border-navy-150 shadow-md rounded-2xl flex flex-col gap-6 text-center">
            <div className="mx-auto bg-brand-50 border border-brand-100 p-4 rounded-full flex items-center justify-center animate-pulse">
              <Brain className="h-10 w-10 text-brand-600" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-extrabold text-navy-850 font-display">
                AI White Background Generator
              </h2>
              <p className="text-xs text-navy-500 font-semibold leading-relaxed">
                Remove backgrounds and generate passport-ready white backgrounds instantly inside your browser using advanced local AI model (ISNet).
              </p>
            </div>

            {/* Privacy & Safety Briefing - CRITICAL */}
            <div className="bg-emerald-50/40 border border-emerald-100/70 rounded-2xl p-5 text-left flex flex-col gap-3.5">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-800">🔒 100% Local & Secure Processing</h4>
                  <p className="text-[11px] text-emerald-750 font-semibold leading-normal mt-0.5">
                    Your images never leave your computer. All processing happens entirely within your browser context. Absolutely NO files or data are uploaded to any server.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-violet-650 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-violet-850">Local AI Processing</h4>
                  <p className="text-[11px] text-violet-750 font-semibold leading-normal mt-0.5">
                    Uses GPU acceleration when available and falls back to CPU processing on unsupported browsers.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Folder className="h-5 w-5 text-brand-650 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-brand-850">📦 Direct Browser Cache</h4>
                  <p className="text-[11px] text-brand-700 font-semibold leading-normal mt-0.5">
                    One-time AI engine download (~20MB) that caches directly in your browser. Future visits are instantaneous.
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onClick={initializeModel}
              className="w-full py-3.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Initialize Local AI Engine
            </Button>
          </Card>
        </div>
      )}

      {modelStatus === 'loading' && (
        <div className="max-w-xl mx-auto my-8 animate-fadeIn select-none">
          <Card className="p-8 border border-navy-150 shadow-md rounded-2xl flex flex-col gap-6 text-center">
            <div className="mx-auto bg-brand-50 border border-brand-100 p-4 rounded-full flex items-center justify-center animate-spin">
              <RefreshCw className="h-10 w-10 text-brand-600" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-extrabold text-navy-850 font-display">
                Preparing Local AI Engine...
              </h2>
              <p className="text-xs text-navy-500 font-semibold leading-relaxed">
                Please wait a few moments while we load and warm up the AI model weights. Your images are secure and will not be uploaded.
              </p>
            </div>

            {/* Spinner Progress bar */}
            <div className="flex flex-col gap-3 items-center mt-2">
              <Spinner size="md" />
              {modelProgress && (
                <div className="w-full flex flex-col gap-2 mt-2">
                  <div className="w-full bg-navy-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full rounded-full transition-all duration-300 ease-out"
                      style={{ 
                        width: `${
                          modelProgress.includes('%') 
                            ? Math.max(10, parseInt(modelProgress.split(':').pop() || '10'))
                            : 45
                        }%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-navy-500 font-extrabold tracking-wider uppercase">
                    {modelProgress}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3.5 text-left flex gap-2.5 items-center mt-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              <span className="text-[11px] text-emerald-850 font-bold leading-normal">
                🔒 Safe & Confidential: Process stays inside your browser. No server transfers.
              </span>
            </div>
          </Card>
        </div>
      )}

      {modelStatus === 'error' && (
        <div className="max-w-xl mx-auto my-8 animate-fadeIn select-none">
          <Card className="p-8 border border-red-150 bg-red-50/10 rounded-2xl flex flex-col gap-6 text-center">
            <div className="mx-auto bg-red-50 border border-red-100 p-4 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-650" />
            </div>
            
            <div className="flex flex-col gap-2">
              <h2 className="text-xl font-extrabold text-red-850 font-display">AI Engine Loading Failed</h2>
              <p className="text-xs text-red-600 font-semibold leading-relaxed">
                We encountered an issue downloading the model weights. Don&apos;t worry, you can retry or proceed directly to use fallback local processors.
              </p>
            </div>
            
            <div className="flex gap-4 mt-2">
              <Button
                variant="ghost"
                onClick={initializeModel}
                className="flex-1 border border-red-200 text-red-700 bg-white hover:bg-red-50 font-bold"
              >
                <RefreshCw className="h-4 w-4 mr-2" /> Retry Load
              </Button>
              <Button
                variant="primary"
                onClick={() => setModelStatus('ready')}
                className="flex-1 bg-red-600 hover:bg-red-750 font-bold text-white"
              >
                Enter anyway
              </Button>
            </div>
          </Card>
        </div>
      )}

      {(modelStatus === 'ready') && (
        <>
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
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <DragDropUpload
                onFileSelect={handleFileSelect}
                accept="image/*"
                maxSizeMB={10}
                multiple={true}
                label="Upload Passport Photos or Scans"
                helperText="Drag & drop or browse to upload any standard image file (up to 10MB each)"
              />

              {/* Model Status Banner */}
              <div className="flex items-center justify-center gap-2 mt-6 p-3 border border-emerald-100 bg-emerald-50/50 rounded-xl text-xs font-semibold text-emerald-800 select-none max-w-md mx-auto">
                <Zap className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>AI Model Ready - backgrounds will be removed locally</span>
              </div>

              <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none max-w-md mx-auto">
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
                      <Button
                        variant="ghost"
                        onClick={handleUploadTrigger}
                        disabled={isProcessing}
                        className="border border-brand-200 text-brand-700 bg-brand-50 hover:bg-brand-100 font-bold flex items-center gap-1.5 text-xs py-2 px-3"
                      >
                        <UploadCloud className="h-4 w-4" />
                        Add Images
                      </Button>
                    </div>
                  </div>

                  {/* Grid Rows Container with Horizontal Scroll fallback */}
                  <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
                    <div className="flex flex-col gap-4 pr-1">
                      {queue.map((item) => {
                        const result = results[item.id];
                        return (
                          <div
                            key={item.id}
                            onClick={() => setActiveId(item.id)}
                            className={`flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-xl transition-all gap-4 cursor-pointer w-full lg:min-w-max ${
                              activeId === item.id 
                                ? 'border-brand-500 bg-brand-50/20 shadow-sm ring-1 ring-brand-500/10' 
                                : 'border-navy-200 bg-navy-50/70 hover:bg-navy-50'
                            }`}
                          >
                            {/* Left Group: Thumbnail + Output Name */}
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
                                  <ImageIcon className="h-5 w-5 text-navy-500" />
                                )}
                                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.2 select-none" title={`Original size: ${formatBytes(item.file.size)}`}>
                                  {formatBytes(item.file.size)}
                                </span>
                              </div>

                              {/* 2. Output File Name */}
                              <div className="flex-1 lg:flex-initial flex flex-col gap-0.5 min-w-[130px] lg:min-w-[150px]" onClick={(e) => e.stopPropagation()}>
                                <span className="text-[9px] uppercase tracking-wider font-bold text-navy-450 select-none flex items-center gap-0.5">
                                  <FileEdit className="h-2.5 w-2.5" /> Output Name
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
                                      <span className="text-navy-300 font-normal select-none">|</span>
                                      <span className="text-brand-700 bg-brand-50 border border-brand-100 rounded px-1 flex items-center gap-0.5 animate-fadeIn">
                                        Final: <strong className="font-extrabold">{formatBytes(result.processedFile.size)}</strong>
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Middle Group: File Type Badge */}
                            <div className="flex items-center gap-4 w-full lg:w-auto border-t lg:border-t-0 border-navy-100/70 pt-3 lg:pt-0">
                              <div className="min-w-[80px] select-none">
                                <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">
                                  Type
                                </label>
                                <span className="inline-block px-2 py-1.5 text-[10px] font-extrabold uppercase rounded-lg border border-brand-200 bg-brand-50 text-brand-750 tracking-wide">
                                  {item.file.type.includes('png') ? 'PNG' : (item.file.type.includes('webp') ? 'WEBP' : 'JPG')}
                                </span>
                              </div>

                              <div className="min-w-[100px] select-none">
                                <label className="block text-[9px] font-bold text-navy-400 uppercase tracking-wider mb-1.5">
                                  Method
                                </label>
                                <span className="inline-block px-2 py-1.5 text-[10px] font-extrabold rounded-lg border border-violet-200 bg-violet-50 text-violet-700 tracking-wide flex items-center gap-1">
                                  <Brain className="h-3 w-3" /> AI Segmentation
                                </span>
                              </div>
                            </div>

                            {/* Right Group: Row Actions */}
                            <div className="flex items-center gap-2.5 justify-end w-full lg:w-auto lg:min-w-[135px] border-t lg:border-t-0 border-navy-100/70 pt-3 lg:pt-0" onClick={(e) => e.stopPropagation()}>
                              {result && result.status !== 'idle' ? (
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
                              ) : (
                                <span className="text-[10px] font-bold text-navy-500 bg-navy-100 px-2.5 py-0.5 border border-navy-200 rounded-full flex items-center gap-0.5 select-none">
                                  Ready
                                </span>
                              )}

                              {result?.status === 'completed' && (
                                <button
                                  type="button"
                                  onClick={() => triggerSingleDownload(item.id)}
                                  className="px-3 py-1.5 text-xs text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition-all cursor-pointer active:scale-95 font-bold flex items-center justify-center gap-1.5 w-full lg:w-auto mt-2 lg:mt-0"
                                  title="Download white bg image"
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  <span>Download</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                disabled={isProcessing}
                                className="p-1.5 text-red-500 hover:bg-red-50 hover:text-red-655 border border-red-100 rounded transition-all cursor-pointer active:scale-95 disabled:opacity-50"
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
                      <span>Click &apos;Create White Backgrounds&apos; to run AI segmentation and compile package ZIP.</span>
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
                        Create White Backgrounds
                      </Button>
                    </div>
                  </div>

                </Card>
              </div>

              {/* Right Status & Preview Panel */}
              <div className="lg:col-span-4 flex flex-col gap-6 select-none">
                
                {/* AI Model Status */}
                <Card className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-navy-850 uppercase tracking-wider border-b border-navy-100 pb-2.5 flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-violet-600" />
                    AI Engine Status
                  </h3>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold bg-emerald-50 border border-emerald-100 text-emerald-800">
                    <Zap className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="font-bold block">ISNet Model Ready</span>
                      <span className="text-[10px] text-emerald-600 leading-snug block">GPU when available - CPU fallback - cached locally</span>
                    </div>
                  </div>
                </Card>

                {/* Active Preview */}
                {activeItem && (
                  <Card className="flex flex-col gap-4 animate-fadeIn">
                    <h3 className="text-xs font-bold text-navy-850 uppercase tracking-wider border-b border-navy-100 pb-2.5 flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-brand-600" />
                      Background Removal Preview
                    </h3>

                    {/* Loading / Rendering state */}
                    {activeResult?.status === 'processing' && (
                      <div className="flex flex-col items-center justify-center h-[200px] border border-navy-200 rounded-lg bg-navy-50">
                        <Spinner size="md" label="Removing background..." />
                      </div>
                    )}

                    {/* Show processed file preview if completed */}
                    {activeResult?.status === 'completed' && activeResult.previewUrl && (
                      <div className="flex flex-col gap-3">
                        {/* Before / After labels */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-bold text-navy-500 uppercase tracking-wider text-center">Original</span>
                            <div className="relative border border-navy-200 rounded-lg overflow-hidden bg-navy-100 flex items-center justify-center p-1.5 h-[120px]">
                              <img
                                src={activeItem.imageSrc}
                                alt="Original"
                                className="max-h-[110px] object-contain"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-bold text-brand-600 uppercase tracking-wider text-center">White BG</span>
                            <div className="relative border border-brand-200 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1.5 h-[120px]">
                              <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
                                backgroundImage: 'radial-gradient(#475569 1px, transparent 0)',
                                backgroundSize: '10px 10px',
                              }}></div>
                              <img
                                src={activeResult.previewUrl}
                                alt="Whitened Result"
                                className="max-h-[110px] object-contain z-10"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Result info */}
                        <div className="text-[10px] font-semibold text-navy-500 bg-navy-50 border border-navy-100 rounded-lg p-2.5 flex justify-between">
                          <span>Size reduction:</span>
                          <span className="text-brand-700 font-bold">
                            {formatBytes(activeItem.file.size)} → {formatBytes(activeResult.processedFile?.size || 0)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Show original preview if idle or failed */}
                    {activeResult?.status !== 'processing' && activeResult?.status !== 'completed' && (
                      <div className="flex flex-col gap-3">
                        <div className="relative border border-navy-200 rounded-lg overflow-hidden bg-navy-100 flex items-center justify-center p-2 h-[200px] select-none">
                          <img
                            src={activeItem.imageSrc}
                            alt="Source capture"
                            className="max-h-[180px] object-contain"
                          />
                        </div>
                        <Button
                          variant="primary"
                          onClick={() => processSingleItem(activeItem.id)}
                          disabled={isProcessing}
                          className="w-full font-bold flex items-center justify-center gap-1.5 py-2 shadow-sm animate-fadeIn"
                        >
                          <Sparkles className="h-4 w-4" />
                          Whiten Background
                        </Button>
                      </div>
                    )}

                    {/* Info note */}
                    <div className="text-[10px] font-semibold text-navy-500 leading-normal">
                      <div className="flex gap-1.5 items-start">
                        <Brain className="h-3.5 w-3.5 text-violet-600 flex-shrink-0" />
                        <span>ISNet AI model automatically detects the person, removes the background, and applies a clean white replacement with edge decontamination.</span>
                      </div>
                    </div>

                    {/* Error state */}
                    {activeResult?.status === 'failed' && (
                      <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[10px] font-semibold animate-fadeIn">
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span>{activeResult.error || 'Background removal failed. Try a different photo.'}</span>
                      </div>
                    )}
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
                      <div className="flex items-center gap-2 font-bold text-navy-800">
                        {isProcessing && <Spinner size="sm" />}
                        <span>Status Logging</span>
                      </div>
                      <p className="font-semibold text-navy-500 leading-relaxed text-[11px]">{zipProgress}</p>
                    </div>
                  )}

                  {zipBlob ? (
                    <div className="flex flex-col gap-4 animate-fadeIn">
                      <div className="bg-emerald-50 border border-emerald-150 rounded-xl p-4 flex flex-col items-center justify-center text-center select-none">
                        <FileCheck className="h-10 w-10 text-emerald-600 mb-2" />
                        <span className="text-xs font-bold text-emerald-800">Package Compiled!</span>
                        <span className="text-[10px] text-emerald-600 mt-1 font-semibold">ZIP file is fully generated and ready.</span>
                      </div>

                      {queue.length === 1 ? (
                        <div className="flex flex-col gap-2.5 w-full">
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
        </>
      )}

    </PageLayout>
  );
};

export default BackgroundWhite;
