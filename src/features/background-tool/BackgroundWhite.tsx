import React, { useState, useRef, useEffect } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { BackgroundWhiteEngine } from '../../utils/engines/BackgroundWhiteEngine';
import type { WhiteningOptions, WhiteningResult } from '../../utils/engines/BackgroundWhiteEngine';
import { ImageCompressionEngine } from '../../utils/engines/ImageCompressionEngine';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck,
  Sparkles,
  Pipette,
  Sun
} from 'lucide-react';

export const BackgroundWhite: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Cleaner configurations
  const [mode, setMode] = useState<'lightness' | 'chromakey'>('lightness');
  const [tolerance, setTolerance] = useState<number>(30); // 0-100 scale
  const [targetColor, setTargetColor] = useState<{ r: number; g: number; b: number } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<WhiteningResult | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setResult(null);
      setTargetColor(null);

      const dims = await ImageCompressionEngine.getImageDimensions(file);
      setOriginalDimensions(dims);

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (mode !== 'chromakey' || !imageRef.current) return;

    const img = imageRef.current;
    const rect = img.getBoundingClientRect();

    // Click coordinates relative to client box dimensions
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert to natural width/height coordinates
    const naturalX = Math.min(img.naturalWidth - 1, Math.max(0, Math.floor((x / rect.width) * img.naturalWidth)));
    const naturalY = Math.min(img.naturalHeight - 1, Math.max(0, Math.floor((y / rect.height) * img.naturalHeight)));

    // Offscreen canvas grab pixel color
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      try {
        const pixelData = ctx.getImageData(naturalX, naturalY, 1, 1).data;
        setTargetColor({ r: pixelData[0], g: pixelData[1], b: pixelData[2] });
        setResult(null); // Clear previous results to enforce recalculation
      } catch (err) {
        console.error('Error grabbing pixel color:', err);
      }
    }
  };

  // Re-run whitening automatically on tolerance or mode changes to keep it feeling responsive
  useEffect(() => {
    if (selectedFile && imageSrc) {
      const timer = setTimeout(() => {
        triggerWhitening();
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
    }
  }, [mode, tolerance, targetColor]);

  const triggerWhitening = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    const options: WhiteningOptions = {
      mode,
      tolerance,
      targetColor: targetColor || undefined,
    };

    try {
      const cleanResult = await BackgroundWhiteEngine.whiten(selectedFile, options);
      setResult(cleanResult);
    } catch (error) {
      console.error('Background whitening failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.previewUrl;
    link.download = result.file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetState = () => {
    setSelectedFile(null);
    setImageSrc(null);
    setOriginalDimensions(null);
    setResult(null);
    setTargetColor(null);
    setMode('lightness');
    setTolerance(30);
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload & Workspace Setup */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!selectedFile ? (
            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="image/*"
              maxSizeMB={10}
              label="Upload Passport Photo or Scan"
              helperText="Upload any standard image file up to 10MB"
            />
          ) : (
            <Card className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-navy-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm max-w-[200px] sm:max-w-sm truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-navy-500 font-medium">
                      Original: {formatBytes(selectedFile.size)} {originalDimensions && `• ${originalDimensions.width} x ${originalDimensions.height} px`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  Change File
                </Button>
              </div>

              {/* Filtering modes selector */}
              <div className="flex flex-col gap-4">
                <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wider">
                  Select Cleaning Mode
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('lightness');
                      setTolerance(30);
                    }}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 transition-all ${
                      mode === 'lightness'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                        : 'border-navy-200 hover:border-navy-300 text-navy-700 bg-white'
                    }`}
                  >
                    <Sun className="h-4 w-4" />
                    Auto Lightness Clean
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMode('chromakey');
                      setTolerance(12); // default lower distance for precise color pickers
                    }}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-left flex items-center gap-2 transition-all ${
                      mode === 'chromakey'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                        : 'border-navy-200 hover:border-navy-300 text-navy-700 bg-white'
                    }`}
                  >
                    <Pipette className="h-4 w-4" />
                    Click-to-Pick Color
                  </button>
                </div>

                {/* Mode guides */}
                <div className="text-[10px] text-navy-500 bg-navy-50 border border-navy-100 rounded-lg p-3">
                  {mode === 'lightness' ? (
                    <span>
                      <strong>Lightness Sweeper</strong>: Converts any light-gray, cream, or off-white background color directly into solid `#FFFFFF`. Ideal for cleaning shadow-tinted paper scans.
                    </span>
                  ) : (
                    <span>
                      <strong>Color-Key Remover</strong>: Click anywhere on the workspace image to select a custom color (e.g. blue, gray, green) to automatically replace with pure white.
                    </span>
                  )}
                </div>

                {/* Color picked display */}
                {mode === 'chromakey' && (
                  <div className="bg-navy-50 border border-navy-150 rounded-xl p-3 flex items-center justify-between animate-fadeIn text-xs">
                    <div>
                      <span className="font-bold text-navy-850 block">Target Background Color</span>
                      <span className="text-[10px] text-navy-500">
                        {targetColor 
                          ? `Selected: RGB(${targetColor.r}, ${targetColor.g}, ${targetColor.b})` 
                          : 'Click on the image preview to choose background color'}
                      </span>
                    </div>
                    <div 
                      className="h-8 w-8 rounded-lg border border-navy-300 shadow-inner"
                      style={{
                        backgroundColor: targetColor 
                          ? `rgb(${targetColor.r},${targetColor.g},${targetColor.b})` 
                          : 'transparent'
                      }}
                    />
                  </div>
                )}

                {/* Tolerance slider */}
                <div className="bg-navy-50 border border-navy-100 rounded-xl p-4 flex flex-col gap-2">
                  <Slider
                    label="Tolerance / Sensitivity"
                    valueDisplay={`${tolerance}%`}
                    min={5}
                    max={mode === 'lightness' ? 90 : 40}
                    value={tolerance}
                    onChange={(e) => setTolerance(parseInt(e.target.value, 10))}
                    helperText={
                      mode === 'lightness' 
                        ? 'Higher tolerance clears darker shadows. Lower tolerance preserves details.' 
                        : 'Adjust tolerance to clear variations of the picked color.'
                    }
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Processing runs locally in your browser context. Absolutely private.</span>
          </div>
        </div>

        {/* Interactive Workspace / Preview Results Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {imageSrc && (
            <Card className="flex flex-col gap-4">
              <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-navy-100 pb-3">
                {mode === 'chromakey' && !result ? 'Click on background to pick color' : 'Image Preview'}
              </h4>

              {/* Workspace View */}
              {!result && !isProcessing && (
                <div className="relative border border-navy-200 rounded-lg overflow-hidden bg-navy-100 flex items-center justify-center p-2">
                  <img
                    ref={imageRef}
                    src={imageSrc}
                    alt="Source capture"
                    onClick={handleImageClick}
                    className={`max-h-[300px] object-contain ${mode === 'chromakey' ? 'cursor-crosshair border border-brand-400 border-dashed' : ''}`}
                    title={mode === 'chromakey' ? 'Click background color to select' : ''}
                  />
                </div>
              )}

              {/* Process loading stage */}
              {isProcessing && (
                <div className="flex flex-col items-center justify-center py-16 text-center h-[300px]">
                  <Spinner size="md" label="Wiping color hues..." />
                </div>
              )}

              {/* Result Preview View */}
              {!isProcessing && result && (
                <div className="flex flex-col gap-5 animate-fadeIn">
                  <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-2.5">
                    <FileCheck className="h-5 w-5 text-brand-600" />
                    <span>Pure White Background Generated!</span>
                  </div>

                  <div className="relative border border-navy-200 rounded-lg overflow-hidden bg-navy-100 flex items-center justify-center p-2">
                    {/* Checkered backdrop guide */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                      backgroundImage: 'radial-gradient(#475569 1px, transparent 0)',
                      backgroundSize: '12px 12px',
                    }}></div>
                    <img
                      ref={imageRef}
                      src={result.previewUrl}
                      alt="Whitened Result"
                      onClick={handleImageClick}
                      className={`max-h-[260px] object-contain z-10 ${mode === 'chromakey' ? 'cursor-crosshair' : ''}`}
                      title={mode === 'chromakey' ? 'Click background color to reselect' : ''}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" size="sm" className="flex-grow" onClick={resetState}>
                      <RefreshCw className="h-4 w-4" />
                      Clear Workspace
                    </Button>
                    <Button variant="primary" size="sm" className="flex-grow" onClick={triggerDownload}>
                      <Download className="h-4 w-4" />
                      Download JPG
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {!selectedFile && (
            <Card className="flex flex-col items-center justify-center py-16 text-center text-navy-500 border-2 border-dashed border-navy-100 h-full min-h-[300px]">
              <Sparkles className="h-10 w-10 text-navy-300 mb-2 animate-pulse" />
              <p className="text-sm font-semibold">Workspace Inactive</p>
              <p className="text-xs text-navy-400 mt-1">Upload a passport photo to load the visual editors</p>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
export default BackgroundWhite;
