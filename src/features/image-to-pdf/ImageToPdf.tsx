import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { PdfProcessingEngine } from '../../utils/engines/PdfProcessingEngine';
import type { ImagesToPdfOptions } from '../../utils/engines/PdfProcessingEngine';
import { ImageCompressionEngine } from '../../utils/engines/ImageCompressionEngine';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck,
  FileImage,
  ArrowUp,
  ArrowDown,
  Trash2,
  Settings
} from 'lucide-react';

interface ImageItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

export const ImageToPdf: React.FC = () => {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [margin, setMargin] = useState<number>(20);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    const newItems: ImageItem[] = [];

    for (const file of files) {
      const dims = await ImageCompressionEngine.getImageDimensions(file);
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        previewUrl: URL.createObjectURL(file),
        width: dims.width,
        height: dims.height,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    setPdfFile(null);
    setPdfPreviewUrl(null);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setItems((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      return updated;
    });
  };

  const moveDown = (index: number) => {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const executeConversion = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    const images = items.map((item) => item.file);
    const options: ImagesToPdfOptions = {
      pageSize,
      margin,
      orientation,
    };

    try {
      const finalFile = await PdfProcessingEngine.imagesToPdf(images, options, (p) => setProgress(p));
      const previewUrl = URL.createObjectURL(finalFile);
      setPdfFile(finalFile);
      setPdfPreviewUrl(previewUrl);
    } catch (error) {
      console.error('Images to PDF conversion failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!pdfFile || !pdfPreviewUrl) return;
    const link = document.createElement('a');
    link.href = pdfPreviewUrl;
    link.download = pdfFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetState = () => {
    items.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setItems([]);
    setPdfFile(null);
    setPdfPreviewUrl(null);
    setProgress(0);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    return (bytes / k).toFixed(2) + ' KB';
  };

  return (
    <PageLayout
      title="Images to PDF"
      description="Convert multiple photos, physical sheet captures, or scan uploads into a single compiled PDF file."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Upload workspace & config panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-navy-100 pb-3">
              <span className="text-sm font-bold text-navy-900">Visual Image Compilation</span>
              {items.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetState}>
                  Clear All
                </Button>
              )}
            </div>

            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="image/*"
              multiple={true}
              maxSizeMB={15}
              label="Select Images to Compile"
              helperText="Upload JPG, PNG, or WEBP photos (up to 15MB each)"
              className="py-4 border-dashed border-2 rounded-xl"
            />

            {items.length > 0 && (
              <div className="flex flex-col gap-4 mt-2 animate-fadeIn">
                <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wider">
                  Images Queue ({items.length})
                </span>

                <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-navy-50/70 border border-navy-200 rounded-xl transition-all duration-200 hover:bg-navy-50"
                    >
                      <div className="flex items-center gap-3 w-3/5">
                        <div className="h-11 w-11 rounded-lg overflow-hidden border border-navy-200 bg-white flex items-center justify-center flex-shrink-0">
                          <img
                            src={item.previewUrl}
                            alt={`Upload thumbnail ${index}`}
                            className="object-cover h-full w-full"
                          />
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-navy-950 block truncate" title={item.file.name}>
                            {item.file.name}
                          </span>
                          <span className="text-[10px] text-navy-500 font-semibold block">
                            Size: {formatBytes(item.file.size)} • {item.width} x {item.height} px
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 hover:bg-navy-200 text-navy-600 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveDown(index)}
                          disabled={index === items.length - 1}
                          className="p-1.5 hover:bg-navy-200 text-navy-600 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                          title="Move down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-lg"
                          title="Remove image"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Configuration Toolbar */}
                <div className="border-t border-navy-150 pt-4 flex flex-col gap-4 mt-1">
                  <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Settings className="h-4 w-4 text-brand-600" />
                    PDF Layout Configurator
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Page Size */}
                    <div>
                      <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                        Page Dimensions
                      </label>
                      <select
                        value={pageSize}
                        onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | 'fit')}
                        className="w-full px-2.5 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      >
                        <option value="a4">Standard A4 (Form Spec)</option>
                        <option value="letter">US Letter (Standard Document)</option>
                        <option value="fit">Auto-Fit (Match original image)</option>
                      </select>
                    </div>

                    {/* Page Orientation */}
                    <div>
                      <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                        Page Orientation
                      </label>
                      <select
                        value={orientation}
                        onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                        disabled={pageSize === 'fit'}
                        className="w-full px-2.5 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer disabled:bg-navy-50 disabled:text-navy-500"
                      >
                        <option value="portrait">Portrait (Vertical)</option>
                        <option value="landscape">Landscape (Horizontal)</option>
                      </select>
                    </div>

                    {/* Page Margins */}
                    <div>
                      <label className="block text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                        Outer Margins
                      </label>
                      <select
                        value={margin}
                        onChange={(e) => setMargin(parseInt(e.target.value, 10))}
                        className="w-full px-2.5 py-2 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 cursor-pointer"
                      >
                        <option value={0}>None (Full-Bleed)</option>
                        <option value={15}>Narrow (15 px)</option>
                        <option value={35}>Wide (35 px)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Queue Summary & trigger */}
                <div className="mt-2 border-t border-navy-150 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="text-xs font-semibold text-navy-600 text-center sm:text-left">
                    <span>Generated File: </span>
                    <span className="font-bold text-navy-950 block sm:inline">
                      {items.length} {items.length === 1 ? 'Page' : 'Pages'}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={executeConversion}
                    disabled={items.length === 0}
                    className="w-full sm:w-auto font-bold"
                  >
                    Compile PDF Document
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Files are processed locally inside browser RAM. Absolute privacy.</span>
          </div>
        </div>

        {/* Output PDF Preview panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isProcessing && (
            <Card className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[300px]">
              <Spinner size="lg" label={`Synthesizing document layers... (${progress}%)`} />
            </Card>
          )}

          {!isProcessing && !pdfFile && (
            <Card className="flex flex-col items-center justify-center py-16 text-center text-navy-500 border-2 border-dashed border-navy-100 h-full min-h-[300px]">
              <FileImage className="h-10 w-10 text-navy-300 mb-2" />
              <p className="text-sm font-semibold">Stitch Board Empty</p>
              <p className="text-xs text-navy-400 mt-1">Upload images, reorder them, and click Compile PDF Document</p>
            </Card>
          )}

          {!isProcessing && pdfFile && pdfPreviewUrl && (
            <Card className="flex flex-col gap-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <span>PDF Compiled Successfully!</span>
              </div>

              {/* Statistics details */}
              <div className="bg-navy-50 rounded-xl p-4 border border-navy-100 flex flex-col gap-2.5 text-xs text-navy-600">
                <div className="flex justify-between font-semibold">
                  <span>Output PDF:</span>
                  <span className="font-bold text-navy-950 truncate max-w-[200px]" title={pdfFile.name}>
                    {pdfFile.name}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Compiled File Size:</span>
                  <span className="font-bold text-brand-700">{formatBytes(pdfFile.size)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-navy-200/50 pt-2.5 mt-1">
                  <span>Total Page Count:</span>
                  <span className="font-bold text-navy-950">{items.length} Pages</span>
                </div>
              </div>

              {/* visual preview */}
              <div className="border border-navy-200 rounded-lg overflow-hidden bg-navy-100 h-[220px]">
                <iframe
                  src={`${pdfPreviewUrl}#toolbar=0`}
                  title="PDF Compile Outcome Preview"
                  className="w-full h-full border-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="md" className="flex-1" onClick={resetState}>
                  <RefreshCw className="h-4 w-4" />
                  Compile New List
                </Button>
                <Button variant="primary" size="md" className="flex-1" onClick={triggerDownload}>
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
export default ImageToPdf;
