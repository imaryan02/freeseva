import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import type { PdfDebugSession } from '../debug/pdfDiagnostics';
// Import worker with Vite's worker compiler query suffix
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker';

// Configure pre-instantiated workerPort to bypass dynamic workerSrc resolution completely
const worker = new PdfWorker();
pdfjsLib.GlobalWorkerOptions.workerPort = worker;

export interface PdfProcessingResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  previewUrl: string;
}

export interface ImagesToPdfOptions {
  pageSize: 'a4' | 'letter' | 'fit';
  margin: number; // in pixels/points
  orientation: 'portrait' | 'landscape';
}

export class PdfProcessingEngine {
  private static bytesToFile(bytes: Uint8Array, name: string, type: string): File {
    const copy = new Uint8Array(bytes);
    return new File([copy.buffer], name, { type });
  }

  /**
   * Reads basic PDF metadata (number of pages, original file size)
   */
  static async getPdfMetadata(file: File): Promise<{ pagesCount: number; sizeBytes: number }> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      return {
        pagesCount: pdf.numPages,
        sizeBytes: file.size,
      };
    } catch (err) {
      console.error('Failed to get PDF metadata:', err);
      return { pagesCount: 0, sizeBytes: file.size };
    }
  }

  /**
   * Renders a specific page of a PDF onto an offscreen canvas and returns its data URL.
   * Useful for split selections or visual previews.
   */
  static async renderPageToUrl(file: File, pageNumber: number, scale: number = 0.5): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const page = await pdf.getPage(pageNumber);
    
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas 2D context not available for rendering PDF pages');
    }

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      canvas: canvas,
    }).promise;

    return canvas.toDataURL('image/jpeg', 0.8);
  }

  /**
   * Compresses PDF documents client-side by rendering pages to compressed canvas JPEGs 
   * and compiling them into a new document. Gives massive compression for scanned forms.
   * 
   * When useMonochrome is true, pages are rendered at high resolution, converted to
   * crisp black & white, then iteratively compressed with decreasing JPEG quality
   * until the result fits within targetSizeKB. This bypasses the anti-ballooning
   * safeguard because the user explicitly chose this mode for text-heavy PDFs.
   */
  static async compress(
    file: File,
    level: 'low' | 'medium' | 'high',
    onProgress?: (progress: number) => void,
    useMonochrome: boolean = false,
    targetSizeKB: number = 0,
    preferredMinSizeKB: number = 0,
    debug?: PdfDebugSession
  ): Promise<PdfProcessingResult> {
    const compressionStartedAt = performance.now();
    debug?.step('Compression Started', {
      level,
      useMonochrome,
      targetSizeKB,
      preferredMinSizeKB,
      fileName: file.name,
      fileSizeBytes: file.size,
    });

    let arrayBuffer: ArrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      debug?.step('File Read Success', {
        arrayBufferBytes: arrayBuffer.byteLength,
      });
    } catch (err) {
      debug?.error('File Read Failed', err);
      throw err;
    }

    let pdfDoc: pdfjsLib.PDFDocumentProxy;
    try {
      pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      debug?.step('PDF.js Document Loaded', {
        pagesCount: pdfDoc.numPages,
      });
    } catch (err) {
      debug?.error('PDF.js Document Load Failed', err);
      throw err;
    }

    const pagesCount = pdfDoc.numPages;

    // --- Force-compress path: structural optimization first, rasterization fallback ---
    // Phase 1 tries Adobe-style lossless optimization (keeps text as vector).
    // Phase 2 falls back to rasterization only if structural optimization isn't enough.
    if (useMonochrome && targetSizeKB > 0) {
      return this.compressMonochromeIterative(file, pdfDoc, pagesCount, targetSizeKB, preferredMinSizeKB, onProgress, debug);
    }
 
    // --- Standard rasterization path ---
    const profiles = {
      low: { scale: 1.0, quality: 0.7 },
      medium: { scale: 0.75, quality: 0.5 },
      high: { scale: 0.55, quality: 0.35 },
    };
 
    const config = profiles[level];
 
    // Create a new empty PDF Document
    const resultPdf = await PDFDocument.create();
 
    for (let i = 1; i <= pagesCount; i++) {
      if (onProgress) {
        onProgress(Math.round(((i - 1) / pagesCount) * 90));
      }
 
      debug?.info('Page Render Started', {
        pageNumber: i,
        pagesCount,
        scale: config.scale,
      });

      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: config.scale });
      
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) continue;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
 
      try {
        await page.render({
          canvasContext: ctx,
          viewport,
          canvas: canvas,
        }).promise;
      } catch (err) {
        debug?.error('Page Render Failed', err, {
          pageNumber: i,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          canvasPixels: canvas.width * canvas.height,
        });
        throw err;
      }

      const imgDataUrl = canvas.toDataURL('image/jpeg', config.quality);
      const imgBytes = await fetch(imgDataUrl).then((r) => r.arrayBuffer());
      debug?.info('Page Encoded As JPEG', {
        pageNumber: i,
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        canvasPixels: canvas.width * canvas.height,
        jpegBytes: imgBytes.byteLength,
      });
 
      const embedImg = await resultPdf.embedJpg(imgBytes);
      const { width, height } = embedImg.scale(1.0);
 
      const newPage = resultPdf.addPage([width, height]);
      newPage.drawImage(embedImg, {
        x: 0,
        y: 0,
        width,
        height,
      });
    }

    if (onProgress) onProgress(95);

    const resultPdfBytes = await resultPdf.save();
    debug?.step('Compressed PDF Saved', {
      outputBytes: resultPdfBytes.byteLength,
      elapsedMs: Math.round(performance.now() - compressionStartedAt),
    });
    
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const compressedFile = this.bytesToFile(resultPdfBytes, `${baseName}_compressed.pdf`, 'application/pdf');

    // Anti-ballooning safeguard: if rasterization made it bigger, return original
    if (compressedFile.size > file.size) {
      if (onProgress) onProgress(100);
      return {
        file,
        originalSize: file.size,
        compressedSize: file.size,
        savingsPercentage: 0,
        previewUrl: URL.createObjectURL(file),
      };
    }

    if (onProgress) onProgress(100);

    const savingsPercentage = Math.max(
      0,
      Math.round(((file.size - compressedFile.size) / file.size) * 100)
    );

    const previewUrl = URL.createObjectURL(compressedFile);
    debug?.end('Compression Finished', {
      originalSizeBytes: file.size,
      compressedSizeBytes: compressedFile.size,
      savingsPercentage,
    });

    return {
      file: compressedFile,
      originalSize: file.size,
      compressedSize: compressedFile.size,
      savingsPercentage,
      previewUrl,
    };
  }

  /**
   * Force-compress pipeline — Adobe-style approach:
   * 
   * Phase 1: STRUCTURAL OPTIMIZATION (like Adobe Acrobat)
   *   - Copy all pages to a fresh PDF document (strips edit history, unused objects)
   *   - Remove all metadata (title, author, creator, producer, etc.)
   *   - Re-save with clean structure
   *   - Text stays as VECTOR text → perfect quality, selectable, searchable
   *   - This alone typically reduces size 20-50% for bloated PDFs
   * 
   * Phase 2: RASTERIZATION FALLBACK (only if Phase 1 can't hit target)
   *   - Convert pages to JPEG images and find the best scale+quality combo
   *   - Only used as a last resort when structural optimization isn't enough
   */
  private static async compressMonochromeIterative(
    file: File,
    pdfDoc: pdfjsLib.PDFDocumentProxy,
    pagesCount: number,
    targetSizeKB: number,
    preferredMinSizeKB: number = 0,
    onProgress?: (progress: number) => void,
    debug?: PdfDebugSession,
  ): Promise<PdfProcessingResult> {
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const targetBytes = targetSizeKB * 1024;
    const preferredMinBytes = Math.max(0, preferredMinSizeKB * 1024);
    const qualityFloorBytes = preferredMinBytes > 0 ? preferredMinBytes : targetBytes * 0.6;

    interface PdfCandidate {
      bytes: Uint8Array;
      size: number;
      scale: number;
      quality: number;
    }

    const buildResult = (outputFile: File): PdfProcessingResult => {
      const savingsPercentage = Math.max(
        0,
        Math.round(((file.size - outputFile.size) / file.size) * 100)
      );

      return {
        file: outputFile,
        originalSize: file.size,
        compressedSize: outputFile.size,
        savingsPercentage,
        previewUrl: URL.createObjectURL(outputFile),
      };
    };

    const scoreCandidate = (candidate: PdfCandidate): number => {
      const scaleScore = Math.min(candidate.scale, 1.5) / 1.5;
      const sizeScore = Math.min(candidate.size / targetBytes, 1);
      const underFilledPenalty = candidate.size < qualityFloorBytes ? 0.2 : 0;

      return candidate.quality * 0.55 + scaleScore * 0.35 + sizeScore * 0.1 - underFilledPenalty;
    };

    // ═══════════════════════════════════════════════════════════
    // PHASE 1: Structural Optimization (Adobe-style, lossless)
    // ═══════════════════════════════════════════════════════════
    if (onProgress) onProgress(5);
    let structurallyOptimizedFile: File | null = null;

    try {
      debug?.step('Structural Optimization Started', {
        targetBytes,
        preferredMinBytes,
        pagesCount,
      });
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

      // Create a clean new document and copy all pages
      const cleanDoc = await PDFDocument.create();
      const pageIndices = srcDoc.getPageIndices();
      const copiedPages = await cleanDoc.copyPages(srcDoc, pageIndices);
      copiedPages.forEach((page) => cleanDoc.addPage(page));

      // Strip all metadata (like Adobe does)
      cleanDoc.setTitle('');
      cleanDoc.setAuthor('');
      cleanDoc.setSubject('');
      cleanDoc.setCreator('');
      cleanDoc.setProducer('');
      cleanDoc.setKeywords([]);

      if (onProgress) onProgress(30);

      // Save the structurally optimized PDF
      const cleanBytes = await cleanDoc.save();
      const cleanFile = this.bytesToFile(cleanBytes, `${baseName}_compressed.pdf`, 'application/pdf');
      debug?.step('Structural Optimization Saved', {
        outputBytes: cleanFile.size,
        targetBytes,
      });

      if (onProgress) onProgress(40);

      // Check if structural optimization alone hits the target
      if (cleanFile.size <= targetBytes) {
        if (onProgress) onProgress(100);
        return buildResult(cleanFile);
      }

      if (cleanFile.size < file.size) {
        structurallyOptimizedFile = cleanFile;
      }
    } catch (err) {
      debug?.error('Structural Optimization Failed', err);
      console.warn('Structural optimization failed, falling back to rasterization:', err);
    }

    if (onProgress) onProgress(45);
    debug?.step('Rasterization Fallback Started', {
      scaleTiers: [1.75, 1.5, 1.35, 1.2, 1.0, 0.85, 0.75, 0.65, 0.5],
      qualitySteps: [0.95, 0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66, 0.62, 0.58, 0.54, 0.5, 0.46, 0.42, 0.38, 0.34, 0.3, 0.25, 0.2, 0.15, 0.1],
      warning: 'This path renders each page repeatedly and is the highest-risk path on iPhone Safari memory limits.',
    });

    // ═══════════════════════════════════════════════════════════
    // PHASE 2: Rasterization Fallback (only if Phase 1 wasn't enough)
    // ═══════════════════════════════════════════════════════════
    const scaleTiers = [1.75, 1.5, 1.35, 1.2, 1.0, 0.85, 0.75, 0.65, 0.5];
    const qualitySteps = [0.95, 0.9, 0.86, 0.82, 0.78, 0.74, 0.7, 0.66, 0.62, 0.58, 0.54, 0.5, 0.46, 0.42, 0.38, 0.34, 0.3, 0.25, 0.2, 0.15, 0.1];
    const totalRounds = scaleTiers.length;
    let bestPdfBytes: Uint8Array | null = null;
    let bestUnderTargetCandidate: PdfCandidate | null = null;
    let bestWithinRangeCandidate: PdfCandidate | null = null;

    for (let si = 0; si < scaleTiers.length; si++) {
      const renderScale = scaleTiers[si];
      const pageCanvases: HTMLCanvasElement[] = [];
      debug?.info('Raster Scale Tier Started', {
        scaleIndex: si + 1,
        renderScale,
        pagesCount,
      });

      for (let i = 1; i <= pagesCount; i++) {
        if (onProgress) {
          const baseProgress = 45 + (si / totalRounds) * 45;
          const renderProgress = ((i - 1) / pagesCount) * (15 / totalRounds);
          onProgress(Math.round(baseProgress + renderProgress));
        }

        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) continue;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        try {
          await page.render({
            canvasContext: ctx,
            viewport,
            canvas: canvas,
          }).promise;
        } catch (err) {
          debug?.error('Raster Page Render Failed', err, {
            scaleIndex: si + 1,
            renderScale,
            pageNumber: i,
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            canvasPixels: canvas.width * canvas.height,
          });
          throw err;
        }

        pageCanvases.push(canvas);
      }
      debug?.info('Raster Scale Tier Rendered', {
        scaleIndex: si + 1,
        renderScale,
        canvasesHeldInMemory: pageCanvases.length,
        totalCanvasPixels: pageCanvases.reduce((sum, canvas) => sum + canvas.width * canvas.height, 0),
      });

      // Try quality steps at this scale
      for (let qi = 0; qi < qualitySteps.length; qi++) {
        const quality = qualitySteps[qi];

        if (onProgress) {
          const baseProgress = 45 + (si / totalRounds) * 45;
          const qualityProgress = (15 / totalRounds) + ((qi + 1) / qualitySteps.length) * (30 / totalRounds);
          onProgress(Math.round(baseProgress + qualityProgress));
        }

        const iterPdf = await PDFDocument.create();

        for (const canvas of pageCanvases) {
          const imgDataUrl = canvas.toDataURL('image/jpeg', quality);
          const imgBytes = await fetch(imgDataUrl).then((r) => r.arrayBuffer());

          const embedImg = await iterPdf.embedJpg(imgBytes);
          const { width, height } = embedImg.scale(1.0);

          const newPage = iterPdf.addPage([width, height]);
          newPage.drawImage(embedImg, {
            x: 0,
            y: 0,
            width,
            height,
          });
        }

        const pdfBytes = await iterPdf.save();
        bestPdfBytes = pdfBytes as Uint8Array;
        debug?.info('Raster Candidate Saved', {
          scaleIndex: si + 1,
          renderScale,
          quality,
          outputBytes: pdfBytes.byteLength,
          underTarget: pdfBytes.byteLength <= targetBytes,
        });

        if (pdfBytes.byteLength <= targetBytes) {
          const candidate: PdfCandidate = {
            bytes: pdfBytes as Uint8Array,
            size: pdfBytes.byteLength,
            scale: renderScale,
            quality,
          };

          if (
            !bestUnderTargetCandidate ||
            scoreCandidate(candidate) > scoreCandidate(bestUnderTargetCandidate)
          ) {
            bestUnderTargetCandidate = candidate;
          }

          if (
            preferredMinBytes > 0 &&
            pdfBytes.byteLength >= preferredMinBytes &&
            (!bestWithinRangeCandidate ||
              scoreCandidate(candidate) > scoreCandidate(bestWithinRangeCandidate))
          ) {
            bestWithinRangeCandidate = candidate;
          }
        }
      }
    }

    if (onProgress) onProgress(95);

    const finalCandidate = bestWithinRangeCandidate || bestUnderTargetCandidate;

    if (!finalCandidate && structurallyOptimizedFile) {
      if (onProgress) onProgress(100);
      return buildResult(structurallyOptimizedFile);
    }

    // Prefer the best quality candidate inside the user's range. If none exists,
    // use the best quality candidate under max. Only fall back to the last
    // rasterized result when no under-target candidate was possible.
    const finalBytes = finalCandidate?.bytes || bestPdfBytes!;
    const compressedFile = this.bytesToFile(finalBytes, `${baseName}_compressed.pdf`, 'application/pdf');

    if (onProgress) onProgress(100);
    debug?.end('Compression Finished', {
      originalSizeBytes: file.size,
      compressedSizeBytes: compressedFile.size,
      usedUnderTargetCandidate: Boolean(finalCandidate),
      targetBytes,
    });
    return buildResult(compressedFile);
  }

  /**
   * Merges multiple PDF files in sequential order.
   */
  static async merge(
    files: File[],
    onProgress?: (progress: number) => void
  ): Promise<File> {
    const mergedPdf = await PDFDocument.create();
    let fileIndex = 0;

    for (const file of files) {
      if (onProgress) {
        onProgress(Math.round((fileIndex / files.length) * 100));
      }

      const fileBuffer = await file.arrayBuffer();
      const currentDoc = await PDFDocument.load(fileBuffer);
      const pageIndices = currentDoc.getPageIndices();
      
      // Copy pages from source doc
      const copiedPages = await mergedPdf.copyPages(currentDoc, pageIndices);
      
      // Append pages to merged document
      copiedPages.forEach((page) => mergedPdf.addPage(page));
      
      fileIndex++;
    }

    if (onProgress) onProgress(95);

    const mergedBytes = await mergedPdf.save();
    const finalFile = this.bytesToFile(mergedBytes, 'merged_documents.pdf', 'application/pdf');

    if (onProgress) onProgress(100);
    return finalFile;
  }

  /**
   * Splits a PDF file by extracting selected pages.
   */
  static async split(
    file: File,
    selectedPages: number[], // 1-indexed numbers of pages to keep
    onProgress?: (progress: number) => void
  ): Promise<File> {
    if (onProgress) onProgress(20);

    const arrayBuffer = await file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(arrayBuffer);
    const splitDoc = await PDFDocument.create();

    if (onProgress) onProgress(50);

    // Copy selected pages (0-indexed in pdf-lib)
    const zeroIndexedPages = selectedPages.map((p) => p - 1);
    const copiedPages = await splitDoc.copyPages(sourceDoc, zeroIndexedPages);
    
    copiedPages.forEach((page) => splitDoc.addPage(page));

    if (onProgress) onProgress(80);

    const splitBytes = await splitDoc.save();
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const finalFile = this.bytesToFile(splitBytes, `${baseName}_split.pdf`, 'application/pdf');

    if (onProgress) onProgress(100);
    return finalFile;
  }

  /**
   * Compiles multiple image files into a single structured PDF sheet.
   */
  static async imagesToPdf(
    images: File[],
    options: ImagesToPdfOptions,
    onProgress?: (progress: number) => void
  ): Promise<File> {
    const pdfDoc = await PDFDocument.create();
    let imgIndex = 0;

    for (const image of images) {
      if (onProgress) {
        onProgress(Math.round((imgIndex / images.length) * 100));
      }

      const imgBuffer = await image.arrayBuffer();
      let embedImg;
      
      // Embed based on mime type
      if (image.type === 'image/png') {
        embedImg = await pdfDoc.embedPng(imgBuffer);
      } else {
        embedImg = await pdfDoc.embedJpg(imgBuffer);
      }

      const { width, height } = embedImg.scale(1.0);

      // Define standard layout constraints (A4 points: 595.27 x 841.89, Letter points: 612 x 792)
      let pageWidth = width;
      let pageHeight = height;

      if (options.pageSize === 'a4') {
        pageWidth = options.orientation === 'portrait' ? 595.27 : 841.89;
        pageHeight = options.orientation === 'portrait' ? 841.89 : 595.27;
      } else if (options.pageSize === 'letter') {
        pageWidth = options.orientation === 'portrait' ? 612 : 792;
        pageHeight = options.orientation === 'portrait' ? 792 : 612;
      }

      const margin = options.margin;
      const targetWidth = pageWidth - margin * 2;
      const targetHeight = pageHeight - margin * 2;
      
      // Scale to fit respecting margins
      const scaleRatio = Math.min(targetWidth / width, targetHeight / height);
      const drawWidth = width * scaleRatio;
      const drawHeight = height * scaleRatio;

      const newPage = pdfDoc.addPage([pageWidth, pageHeight]);
      
      // Center image inside layout
      const drawX = margin + (targetWidth - drawWidth) / 2;
      const drawY = margin + (targetHeight - drawHeight) / 2;

      newPage.drawImage(embedImg, {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
      });

      imgIndex++;
    }

    if (onProgress) onProgress(90);

    const pdfBytes = await pdfDoc.save();
    const finalFile = this.bytesToFile(pdfBytes, 'images_compiled.pdf', 'application/pdf');

    if (onProgress) onProgress(100);
    return finalFile;
  }
}
