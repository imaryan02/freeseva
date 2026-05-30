import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { ImageCompressionEngine } from '../../utils/engines/ImageCompressionEngine';
import type { CompressionResult } from '../../utils/engines/ImageCompressionEngine';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck,
  ImageIcon
} from 'lucide-react';

export const ImageCompressor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [targetKB, setTargetKB] = useState<number>(50);
  const [customKB, setCustomKB] = useState<string>('50');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);

  const presets = [
    { label: '10 KB (Signatures)', value: 10 },
    { label: '20 KB (Photos / SSC)', value: 20 },
    { label: '50 KB (Forms / UPSC)', value: 50 },
    { label: '100 KB (High Quality)', value: 100 },
    { label: '200 KB (Max upload)', value: 200 },
    { label: 'Custom Target', value: 0 },
  ];

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setResult(null);
      setProgress(0);
      
      const url = URL.createObjectURL(file);
      setOriginalPreviewUrl(url);
      
      const dims = await ImageCompressionEngine.getImageDimensions(file);
      setOriginalDimensions(dims);
    }
  };

  const handlePresetSelect = (value: number) => {
    if (value === 0) {
      setTargetKB(50); // Default custom target
    } else {
      setTargetKB(value);
    }
  };

  const handleCustomKBChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomKB(value);
    const parsed = parseInt(value, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setTargetKB(parsed);
    }
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setTargetKB(value);
    setCustomKB(value.toString());
  };

  const executeCompression = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const compressionResult = await ImageCompressionEngine.compress(
        selectedFile,
        targetKB,
        (p) => setProgress(p)
      );
      setResult(compressionResult);
    } catch (error) {
      console.error('Compression failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.previewUrl;
    link.download = `compressed_${selectedFile?.name || 'image.jpg'}`;
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
    setProgress(0);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <PageLayout
      title="Image Compressor"
      description="Compress image size in kilobytes (KB) to match precise online form criteria, fully client-side."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload & Controls Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!selectedFile ? (
            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={15}
              label="Upload image to compress"
              helperText="Supports JPG, JPEG, PNG, and WEBP formats up to 15MB"
            />
          ) : (
            <Card className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-navy-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <ImageIcon className="h-5 w-5" />
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

              {/* Compression Configuration */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                  Select Target Size
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {presets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handlePresetSelect(preset.value)}
                      className={`px-3 py-2.5 text-xs font-semibold rounded-lg border text-left transition-all ${
                        (preset.value !== 0 && targetKB === preset.value) || (preset.value === 0 && !presets.map(p => p.value).includes(targetKB))
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                          : 'border-navy-200 hover:border-navy-300 text-navy-700 bg-white'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Custom target input & slider */}
                {(!presets.map(p => p.value).includes(targetKB) || targetKB === 50) && (
                  <div className="mt-2 bg-navy-50 rounded-xl p-4 border border-navy-100 flex flex-col gap-4 animate-fadeIn">
                    <div className="flex gap-4 items-center">
                      <div className="w-1/2">
                        <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                          Max File Size (KB)
                        </label>
                        <input
                          type="number"
                          value={customKB}
                          onChange={handleCustomKBChange}
                          min="1"
                          max="2000"
                          className="w-full px-3 py-1.5 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div className="w-1/2">
                        <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                          DPI Standard Guide
                        </label>
                        <span className="text-[10px] text-navy-500 leading-snug block">
                          Most portals require JPG format between 10KB and 50KB limits.
                        </span>
                      </div>
                    </div>

                    <Slider
                      label="Adjust Size Constraint"
                      valueDisplay={`${targetKB} KB`}
                      min={5}
                      max={500}
                      value={targetKB}
                      onChange={handleSliderChange}
                    />
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={executeCompression}
                  isLoading={isProcessing}
                >
                  Compress Image
                </Button>
              </div>
            </Card>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Files are processed locally in your browser cache. We NEVER upload files to external servers.</span>
          </div>
        </div>

        {/* Preview / Result Screen */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isProcessing && (
            <Card className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[300px]">
              <Spinner size="lg" label={`Optimizing bytes... (${progress}%)`} />
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
                Confirm your uploaded image file above. Adjust target size settings and click Compress Image.
              </div>
            </Card>
          )}

          {!isProcessing && result && selectedFile && (
            <Card className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <span>Successfully Compressed Under Limit!</span>
              </div>

              {/* Side by side comparison stats */}
              <div className="grid grid-cols-2 gap-4 bg-navy-50 rounded-xl p-4 border border-navy-100 text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-navy-500 tracking-wider">Before</div>
                  <div className="text-sm font-bold text-navy-800 mt-0.5">{formatBytes(result.originalSize)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-navy-500 tracking-wider">After</div>
                  <div className="text-sm font-black text-brand-700 mt-0.5">{formatBytes(result.compressedSize)}</div>
                </div>
                <div className="col-span-2 border-t border-navy-200/50 pt-2.5 mt-1 flex justify-between px-2 text-xs font-semibold text-navy-600">
                  <span>Size Reduction:</span>
                  <span className="font-bold text-brand-700 bg-brand-100 px-1.5 py-0.5 rounded">-{result.savingsPercentage}%</span>
                </div>
                <div className="col-span-2 flex justify-between px-2 text-xs font-semibold text-navy-600">
                  <span>Output Dimensions:</span>
                  <span className="font-bold text-navy-800">{result.width} x {result.height} px</span>
                </div>
              </div>

              {/* Before/After preview preview wrapper */}
              <div className="relative aspect-auto max-h-[280px] rounded-lg overflow-hidden border border-navy-200 bg-navy-100 flex items-center justify-center">
                <img
                  src={result.previewUrl}
                  alt="Compressed outcome"
                  className="object-contain max-h-[280px] w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="md" className="flex-1" onClick={resetState}>
                  <RefreshCw className="h-4 w-4" />
                  Compress Another
                </Button>
                <Button variant="primary" size="md" className="flex-1" onClick={triggerDownload}>
                  <Download className="h-4 w-4" />
                  Download Result
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
