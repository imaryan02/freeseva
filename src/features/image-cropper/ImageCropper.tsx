import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck,
  Scissors,
  Crop as CropIcon
} from 'lucide-react';

interface CropPreset {
  name: string;
  aspect: number | undefined;
  desc: string;
}

export const ImageCropper: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  
  // Crop states
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(7 / 9); // passport 3.5x4.5 default
  const [activePreset, setActivePreset] = useState<string>('Passport (3.5:4.5)');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedDimensions, setCroppedDimensions] = useState<{ width: number; height: number } | null>(null);

  const presets: CropPreset[] = [
    { name: 'Passport (3.5:4.5)', aspect: 7 / 9, desc: 'Ideal standard passport shape (3.5x4.5 cm)' },
    { name: 'Square (1:1)', aspect: 1, desc: 'Perfect square shape (social posts / signatures)' },
    { name: 'Stamp Size (2:2.5)', aspect: 4 / 5, desc: 'Official stamp size photo ratio' },
    { name: 'Free Crop', aspect: undefined, desc: 'Unlocked aspect ratio. Drag crop borders freely.' },
  ];

  // Helper to center aspect crop
  const getCenterAspectCrop = (width: number, height: number, aspectVal: number) => {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspectVal,
        width,
        height
      ),
      width,
      height
    );
  };

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setCroppedUrl(null);
      setCroppedFile(null);
      setCroppedDimensions(null);

      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    imageRef.current = e.currentTarget;

    if (aspect) {
      setCrop(getCenterAspectCrop(width, height, aspect));
    } else {
      setCrop({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10
      });
    }
  };

  const handlePresetSelect = (preset: CropPreset) => {
    setActivePreset(preset.name);
    setAspect(preset.aspect);
    setCroppedUrl(null);

    if (imageRef.current && preset.aspect) {
      const { width, height } = imageRef.current;
      setCrop(getCenterAspectCrop(width, height, preset.aspect));
    } else {
      setCrop({
        unit: '%',
        width: 80,
        height: 80,
        x: 10,
        y: 10
      });
    }
  };

  const executeCrop = async () => {
    if (!imageRef.current || !completedCrop || !selectedFile) return;
    setIsProcessing(true);

    const image = imageRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsProcessing(false);
      return;
    }

    // Scale mapping for retina/higher-res pixels
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = Math.floor(completedCrop.width * scaleX);
    canvas.height = Math.floor(completedCrop.height * scaleY);
    setCroppedDimensions({ width: canvas.width, height: canvas.height });

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    try {
      canvas.toBlob((blob) => {
        if (blob) {
          const baseName = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
          const finalFile = new File([blob], `${baseName}_cropped.jpg`, { type: 'image/jpeg' });
          const previewUrl = URL.createObjectURL(finalFile);
          
          setCroppedFile(finalFile);
          setCroppedUrl(previewUrl);
        }
        setIsProcessing(false);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error('Crop creation error:', err);
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!croppedUrl || !croppedFile) return;
    const link = document.createElement('a');
    link.href = croppedUrl;
    link.download = croppedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetState = () => {
    setSelectedFile(null);
    setImageSrc(null);
    imageRef.current = null;
    setCrop(undefined);
    setCompletedCrop(undefined);
    setCroppedUrl(null);
    setCroppedFile(null);
    setCroppedDimensions(null);
    setAspect(7 / 9);
    setActivePreset('Passport (3.5:4.5)');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <PageLayout
      title="Image Crop Tool"
      description="Visual crop overlay to slice physical photo scans into standard passport or signature dimensions."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Visual Crop Workspace Panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!selectedFile ? (
            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="image/jpeg,image/png,image/webp"
              maxSizeMB={12}
              label="Upload Photo to Crop"
              helperText="Upload JPG, PNG, or WEBP captures up to 12MB"
            />
          ) : (
            <Card className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-navy-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-brand-600" />
                  <span className="text-sm font-bold text-navy-900">Visual Crop Area</span>
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  Change File
                </Button>
              </div>

              {/* Presets and options */}
              <div className="flex flex-col gap-3">
                <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wider">
                  Aspect Ratio Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handlePresetSelect(preset)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        activePreset === preset.name
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold'
                          : 'border-navy-200 hover:border-navy-300 text-navy-700 bg-white'
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-navy-500 font-semibold leading-relaxed bg-navy-50 border border-navy-100 rounded-lg p-2">
                  Guide: {presets.find(p => p.name === activePreset)?.desc}
                </p>
              </div>

              {/* Crop Box Workspace */}
              {imageSrc && !croppedUrl && (
                <div className="relative border border-navy-200 rounded-xl overflow-hidden bg-navy-900/10 flex items-center justify-center p-4 max-h-[500px] overflow-y-auto">
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={aspect}
                    className="max-h-[460px] object-contain"
                  >
                    <img
                      src={imageSrc}
                      alt="Crop selection source"
                      onLoad={onImageLoad}
                      className="max-h-[460px] object-contain w-full"
                    />
                  </ReactCrop>
                </div>
              )}

              {/* Loaded placeholder when cropped already */}
              {croppedUrl && (
                <div className="border border-navy-200 rounded-xl bg-brand-50/10 p-12 text-center flex flex-col items-center justify-center">
                  <CropIcon className="h-10 w-10 text-brand-600 mb-2 animate-pulse" />
                  <p className="text-sm font-semibold text-navy-950">Crop Segment Confirmed</p>
                  <p className="text-xs text-navy-500 mt-1">Review the generated image slice in the side panel or compile a new crop.</p>
                  <Button variant="ghost" size="sm" className="mt-4" onClick={() => setCroppedUrl(null)}>
                    Adjust Crop Area
                  </Button>
                </div>
              )}

              {!croppedUrl && (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={executeCrop}
                  disabled={!completedCrop}
                  isLoading={isProcessing}
                >
                  Confirm Crop Area
                </Button>
              )}
            </Card>
          )}

          {/* Privacy note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Cropping runs completely inside your browser sandbox locally.</span>
          </div>
        </div>

        {/* Output/Result Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {isProcessing && (
            <Card className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[300px]">
              <Spinner size="lg" label="Extracting canvas slice..." />
            </Card>
          )}

          {!isProcessing && !croppedUrl && selectedFile && (
            <Card className="flex flex-col items-center justify-center py-16 text-center text-navy-500 border-2 border-dashed border-navy-100 h-full min-h-[300px]">
              <CropIcon className="h-10 w-10 text-navy-300 mb-2" />
              <p className="text-sm font-semibold">Workspace Active</p>
              <p className="text-xs text-navy-400 mt-1">Drag the crop handles to frame your target, then click Confirm Crop</p>
            </Card>
          )}

          {!isProcessing && croppedUrl && croppedFile && selectedFile && (
            <Card className="flex flex-col gap-5 animate-fadeIn">
              <div className="flex items-center gap-2 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <span>Crop Segment Generated!</span>
              </div>

              {/* Crop Stats */}
              <div className="bg-navy-50 rounded-xl p-4 border border-navy-100 flex flex-col gap-2.5 text-xs text-navy-600">
                <div className="flex justify-between font-semibold">
                  <span>Output Dimensions:</span>
                  <span className="font-bold text-navy-950">
                    {croppedDimensions ? `${croppedDimensions.width} x ${croppedDimensions.height} px` : 'Ready'}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Output Byte Size:</span>
                  <span className="font-bold text-brand-700">{formatBytes(croppedFile.size)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-navy-200/50 pt-2.5 mt-1">
                  <span>Output Type:</span>
                  <span className="font-bold text-navy-950 uppercase">JPG (Form Ready)</span>
                </div>
              </div>

              {/* visual preview */}
              <div className="border border-navy-200 rounded-lg overflow-hidden bg-navy-100 aspect-auto flex items-center justify-center p-2 max-h-[220px]">
                <img
                  src={croppedUrl}
                  alt="Cropped visual slice"
                  className="object-contain max-h-[190px]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm" className="flex-grow" onClick={() => setCroppedUrl(null)}>
                  <RefreshCw className="h-4 w-4" />
                  Recrop Image
                </Button>
                <Button variant="primary" size="sm" className="flex-grow" onClick={triggerDownload}>
                  <Download className="h-4 w-4" />
                  Download Crop
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
