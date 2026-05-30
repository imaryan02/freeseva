import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { ImageConversionEngine } from '../../utils/engines/ImageConversionEngine';
import type { ConversionResult } from '../../utils/engines/ImageConversionEngine';
import { ImageCompressionEngine } from '../../utils/engines/ImageCompressionEngine';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck,
  FileImage,
  ArrowRight,
  ImageIcon
} from 'lucide-react';

export const ImageConverter: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  const [targetFormat, setTargetFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg');
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ConversionResult | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setResult(null);

      const url = URL.createObjectURL(file);
      setOriginalPreviewUrl(url);

      const dims = await ImageCompressionEngine.getImageDimensions(file);
      setOriginalDimensions(dims);
    }
  };

  const executeConversion = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const conversionResult = await ImageConversionEngine.convert(selectedFile, targetFormat);
      setResult(conversionResult);
    } catch (error) {
      console.error('Format conversion failed:', error);
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
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <PageLayout
      title="Image Format Converter"
      description="Quickly convert standard image files between PNG, JPG, and WEBP formats locally."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload & Controls Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!selectedFile ? (
            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="image/*"
              maxSizeMB={15}
              label="Upload image to convert"
              helperText="Upload any standard image file up to 15MB"
            />
          ) : (
            <Card className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-navy-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <FileImage className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-navy-900 text-sm max-w-[200px] sm:max-w-sm truncate" title={selectedFile.name}>
                      {selectedFile.name}
                    </h3>
                    <p className="text-xs text-navy-500 font-medium">
                      Original Size: {formatBytes(selectedFile.size)} {originalDimensions && `• ${originalDimensions.width} x ${originalDimensions.height} px`}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  Change File
                </Button>
              </div>

              {/* Format selection */}
              <div className="flex flex-col gap-4">
                <label className="block text-xs font-bold text-navy-800 uppercase tracking-wider">
                  Target Format
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setTargetFormat(fmt)}
                      className={`px-4 py-3 text-xs font-bold rounded-lg border text-center uppercase tracking-wider transition-all ${
                        targetFormat === fmt
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-extrabold'
                          : 'border-navy-200 hover:border-navy-300 text-navy-700 bg-white'
                      }`}
                    >
                      {fmt === 'jpeg' ? 'JPG / JPEG' : fmt}
                    </button>
                  ))}
                </div>

                <div className="mt-2 text-[10px] text-navy-500 leading-relaxed bg-navy-50 border border-navy-100 rounded-lg p-3">
                  {targetFormat === 'jpeg' && (
                    <span><strong>JPG / JPEG</strong>: Standard format required by nearly all Indian competitive portals. Drops alpha transparencies in exchange for light file footprints.</span>
                  )}
                  {targetFormat === 'png' && (
                    <span><strong>PNG</strong>: Lossless output format which supports full alpha transparency overlays. Best for transparent signatures.</span>
                  )}
                  {targetFormat === 'webp' && (
                    <span><strong>WEBP</strong>: Modern web image format which provides extreme byte savings while supporting transparency.</span>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={executeConversion}
                  isLoading={isProcessing}
                >
                  Convert Format
                </Button>
              </div>
            </Card>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Conversions are executed locally in memory. Your images are never sent online.</span>
          </div>
        </div>

        {/* Preview / Result Screen */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isProcessing && (
            <Card className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[300px]">
              <Spinner size="lg" label="Re-encoding image buffers..." />
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
                Confirm your uploaded image file above. Select target format and click Convert Format.
              </div>
            </Card>
          )}

          {!isProcessing && result && selectedFile && (
            <Card className="flex flex-col gap-5 animate-fadeIn">
              <div className="flex items-center gap-2 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <span>Format Transformed Successfully!</span>
              </div>

              {/* Conversion metrics */}
              <div className="grid grid-cols-1 gap-3 bg-navy-50 rounded-xl p-4 border border-navy-100 text-xs text-navy-600">
                <div className="flex justify-between items-center font-semibold">
                  <span>Transformation:</span>
                  <span className="font-bold text-navy-850 flex items-center gap-1.5 uppercase">
                    {result.originalFormat}
                    <ArrowRight className="h-3 w-3 text-navy-400" />
                    {result.targetFormat}
                  </span>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  <span>Original Size:</span>
                  <span className="font-bold text-navy-800">{formatBytes(result.originalSize)}</span>
                </div>
                <div className="flex justify-between items-center font-semibold">
                  <span>Converted Size:</span>
                  <span className="font-bold text-brand-700">{formatBytes(result.convertedSize)}</span>
                </div>
                <div className="flex justify-between items-center font-semibold border-t border-navy-200/50 pt-2.5 mt-1">
                  <span>Dimensions:</span>
                  <span className="font-bold text-navy-850">
                    {originalDimensions && `${originalDimensions.width} x ${originalDimensions.height} px`}
                  </span>
                </div>
              </div>

              {/* Visual preview */}
              <div className="border border-navy-200 rounded-lg overflow-hidden bg-navy-100 flex items-center justify-center p-2 max-h-[220px]">
                <img
                  src={result.previewUrl}
                  alt="Converted Output preview"
                  className="object-contain max-h-[190px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="md" className="flex-1" onClick={resetState}>
                  <RefreshCw className="h-4 w-4" />
                  Convert Another
                </Button>
                <Button variant="primary" size="md" className="flex-1" onClick={triggerDownload}>
                  <Download className="h-4 w-4" />
                  Download File
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
