import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { SignatureCompressionEngine } from '../../utils/engines/SignatureCompressionEngine';
import type { SignatureProcessingOptions } from '../../utils/engines/SignatureCompressionEngine';
import type { CompressionResult } from '../../utils/engines/ImageCompressionEngine';
import { ImageCompressionEngine } from '../../utils/engines/ImageCompressionEngine';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck,
  PenTool,
  Sliders,
  Settings
} from 'lucide-react';

export const SignatureCompressor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalDimensions, setOriginalDimensions] = useState<{ width: number; height: number } | null>(null);
  
  // Compression config
  const [targetKB, setTargetKB] = useState<number>(10);
  const [customKB, setCustomKB] = useState<string>('10');
  
  // Signature specific processing configurations
  const [contrastBoost, setContrastBoost] = useState<boolean>(true);
  const [threshold, setThreshold] = useState<number>(165); // default middle-high to catch paper shades
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg'>('jpeg');
  const [preserveTransparency, setPreserveTransparency] = useState<boolean>(false);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);

  const presets = [
    { label: '10 KB (SSC/UPSC standard)', value: 10 },
    { label: '20 KB (Banking portal max)', value: 20 },
    { label: '30 KB (General forms)', value: 30 },
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

      // Auto-detect format preferences
      if (file.type === 'image/png') {
        setOutputFormat('png');
        setPreserveTransparency(true);
      } else {
        setOutputFormat('jpeg');
        setPreserveTransparency(false);
      }
    }
  };

  const handlePresetSelect = (value: number) => {
    if (value === 0) {
      setTargetKB(15);
      setCustomKB('15');
    } else {
      setTargetKB(value);
      setCustomKB(value.toString());
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

    const processingOptions: SignatureProcessingOptions = {
      contrastBoost,
      threshold,
      outputFormat,
      preserveTransparency: outputFormat === 'png' && preserveTransparency,
    };

    try {
      const compressionResult = await SignatureCompressionEngine.processAndCompress(
        selectedFile,
        targetKB,
        processingOptions,
        (p) => setProgress(p)
      );
      setResult(compressionResult);
    } catch (error) {
      console.error('Signature processing failed:', error);
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
    setProgress(0);
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload & Controls Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {!selectedFile ? (
            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={8}
              label="Upload Signature Capture"
              helperText="Upload a photo or scan of your signature (up to 8MB)"
            />
          ) : (
            <Card className="flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-navy-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
                    <PenTool className="h-5 w-5" />
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

              {/* Presets and Size selection */}
              <div className="flex flex-col gap-4">
                <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-brand-600" />
                  Compression Target
                </h4>
                
                <div className="grid grid-cols-2 gap-3">
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

                {/* Custom size input */}
                {(!presets.map(p => p.value).includes(targetKB) || targetKB === 15) && (
                  <div className="bg-navy-50 border border-navy-100 rounded-xl p-4 flex flex-col gap-4 animate-fadeIn">
                    <div className="flex gap-4 items-center">
                      <div className="w-1/2">
                        <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                          Target Size (KB)
                        </label>
                        <input
                          type="number"
                          value={customKB}
                          onChange={handleCustomKBChange}
                          min="3"
                          max="150"
                          className="w-full px-3 py-1.5 text-sm bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <span className="text-[10px] text-navy-500 w-1/2">
                        Signatures on SSC portals must be strictly under 10KB or 20KB limits.
                      </span>
                    </div>

                    <Slider
                      label="Limit Threshold"
                      valueDisplay={`${targetKB} KB`}
                      min={3}
                      max={60}
                      value={targetKB}
                      onChange={handleSliderChange}
                    />
                  </div>
                )}
              </div>

              {/* Signature Enhancements */}
              <div className="flex flex-col gap-4 border-t border-navy-100 pt-4">
                <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="h-4 w-4 text-brand-600" />
                  Legibility & Contrast Controls
                </h4>

                <div className="flex flex-col gap-3">
                  {/* Clean Background Checkbox */}
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={contrastBoost}
                      onChange={(e) => setContrastBoost(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-navy-800 block">Clean Paper Shadows & Boost Ink</span>
                      <span className="text-[10px] text-navy-500 leading-snug block">Recommended. Darkens pen strokes and converts gray/yellow backgrounds to white or transparent.</span>
                    </div>
                  </label>

                  {/* Contrast Sensitivity Slider */}
                  {contrastBoost && (
                    <div className="bg-navy-50 border border-navy-100 rounded-xl p-3.5 mt-1 animate-fadeIn">
                      <Slider
                        label="Background Whitening Tolerance"
                        valueDisplay={threshold}
                        min={100}
                        max={220}
                        value={threshold}
                        onChange={(e) => setThreshold(parseInt(e.target.value, 10))}
                        helperText="Higher values sweep darker background shadows. Lower values keep fine ink strokes."
                      />
                    </div>
                  )}
                </div>

                {/* Output File Details */}
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <div>
                    <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                      Output Format
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e) => {
                        const fmt = e.target.value as 'png' | 'jpeg';
                        setOutputFormat(fmt);
                        if (fmt === 'jpeg') setPreserveTransparency(false);
                      }}
                      className="w-full px-2.5 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                    >
                      <option value="jpeg">JPG (Standard Form Limit)</option>
                      <option value="png">PNG (Supports Transparency)</option>
                    </select>
                  </div>

                  {outputFormat === 'png' && (
                    <div className="flex items-center mt-4">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={preserveTransparency}
                          onChange={(e) => setPreserveTransparency(e.target.checked)}
                          className="h-4 w-4 rounded border-navy-300 text-brand-600 focus:ring-brand-500 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-navy-800">Keep Transparency</span>
                      </label>
                    </div>
                  )}
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full mt-2"
                  onClick={executeCompression}
                  isLoading={isProcessing}
                >
                  Generate Signature
                </Button>
              </div>
            </Card>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Processed locally in browser memory. No data is shared.</span>
          </div>
        </div>

        {/* Preview / Result Screen */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isProcessing && (
            <Card className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[300px]">
              <Spinner size="lg" label={`Synthesizing signature ink... (${progress}%)`} />
            </Card>
          )}

          {!isProcessing && !result && selectedFile && (
            <Card className="flex flex-col gap-4 animate-fadeIn">
              <h3 className="text-xs font-bold text-navy-700 uppercase tracking-wider border-b border-navy-100 pb-2 flex items-center gap-1.5">
                <PenTool className="h-4 w-4 text-brand-600" />
                Uploaded Signature Preview
              </h3>
              
              <div className="relative aspect-auto max-h-[220px] rounded-lg overflow-hidden border border-navy-200 bg-navy-100 flex items-center justify-center p-4">
                <img
                  src={originalPreviewUrl || ''}
                  alt="Uploaded signature source"
                  className="object-contain max-h-[180px] z-10"
                />
              </div>
              
              <div className="text-center text-xs text-navy-500 font-medium leading-relaxed">
                Confirm your uploaded signature capture above. Adjust contrast sensitivity and click Generate.
              </div>
            </Card>
          )}

          {!isProcessing && result && selectedFile && (
            <Card className="flex flex-col gap-6 animate-fadeIn">
              <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <span>Signature Cleaned & Compressed!</span>
              </div>

              {/* Compression details */}
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
                  <span>Target Constraint:</span>
                  <span className="font-bold text-navy-800">{targetKB} KB</span>
                </div>
                <div className="col-span-2 flex justify-between px-2 text-xs font-semibold text-navy-600">
                  <span>File Output Type:</span>
                  <span className="font-bold text-navy-800 uppercase">{outputFormat}</span>
                </div>
                <div className="col-span-2 flex justify-between px-2 text-xs font-semibold text-navy-600">
                  <span>Output Dimensions:</span>
                  <span className="font-bold text-navy-800">{result.width} x {result.height} px</span>
                </div>
              </div>

              {/* Before/After preview preview wrapper */}
              <div className="relative aspect-auto max-h-[220px] rounded-lg overflow-hidden border border-navy-200 bg-navy-100 flex items-center justify-center p-4">
                {/* Transparent backgrounds look best with checkered patterns, let's add basic grid styles */}
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
                  backgroundImage: 'radial-gradient(#475569 1px, transparent 0)',
                  backgroundSize: '12px 12px',
                }}></div>
                <img
                  src={result.previewUrl}
                  alt="Processed Signature Outcome"
                  className="object-contain max-h-[180px] z-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="md" className="flex-1" onClick={resetState}>
                  <RefreshCw className="h-4 w-4" />
                  Compress New
                </Button>
                <Button variant="primary" size="md" className="flex-1" onClick={triggerDownload}>
                  <Download className="h-4 w-4" />
                  Download Signature
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
