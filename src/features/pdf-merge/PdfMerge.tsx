import React, { useState } from 'react';
import { PageLayout } from '../../components/layout/PageLayout';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DragDropUpload } from '../../components/ui/DragDropUpload';
import { Spinner } from '../../components/ui/Spinner';
import { PdfProcessingEngine } from '../../utils/engines/PdfProcessingEngine';
import { 
  Download, 
  RefreshCw, 
  ShieldCheck, 
  FileCheck,
  FileText,
  ArrowUp,
  ArrowDown,
  Trash2
} from 'lucide-react';

interface MergeItem {
  id: string;
  file: File;
  pagesCount: number;
  sizeBytes: number;
  previewUrl?: string;
}

export const PdfMerge: React.FC = () => {
  const [items, setItems] = useState<MergeItem[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [mergedFile, setMergedFile] = useState<File | null>(null);
  const [mergedPreviewUrl, setMergedPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    const newItems: MergeItem[] = [];
    
    for (const file of files) {
      const metadata = await PdfProcessingEngine.getPdfMetadata(file);
      let previewUrl = '';
      try {
        previewUrl = await PdfProcessingEngine.renderPageToUrl(file, 1, 0.2);
      } catch (err) {
        console.error('Failed to render PDF thumbnail:', err);
      }
      newItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        pagesCount: metadata.pagesCount,
        sizeBytes: file.size,
        previewUrl,
      });
    }

    setItems((prev) => [...prev, ...newItems]);
    setMergedFile(null);
    setMergedPreviewUrl(null);
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
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const executeMerge = async () => {
    if (items.length < 2) return;
    setIsProcessing(true);
    setProgress(0);

    const files = items.map((item) => item.file);

    try {
      const finalFile = await PdfProcessingEngine.merge(files, (p) => setProgress(p));
      const previewUrl = URL.createObjectURL(finalFile);
      setMergedFile(finalFile);
      setMergedPreviewUrl(previewUrl);
    } catch (error) {
      console.error('PDF merging failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!mergedFile || !mergedPreviewUrl) return;
    const link = document.createElement('a');
    link.href = mergedPreviewUrl;
    link.download = mergedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetState = () => {
    setItems([]);
    setMergedFile(null);
    setMergedPreviewUrl(null);
    setProgress(0);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    return (bytes / k).toFixed(2) + ' KB';
  };

  const totalPages = items.reduce((acc, curr) => acc + curr.pagesCount, 0);
  const totalBytes = items.reduce((acc, curr) => acc + curr.sizeBytes, 0);

  return (
    <PageLayout
      title="Merge PDF"
      description="Combine multiple PDF documents, letters, or certificates into a single consolidated file."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Reordering & Control list panel */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card className="flex flex-col gap-5">
            <div className="flex justify-between items-center border-b border-navy-100 pb-3">
              <span className="text-sm font-bold text-navy-900">Upload & Reorder Files</span>
              {items.length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetState}>
                  Clear All
                </Button>
              )}
            </div>

            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="application/pdf"
              multiple={true}
              maxSizeMB={20}
              label="Select PDFs to Merge"
              helperText="Upload 2 or more PDF documents (up to 20MB each)"
              className="py-4 p-4 border-dashed border-2 rounded-xl"
            />

            {items.length > 0 && (
              <div className="flex flex-col gap-3 mt-2">
                <span className="text-[10px] font-bold text-navy-700 uppercase tracking-wider">
                  Documents Queue ({items.length})
                </span>

                <div className="flex flex-col gap-2.5 max-h-[350px] overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 bg-navy-50/70 border border-navy-200 rounded-xl transition-all duration-200 hover:bg-navy-50"
                    >
                      <div className="flex items-center gap-3 w-3/5">
                        <div className="w-10 h-10 rounded bg-navy-100 overflow-hidden flex items-center justify-center flex-shrink-0 border border-navy-200 shadow-sm">
                          {item.previewUrl ? (
                            <img src={item.previewUrl} className="object-cover w-full h-full" alt="PDF Page 1 thumbnail" />
                          ) : (
                            <FileText className="h-4.5 w-4.5 text-navy-500" />
                          )}
                        </div>
                        <div className="truncate">
                          <span className="text-xs font-bold text-navy-950 block truncate" title={item.file.name}>
                            {item.file.name}
                          </span>
                          <span className="text-[10px] text-navy-500 font-semibold block">
                            Pages: {item.pagesCount} • Size: {formatBytes(item.sizeBytes)}
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
                          title="Remove from queue"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Queue Summary & trigger */}
                <div className="mt-4 border-t border-navy-150 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="text-xs font-semibold text-navy-600 text-center sm:text-left">
                    <span>Merged Document: </span>
                    <span className="font-bold text-navy-950 block sm:inline">
                      {totalPages} Pages • ~{formatBytes(totalBytes)} Total
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={executeMerge}
                    disabled={items.length < 2}
                    className="w-full sm:w-auto font-bold"
                  >
                    Merge PDF Queue
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Files are processed locally in the browser memory. Absolute privacy.</span>
          </div>
        </div>

        {/* Merge output preview panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {isProcessing && (
            <Card className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[300px]">
              <Spinner size="lg" label={`Stitching PDF nodes... (${progress}%)`} />
            </Card>
          )}

          {!isProcessing && !mergedFile && (
            <Card className="flex flex-col items-center justify-center py-16 text-center text-navy-500 border-2 border-dashed border-navy-100 h-full min-h-[300px]">
              <FileText className="h-10 w-10 text-navy-300 mb-2" />
              <p className="text-sm font-semibold">Stitch Board Empty</p>
              <p className="text-xs text-navy-400 mt-1">Upload 2 or more PDF documents and click Merge PDF Queue</p>
            </Card>
          )}

          {!isProcessing && mergedFile && mergedPreviewUrl && (
            <Card className="flex flex-col gap-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <span>PDF Documents Merged successfully!</span>
              </div>

              {/* Statistics details */}
              <div className="bg-navy-50 rounded-xl p-4 border border-navy-100 flex flex-col gap-2.5 text-xs text-navy-600">
                <div className="flex justify-between font-semibold">
                  <span>Output Document:</span>
                  <span className="font-bold text-navy-950 truncate max-w-[200px]" title={mergedFile.name}>
                    {mergedFile.name}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Compiled File Size:</span>
                  <span className="font-bold text-brand-700">{formatBytes(mergedFile.size)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-navy-200/50 pt-2.5 mt-1">
                  <span>Total Page Count:</span>
                  <span className="font-bold text-navy-950">{totalPages} Pages</span>
                </div>
              </div>

              {/* visual preview */}
              <div className="border border-navy-200 rounded-lg overflow-hidden bg-navy-100 h-[220px]">
                <iframe
                  src={`${mergedPreviewUrl}#toolbar=0`}
                  title="PDF Merge Outcome Preview"
                  className="w-full h-full border-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="md" className="flex-1" onClick={resetState}>
                  <RefreshCw className="h-4 w-4" />
                  Merge New List
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
export default PdfMerge;
