import { ImageCompressionEngine } from './ImageCompressionEngine';
import type { CompressionResult } from './ImageCompressionEngine';

export interface SignatureProcessingOptions {
  contrastBoost: boolean;
  threshold: number; // 0-255 binarization threshold
  outputFormat: 'png' | 'jpeg';
  preserveTransparency: boolean; // only for PNG
}

export class SignatureCompressionEngine {
  /**
   * Processes a signature file (contrast boosting, shadow cleanup, transparency options)
   * and compresses it strictly below targetKB.
   */
  static async processAndCompress(
    file: File,
    targetKB: number,
    options: SignatureProcessingOptions,
    onProgress?: (progress: number) => void
  ): Promise<CompressionResult> {
    if (onProgress) onProgress(10);

    // 1. Load image onto canvas
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Could not get 2D context for signature processing');
    }

    // Draw original image
    ctx.drawImage(img, 0, 0);

    if (onProgress) onProgress(30);

    // 2. Apply pixel-level contrast, binarization and background cleanups
    if (options.contrastBoost) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const threshold = options.threshold;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        // Skip fully transparent pixels
        if (a === 0) continue;

        // Calculate grayscale brightness
        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        if (brightness > threshold) {
          // If light, treat it as paper background
          if (options.outputFormat === 'png' && options.preserveTransparency) {
            data[i + 3] = 0; // Full transparency
          } else {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          }
        } else {
          // If dark, treat it as ink stroke. Boost contrast (make ink darker)
          const darkenFactor = 0.5; // Scale ink colors closer to black
          data[i] = Math.max(0, r * darkenFactor);
          data[i + 1] = Math.max(0, g * darkenFactor);
          data[i + 2] = Math.max(0, b * darkenFactor);
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    if (onProgress) onProgress(50);

    // 3. Export canvas to raw file matching selected format
    const mimeType = options.outputFormat === 'png' ? 'image/png' : 'image/jpeg';
    const processedBlob = await this.canvasToBlob(canvas, mimeType);
    
    // Set file extension matching output format
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const finalName = `${baseName}.${options.outputFormat}`;
    const processedFile = new File([processedBlob], finalName, { type: mimeType });

    if (onProgress) onProgress(60);

    // 4. Run target-size image compression loop
    const compressionResult = await ImageCompressionEngine.compress(
      processedFile,
      targetKB,
      (p) => {
        if (onProgress) {
          // Scale final image compression from 60% to 100%
          onProgress(60 + Math.round(p * 0.4));
        }
      }
    );

    return compressionResult;
  }

  /**
   * Helper to load File into Image
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image element'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read signature file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert Canvas to Blob
   */
  private static canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Canvas exporting failed'));
        }
      }, mimeType, 0.95);
    });
  }
}
