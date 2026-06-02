import JSZip from 'jszip';
import { ImageCompressionEngine } from './ImageCompressionEngine';
import { SignatureCompressionEngine } from './SignatureCompressionEngine';
import { PdfProcessingEngine } from './PdfProcessingEngine';
import { ImageResizeEngine } from './ImageResizeEngine';
import type { PdfDebugSession } from '../debug/pdfDiagnostics';

export interface BatchItem {
  id: string;
  file: File;
  targetType: 'photo' | 'signature' | 'document' | 'generic';
  mode: 'compress' | 'resize';
  minSizeKB: number;
  maxSizeKB: number;
  resizeWidth: number;
  resizeHeight: number;
  resizeUnit: 'px' | 'cm' | 'inch';
  maintainAspectRatio: boolean;
  outputFormat: 'jpeg' | 'png' | 'pdf';
  customName: string; // The editable name
  previewUrl?: string; // Cache page 1 preview / image preview
  sizeMode?: 'range' | 'single'; // Constraint mode: range or single target
}

export interface BatchItemResult {
  id: string;
  originalFile: File;
  processedFile: File | null;
  status: 'idle' | 'processing' | 'completed' | 'failed';
  error?: string;
  previewUrl?: string;
}

export class AllInOneEngine {
  /**
   * Helper to non-destructively pad a Blob to a minimum size in KB.
   * This appends a zero-padded buffer to the end of the file.
   */
  static padBlob(blob: Blob, minKB: number): Blob {
    const minBytes = minKB * 1024;
    if (blob.size >= minBytes) {
      return blob;
    }
    const paddingSize = minBytes - blob.size;
    const padding = new Uint8Array(paddingSize);
    return new Blob([blob, padding], { type: blob.type });
  }

  /**
   * Processes a single item in the batch queue according to its settings.
   */
  static async processItem(
    item: BatchItem,
    onProgress?: (progress: number) => void,
    debug?: PdfDebugSession
  ): Promise<File> {
    const { 
      file, 
      targetType, 
      mode, 
      minSizeKB, 
      maxSizeKB, 
      resizeWidth, 
      resizeHeight, 
      resizeUnit, 
      maintainAspectRatio, 
      outputFormat, 
      customName 
    } = item;

    let finalFile: File;

    if (onProgress) onProgress(10);

    // Get the normalized custom name and standard extension based on outputFormat
    const ext = outputFormat === 'pdf' ? 'pdf' : (outputFormat === 'png' ? 'png' : 'jpg');
    let finalName = customName.trim();
    if (!finalName) {
      finalName = file.name;
    }
    
    // If user left or changed extension, strip and normalize it
    const lastDot = finalName.lastIndexOf('.');
    if (lastDot !== -1) {
      finalName = finalName.substring(0, lastDot);
    }
    finalName = `${finalName}.${ext}`;

    if (mode === 'resize') {
      // 1. Dimensions resizing path
      const options = {
        width: resizeWidth,
        height: resizeHeight,
        unit: resizeUnit,
        dpi: 300,
        maintainAspectRatio,
        outputFormat: outputFormat === 'pdf' ? 'jpeg' : outputFormat, // Resize container as image first
      };

      if (onProgress) onProgress(30);
      const resizeResult = await ImageResizeEngine.resize(file, options);
      let processedBlob: Blob = resizeResult.file;

      if (outputFormat === 'pdf') {
        // If they want PDF output after resizing, compile it
        const pdfFile = await PdfProcessingEngine.imagesToPdf([resizeResult.file], {
          pageSize: 'fit',
          margin: 0,
          orientation: 'portrait'
        });
        processedBlob = pdfFile;
      }
      
      finalFile = new File([processedBlob], finalName, { type: processedBlob.type });

    } else {
      // 2. Compression target path
      const targetKB = Math.max(
        5,
        minSizeKB > 0 && maxSizeKB > minSizeKB
          ? minSizeKB + (maxSizeKB - minSizeKB) * 0.8
          : maxSizeKB * 0.9
      );

      if (targetType === 'photo' || targetType === 'generic') {
        const mime = outputFormat === 'png' ? 'image/png' : 'image/jpeg';
        const result = await ImageCompressionEngine.compress(file, targetKB, (p) => {
          if (onProgress) onProgress(10 + Math.round(p * 0.7));
        });
        const processedBlob = result.file;
        finalFile = new File([processedBlob], finalName, { type: mime });

      } else if (targetType === 'signature') {
        const options = {
          contrastBoost: true,
          threshold: 180, // Sensible ink threshold
          outputFormat: outputFormat === 'png' ? ('png' as const) : ('jpeg' as const),
          preserveTransparency: outputFormat === 'png',
        };
        
        const result = await SignatureCompressionEngine.processAndCompress(file, targetKB, options, (p) => {
          if (onProgress) onProgress(10 + Math.round(p * 0.7));
        });
        const processedBlob = result.file;
        finalFile = new File([processedBlob], finalName, { type: processedBlob.type });

      } else if (targetType === 'document') {
        // Always use the smart pipeline: structural optimization first, rasterization fallback
        debug?.step('All-in-One PDF Compression Started', {
          itemId: item.id,
          fileName: file.name,
          fileSizeBytes: file.size,
          minSizeKB,
          maxSizeKB,
          sizeMode: item.sizeMode,
        });
        const result = await PdfProcessingEngine.compress(file, 'low', (p) => {
          if (onProgress) onProgress(10 + Math.round(p * 0.7));
        }, true, maxSizeKB, item.sizeMode === 'range' ? minSizeKB : 0, debug);

        const processedBlob = result.file;
        finalFile = new File([processedBlob], finalName, { type: 'application/pdf' });
      } else {
        throw new Error(`Unsupported target type: ${targetType}`);
      }

      if (onProgress) onProgress(85);

      // Handle boundary check - Pad if below minimum limit
      if (targetType !== 'document' && minSizeKB > 0 && finalFile.size < minSizeKB * 1024) {
        const paddedBlob = this.padBlob(finalFile, minSizeKB);
        finalFile = new File([paddedBlob], finalFile.name, { type: finalFile.type });
      }
    }

    if (onProgress) onProgress(100);
    return finalFile;
  }

  /**
   * Orchestrates the batch packaging of all processed files into a single ZIP.
   */
  static async compileZip(files: File[]): Promise<Blob> {
    const zip = new JSZip();
    const nameCounts: Record<string, number> = {};

    for (const file of files) {
      let name = file.name;
      if (nameCounts[name] !== undefined) {
        nameCounts[name]++;
        const lastDot = name.lastIndexOf('.');
        if (lastDot !== -1) {
          name = `${name.substring(0, lastDot)}_(${nameCounts[name]})${name.substring(lastDot)}`;
        } else {
          name = `${name}_(${nameCounts[name]})`;
        }
      } else {
        nameCounts[name] = 0;
      }
      
      zip.file(name, file);
    }

    return await zip.generateAsync({ type: 'blob' });
  }
}
