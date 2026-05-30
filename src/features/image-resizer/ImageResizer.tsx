import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { ImageResizeEngine } from '../../utils/engines/ImageResizeEngine';
import type { ResizeOptions, ResizeResult } from '../../utils/engines/ImageResizeEngine';
import { ImageCompressionEngine } from '../../utils/engines/ImageCompressionEngine';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck,
  Maximize2,
  Lock,
  Unlock,
  Settings,
  Scaling,
  ImageIcon
} from 'lucide-react';

interface ResizePreset {
  name: string;
  width: number;
  height: number;
  unit: 'px' | 'cm' | 'inch';
  dpi: number;
  maintainAspectRatio: boolean;
  desc: string;
}

export const ImageResizer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  
  // Custom resize configurations
  const [width, setWidth] = useState<number>(350);
  const [height, setHeight] = useState<number>(450);
  const [unit, setUnit] = useState<'px' | 'cm' | 'inch'>('px');
  const [dpi, setDpi] = useState<number>(300);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [activePreset, setActivePreset] = useState<string>('custom');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ResizeResult | null>(null);

  const presets: ResizePreset[] = [
    {
      name: 'Standard Passport',
      width: 3.5,
      height: 4.5,
      unit: 'cm',
      dpi: 300,
      maintainAspectRatio: false,
      desc: '3.5 x 4.5 cm (Standard Passport Guidelines)',
    },
    {
      name: 'SSC Photo',
      width: 350,
      height: 450,
      unit: 'px',
      dpi: 300,
      maintainAspectRatio: false,
      desc: '3.5 x 4.5 cm / 350 x 450 px (SSC Form Limit)',
    },
    {
      name: 'SSC Signature',
      width: 400,
      height: 200,
      unit: 'px',
      dpi: 300,
      maintainAspectRatio: false,
      desc: '4.0 x 2.0 cm / 400 x 200 px (SSC Sign Limit)',
    },
    {
      name: 'UPSC Photo',
      width: 350,
      height: 350,
      unit: 'px',
      dpi: 300,
      maintainAspectRatio: true,
      desc: 'Min 350 x 350 px (Square Aspect Guidelines)',
    },
    {
      name: 'NEET Postcard',
      width: 4,
      height: 6,
      unit: 'inch',
      dpi: 200,
      maintainAspectRatio: false,
      desc: '4 x 6 inches (Postcard Photo Guidelines)',
    },
  ];

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setResult(null);
      
      const url = URL.createObjectURL(file);
      setOriginalPreviewUrl(url);
      
      const dims = await ImageCompressionEngine.getImageDimensions(file);
      setOriginalDimensions(dims);

      // Auto set matching initial width/height if custom is active
      if (activePreset === 'custom') {
        setWidth(dims.width);
        setHeight(dims.height);
      }
    }
  };

  const applyPreset = (preset: ResizePreset) => {
    setActivePreset(preset.name);
    setWidth(preset.width);
    setHeight(preset.height);
    setUnit(preset.unit);
    setDpi(preset.dpi);
    setMaintainAspectRatio(preset.maintainAspectRatio);
  };

  const handleCustomMode = () => {
    setActivePreset('custom');
    if (originalDimensions) {
      setWidth(originalDimensions.width);
      setHeight(originalDimensions.height);
    }
    setUnit('px');
  };

  // Adjust aspect ratios on width changes if locked
  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspectRatio && originalDimensions) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setHeight(Math.round(val / ratio));
    }
  };

  // Adjust aspect ratios on height changes if locked
  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspectRatio && originalDimensions) {
      const ratio = originalDimensions.width / originalDimensions.height;
      setWidth(Math.round(val * ratio));
    }
  };

  const executeResize = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    const options: ResizeOptions = {
      width,
      height,
      unit,
      dpi,
      maintainAspectRatio,
      outputFormat,
    };

    try {
      const resizeResult = await ImageResizeEngine.resize(selectedFile, options);
      setResult(resizeResult);
    } catch (error) {
      console.error('Resize execution failed:', error);
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
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }
    setOriginalPreviewUrl(null);
    setSelectedFile(null);
    setOriginalDimensions(null);
    setResult(null);
    setActivePreset('custom');
    setWidth(350);
    setHeight(450);
    setUnit('px');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    return (bytes / k).toFixed(2) + ' KB';
  };

  return (
    <PageLayout
      title="Image Resizer"
      description="Resize images to exact dimensions in centimeters (cm), inches, or pixels (px) matching portal specs."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload & Controls Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!selectedFile ? (
            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={15}
              label="Upload Image to Resize"
              helperText="Upload JPG, PNG, or WEBP photos up to 15MB"
            />
          ) : (
            <Card className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-navy-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <Maximize2 className="h-5 w-5" />
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

              {/* Presets and custom settings selector */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-brand-600" />
                  Select Preset Specification
                </h4>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleCustomMode}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      activePreset === 'custom'
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                        : 'border-navy-200 hover:border-navy-300 text-navy-700 bg-white'
                    }`}
                  >
                    Custom Dimensions
                  </button>
                  
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                        activePreset === preset.name
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                          : 'border-navy-200 hover:border-navy-300 text-navy-700 bg-white'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {activePreset !== 'custom' && (
                  <p className="text-xs text-navy-500 font-semibold bg-navy-50 border border-navy-100 rounded-lg p-2.5 animate-fadeIn">
                    Active Preset Specs: {presets.find(p => p.name === activePreset)?.desc}
                  </p>
                )}
              </div>

              {/* Dimensions Input Panel */}
              <div className="flex flex-col gap-4 border-t border-navy-100 pt-4">
                <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Scaling className="h-4 w-4 text-brand-600" />
                  Resize Configurations
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  {/* Width Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                      Width
                    </label>
                    <input
                      type="number"
                      value={width}
                      step="any"
                      onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0)}
                      disabled={activePreset !== 'custom'}
                      className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-navy-50 disabled:text-navy-500"
                    />
                  </div>

                  {/* Height Input */}
                  <div>
                    <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      value={height}
                      step="any"
                      onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 0)}
                      disabled={activePreset !== 'custom'}
                      className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-navy-50 disabled:text-navy-500"
                    />
                  </div>

                  {/* Unit Picker */}
                  <div>
                    <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                      Unit
                    </label>
                    <select
                      value={unit}
                      onChange={(e) => {
                        const nextUnit = e.target.value as 'px' | 'cm' | 'inch';
                        setUnit(nextUnit);
                        // Sensible default resets on unit change
                        if (nextUnit === 'px') {
                          setWidth(350);
                          setHeight(450);
                        } else if (nextUnit === 'cm') {
                          setWidth(3.5);
                          setHeight(4.5);
                        } else {
                          setWidth(2);
                          setHeight(2.5);
                        }
                      }}
                      disabled={activePreset !== 'custom'}
                      className="w-full px-3 py-2 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer disabled:bg-navy-50"
                    >
                      <option value="px">Pixels (px)</option>
                      <option value="cm">Centimeters (cm)</option>
                      <option value="inch">Inches (in)</option>
                    </select>
                  </div>
                </div>

                {/* Lock Aspect Ratio and Output settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-1">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                      disabled={activePreset !== 'custom'}
                      className="p-2 border border-navy-200 rounded-lg bg-white text-navy-600 hover:text-navy-950 flex items-center justify-center disabled:opacity-50"
                      title={maintainAspectRatio ? 'Aspect ratio locked' : 'Aspect ratio unlocked'}
                    >
                      {maintainAspectRatio ? <Lock className="h-4 w-4 text-brand-600" /> : <Unlock className="h-4 w-4" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-navy-800 block">Lock Aspect Ratio</span>
                      <span className="text-[10px] text-navy-500">Auto-scales dimensions to prevent stretching.</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                      Output Format
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as 'jpeg' | 'png' | 'webp')}
                      className="w-full px-3 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      <option value="jpeg">JPG (Standard Lossy)</option>
                      <option value="png">PNG (Lossless Format)</option>
                      <option value="webp">WEBP (Modern Web)</option>
                    </select>
                  </div>
                </div>

                {/* Resolution DPI setting */}
                {unit !== 'px' && (
                  <div className="bg-navy-50 border border-navy-100 rounded-xl p-3 animate-fadeIn flex justify-between items-center text-xs">
                    <div>
                      <span className="font-bold text-navy-850 block">DPI (Dots Per Inch) Resolution</span>
                      <span className="text-[10px] text-navy-500">Metric cm/inch files translate to pixels using DPI parameters.</span>
                    </div>
                    <select
                      value={dpi}
                      onChange={(e) => setDpi(parseInt(e.target.value, 10))}
                      disabled={activePreset !== 'custom'}
                      className="px-2 py-1.5 bg-white border border-navy-200 rounded-lg focus:outline-none cursor-pointer"
                    >
                      <option value={200}>200 DPI (Exam default)</option>
                      <option value={300}>300 DPI (Official high-res)</option>
                    </select>
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={executeResize}
                  isLoading={isProcessing}
                >
                  Resize Document Image
                </Button>
              </div>
            </Card>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Resizing runs locally in the browser memory. Absolute privacy.</span>
          </div>
        </div>

        {/* Preview / Result Screen */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isProcessing && (
            <Card className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[300px]">
              <Spinner size="lg" label="Rescaling pixel matrix..." />
            </Card>
          )}

          {!isProcessing && !result && selectedFile && (
            <Card className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-navy-700 uppercase tracking-wider border-b border-navy-100 pb-2 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-brand-600" />
                Uploaded Image Preview
              </h3>
              
              <div className="relative aspect-auto max-h-[260px] rounded-lg overflow-hidden border border-navy-200 bg-navy-100 flex items-center justify-center p-2">
                <img
                  src={originalPreviewUrl || ''}
                  alt="Uploaded source preview"
                  className="object-contain max-h-[220px] w-full"
                />
              </div>
              
              <div className="text-center text-xs text-navy-500 font-medium leading-relaxed">
                Confirm your uploaded image file above. Adjust resizing configurations and click Resize Document Image.
              </div>
            </Card>
          )}

          {!isProcessing && result && selectedFile && (
            <Card className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <span>Successfully Scaled Image!</span>
              </div>

              {/* Statistics details */}
              <div className="grid grid-cols-2 gap-4 bg-navy-50 rounded-xl p-4 border border-navy-100 text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-navy-500 tracking-wider">Before Specs</div>
                  <div className="text-xs font-bold text-navy-800 mt-0.5">
                    {originalDimensions && `${originalDimensions.width} x ${originalDimensions.height} px`}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-navy-500 tracking-wider">After Specs</div>
                  <div className="text-xs font-black text-brand-700 mt-0.5">
                    {result.width} x {result.height} px
                  </div>
                </div>
                <div className="col-span-2 border-t border-navy-200/50 pt-2.5 mt-1 flex justify-between px-2 text-xs font-semibold text-navy-600">
                  <span>Output Byte Size:</span>
                  <span className="font-bold text-brand-700">{formatBytes(result.fileSize)}</span>
                </div>
                <div className="col-span-2 flex justify-between px-2 text-xs font-semibold text-navy-600">
                  <span>Format:</span>
                  <span className="font-bold text-navy-800 uppercase">{outputFormat}</span>
                </div>
              </div>

              {/* Before/After preview preview wrapper */}
              <div className="relative aspect-auto max-h-[220px] rounded-lg overflow-hidden border border-navy-200 bg-navy-100 flex items-center justify-center p-2">
                <img
                  src={result.previewUrl}
                  alt="Resized Outcome"
                  className="object-contain max-h-[190px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="md" className="flex-1" onClick={resetState}>
                  <RefreshCw className="h-4 w-4" />
                  Resize New File
                </Button>
                <Button variant="primary" size="md" className="flex-1" onClick={triggerDownload}>
                  <Download className="h-4 w-4" />
                  Download Resized
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
