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
  Scissors,
  CheckSquare,
  Square
} from 'lucide-react';

export const PdfSplit: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pagesCount, setPagesCount] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [thumbnailErrors, setThumbnailErrors] = useState<Record<number, string>>({});
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [rangeInput, setRangeInput] = useState<string>('');

  const [isLoadingThumbs, setIsLoadingThumbs] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitPreviewUrl, setSplitPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      setResultEmpty();
      setPagesCount(0);
      setThumbnails([]);
      setThumbnailErrors({});
      setSelectedPages([]);
      setRangeInput('');
      setIsLoadingThumbs(true);

      try {
        const metadata = await PdfProcessingEngine.getPdfMetadata(file);
        setPagesCount(metadata.pagesCount);

        if (metadata.pagesCount > 0) {
          setThumbnails(Array.from({ length: metadata.pagesCount }, () => ''));
          setSelectedPages([1]);
          setRangeInput('1');
        }

        // Render thumbnails independently so Safari failures do not hide page selectors.
        for (let i = 1; i <= metadata.pagesCount; i++) {
          try {
            const url = await PdfProcessingEngine.renderPageToUrl(file, i, 0.22);
            setThumbnails((prev) => {
              const next = [...prev];
              next[i - 1] = url;
              return next;
            });
          } catch (pageErr) {
            const message = pageErr instanceof Error ? pageErr.message : 'Preview render failed';
            setThumbnailErrors((prev) => ({ ...prev, [i]: message }));
            console.error(`Error rendering PDF split thumbnail for page ${i}:`, pageErr);
          }
        }
      } catch (err) {
        console.error('Error generating PDF thumbnails:', err);
      } finally {
        setIsLoadingThumbs(false);
      }
    }
  };

  const togglePageSelection = (pageNum: number) => {
    setSelectedPages((prev) => {
      let updated;
      if (prev.includes(pageNum)) {
        updated = prev.filter((p) => p !== pageNum);
      } else {
        updated = [...prev, pageNum].sort((a, b) => a - b);
      }
      // Re-generate matching text range representation
      setRangeInput(generateRangeText(updated));
      return updated;
    });
  };

  const handleRangeTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setRangeInput(text);
    // Parse range (e.g. "1, 2-4, 6") and update selected page bounds
    const pages = parseRangeText(text, pagesCount);
    setSelectedPages(pages);
  };

  // Helper to generate text like "1-3, 5" from [1, 2, 3, 5]
  const generateRangeText = (pages: number[]): string => {
    if (pages.length === 0) return '';
    const ranges: string[] = [];
    let start = pages[0];
    let end = pages[0];

    for (let i = 1; i < pages.length; i++) {
      if (pages[i] === end + 1) {
        end = pages[i];
      } else {
        ranges.push(start === end ? `${start}` : `${start}-${end}`);
        start = pages[i];
        end = pages[i];
      }
    }
    ranges.push(start === end ? `${start}` : `${start}-${end}`);
    return ranges.join(', ');
  };

  // Helper to parse text like "1-3, 5" into [1, 2, 3, 5]
  const parseRangeText = (text: string, maxPages: number): number[] => {
    const pages = new Set<number>();
    const parts = text.split(',');

    for (const part of parts) {
      const trimmed = part.trim();
      if (/^\d+$/.test(trimmed)) {
        const num = parseInt(trimmed, 10);
        if (num >= 1 && num <= maxPages) pages.add(num);
      } else if (/^\d+-\d+$/.test(trimmed)) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (start >= 1 && end <= maxPages && start <= end) {
          for (let i = start; i <= end; i++) {
            pages.add(i);
          }
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  };

  const selectAll = () => {
    const all = Array.from({ length: pagesCount }, (_, i) => i + 1);
    setSelectedPages(all);
    setRangeInput(generateRangeText(all));
  };

  const selectNone = () => {
    setSelectedPages([]);
    setRangeInput('');
  };

  const executeSplit = async () => {
    if (!selectedFile || selectedPages.length === 0) return;
    setIsProcessing(true);
    setProgress(0);

    try {
      const finalFile = await PdfProcessingEngine.split(
        selectedFile,
        selectedPages,
        (p) => setProgress(p)
      );
      const previewUrl = URL.createObjectURL(finalFile);
      setSplitFile(finalFile);
      setSplitPreviewUrl(previewUrl);
    } catch (error) {
      console.error('PDF splitting failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerDownload = () => {
    if (!splitFile || !splitPreviewUrl) return;
    const link = document.createElement('a');
    link.href = splitPreviewUrl;
    link.download = splitFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const setResultEmpty = () => {
    setSplitFile(null);
    setSplitPreviewUrl(null);
    setProgress(0);
  };

  const resetState = () => {
    setSelectedFile(null);
    setPagesCount(0);
    setThumbnails([]);
    setThumbnailErrors({});
    setSelectedPages([]);
    setRangeInput('');
    setResultEmpty();
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    return (bytes / k).toFixed(2) + ' KB';
  };

  return (
    <PageLayout
      title="Split PDF"
      description="Select individual pages or custom ranges visually to split a PDF into separate files."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* visual thumbnails page selectors panel */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!selectedFile ? (
            <DragDropUpload
              onFileSelect={handleFileSelect}
              accept="application/pdf"
              maxSizeMB={20}
              label="Upload PDF to Split"
              helperText="Upload any standard PDF file up to 20MB"
            />
          ) : (
            <Card className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-b border-navy-100 pb-3">
                <div className="flex items-center gap-2">
                  <Scissors className="h-5 w-5 text-brand-600 animate-pulse" />
                  <span className="text-sm font-bold text-navy-900">Select Pages to Keep</span>
                </div>
                <Button variant="ghost" size="sm" onClick={resetState}>
                  Change File
                </Button>
              </div>

              {pagesCount === 0 && isLoadingThumbs ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Spinner size="lg" label="Reading PDF pages..." />
                </div>
              ) : (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  {isLoadingThumbs && (
                    <div className="flex items-center gap-2 rounded-xl border border-brand-100 bg-brand-50/60 px-3 py-2 text-xs font-bold text-brand-800">
                      <Spinner size="sm" />
                      <span>Generating page visuals. You can select pages while previews load.</span>
                    </div>
                  )}

                  {Object.keys(thumbnailErrors).length > 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] font-semibold text-amber-800">
                      Some page previews could not render on this browser, but page selection still works.
                    </div>
                  )}

                  {/* Selectors and custom text range input */}
                  <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-navy-50 border border-navy-150 p-4 rounded-xl">
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs" onClick={selectAll}>
                        Select All
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs" onClick={selectNone}>
                        Clear All
                      </Button>
                    </div>

                    <div className="w-full sm:w-1/2">
                      <label className="block text-[9px] font-bold text-navy-700 uppercase tracking-wider mb-1">
                        Custom Range Picker
                      </label>
                      <input
                        type="text"
                        value={rangeInput}
                        onChange={handleRangeTextChange}
                        placeholder="e.g. 1-3, 5"
                        className="w-full px-3 py-1.5 text-xs bg-white border border-navy-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold"
                      />
                    </div>
                  </div>

                  {/* Thumbnail Selector Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[380px] overflow-y-auto p-1">
                    {Array.from({ length: pagesCount }, (_, idx) => {
                      const pageNum = idx + 1;
                      const url = thumbnails[idx];
                      const isChecked = selectedPages.includes(pageNum);
                      const thumbnailError = thumbnailErrors[pageNum];
                      return (
                        <div
                          key={pageNum}
                          onClick={() => togglePageSelection(pageNum)}
                          className={`relative border-2 rounded-xl overflow-hidden cursor-pointer bg-white transition-all hover:scale-[1.02] flex flex-col items-center ${
                            isChecked
                              ? 'border-brand-500 shadow-md ring-2 ring-brand-100'
                              : 'border-navy-200 shadow-sm hover:border-navy-350'
                          }`}
                        >
                          {/* Rendering Canvas Slice */}
                          <div className="aspect-[3/4] w-full bg-navy-50/50 flex items-center justify-center p-2 border-b border-navy-100">
                            {url ? (
                              <img
                                src={url}
                                alt={`Page ${pageNum}`}
                                className="object-contain w-full h-full"
                              />
                            ) : (
                              <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-navy-200 bg-white text-center">
                                {thumbnailError ? (
                                  <FileText className="h-7 w-7 text-amber-500" />
                                ) : (
                                  <Spinner size="sm" />
                                )}
                                <span className="text-[10px] font-black text-navy-500">
                                  Page {pageNum}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 p-2 w-full justify-center bg-navy-50/30">
                            {isChecked ? (
                              <CheckSquare className="h-4 w-4 text-brand-600 flex-shrink-0" />
                            ) : (
                              <Square className="h-4 w-4 text-navy-400 flex-shrink-0" />
                            )}
                            <span className="text-xs font-bold text-navy-850">Page {pageNum}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!splitFile && (
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full mt-2"
                      onClick={executeSplit}
                      disabled={selectedPages.length === 0}
                      isLoading={isProcessing}
                    >
                      Split & Extract PDF
                    </Button>
                  )}
                </div>
              )}
            </Card>
          )}

          {/* Privacy Note */}
          <div className="flex items-center gap-2 p-3 bg-brand-50/50 border border-brand-100 rounded-xl text-brand-800 text-xs font-semibold select-none">
            <ShieldCheck className="h-4 w-4 text-brand-600 flex-shrink-0" />
            <span>Processing runs locally inside browser RAM sandboxes.</span>
          </div>
        </div>

        {/* Split Output/Result Preview Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {isProcessing && (
            <Card className="flex flex-col items-center justify-center py-16 text-center h-full min-h-[300px]">
              <Spinner size="lg" label={`Extracting page nodes... (${progress}%)`} />
            </Card>
          )}

          {!isProcessing && !splitFile && selectedFile && (
            <Card className="flex flex-col items-center justify-center py-16 text-center text-navy-500 border-2 border-dashed border-navy-100 h-full min-h-[300px]">
              <FileText className="h-10 w-10 text-navy-300 mb-2" />
              <p className="text-sm font-semibold">Output Workspace Empty</p>
              <p className="text-xs text-navy-400 mt-1">Select visual page thumbnails and click Split & Extract PDF</p>
            </Card>
          )}

          {!isProcessing && splitFile && splitPreviewUrl && selectedFile && (
            <Card className="flex flex-col gap-5 animate-fadeIn">
              <div className="flex items-center gap-2.5 text-brand-700 font-bold text-sm bg-brand-50 border border-brand-100 rounded-xl p-3">
                <FileCheck className="h-5 w-5 text-brand-600" />
                <span>PDF Extraction complete!</span>
              </div>

              {/* Stats details */}
              <div className="bg-navy-50 rounded-xl p-4 border border-navy-100 flex flex-col gap-2.5 text-xs text-navy-600">
                <div className="flex justify-between font-semibold">
                  <span>Extracted Document:</span>
                  <span className="font-bold text-navy-950 truncate max-w-[150px]" title={splitFile.name}>
                    {splitFile.name}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Output Byte Size:</span>
                  <span className="font-bold text-brand-700">{formatBytes(splitFile.size)}</span>
                </div>
                <div className="flex justify-between font-semibold border-t border-navy-200/50 pt-2.5 mt-1">
                  <span>Retained Pages:</span>
                  <span className="font-bold text-navy-950">
                    {selectedPages.length} Pages ({generateRangeText(selectedPages)})
                  </span>
                </div>
              </div>

              {/* visual preview */}
              <div className="border border-navy-200 rounded-lg overflow-hidden bg-navy-100 h-[220px]">
                <iframe
                  src={`${splitPreviewUrl}#toolbar=0`}
                  title="PDF Split Outcome Preview"
                  className="w-full h-full border-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" size="sm" className="flex-grow" onClick={() => setSplitFile(null)}>
                  <RefreshCw className="h-4 w-4" />
                  Adjust Selections
                </Button>
                <Button variant="primary" size="sm" className="flex-grow" onClick={triggerDownload}>
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
export default PdfSplit;
