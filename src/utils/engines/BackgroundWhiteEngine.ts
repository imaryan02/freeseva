import { removeBackground, preload, type Config } from '@imgly/background-removal';

export interface WhiteningResult {
  file: File;
  previewUrl: string;
  fileSize: number;
}

type ProgressCallback = (phase: string, pct: number) => void;

export class BackgroundWhiteEngine {
  public static preloaded = false;
  private static preloadPromise: Promise<void> | null = null;

  /**
   * Preload the AI model so it's warm when the user uploads a photo.
   * Call this on component mount. Downloads ~20MB on first use, cached after.
   */
  static preload(onProgress?: ProgressCallback): Promise<void> {
    if (this.preloaded) return Promise.resolve();

    if (!this.preloadPromise) {
      const config: Config = {
        device: 'gpu',
        proxyToWorker: true,
        progress: (key, current, total) => {
          if (onProgress && total > 0) {
            const pct = Math.round((current / total) * 100);
            onProgress(key, pct);
          }
        },
      };

      this.preloadPromise = preload(config)
        .then(() => {
          this.preloaded = true;
        })
        .catch((err) => {
          console.warn('Background removal model preload failed:', err);
          this.preloadPromise = null;
        });
    }

    return this.preloadPromise;
  }

  /**
   * Remove the background from an image and replace with solid white.
   * Uses ISNet AI model via ONNX Runtime Web (WebGPU preferred, WASM fallback).
   */
  static async whiten(
    file: File,
    onProgress?: ProgressCallback
  ): Promise<WhiteningResult> {
    // Ensure model is loaded
    await this.preload(onProgress);

    // Step 1: AI background removal → transparent foreground PNG blob
    const config: Config = {
      device: 'gpu',
      proxyToWorker: true,
      output: {
        format: 'image/png',
        quality: 1.0,
      },
    };

    const foregroundBlob = await removeBackground(file, config);

    // Step 2: Composite foreground onto white canvas + post-process
    const resultCanvas = await this.compositeOnWhite(foregroundBlob);

    // Step 3: Export as JPEG
    const blob = await this.canvasToBlob(resultCanvas, 'image/jpeg', 0.95);
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const finalFile = new File([blob], `${baseName}_whitebg.jpg`, { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(finalFile);

    return {
      file: finalFile,
      previewUrl,
      fileSize: finalFile.size,
    };
  }

  /**
   * Composite a transparent foreground PNG onto a white canvas.
   * Applies color decontamination and edge feathering for clean transitions.
   */
  private static async compositeOnWhite(foregroundBlob: Blob): Promise<HTMLCanvasElement> {
    const img = await this.loadImageFromBlob(foregroundBlob);
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context could not be created');
    }

    // Fill white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw foreground with alpha onto white
    ctx.drawImage(img, 0, 0);

    // Post-processing: decontaminate edges and feather
    const imageData = ctx.getImageData(0, 0, width, height);
    this.decontaminateEdges(imageData, width, height);
    ctx.putImageData(imageData, 0, 0);

    return canvas;
  }

  /**
   * Color decontamination: At the boundary between the foreground subject and
   * the white background, original background color can "bleed" into edge pixels.
   * This method detects semi-transparent edge pixels from the composited result
   * and smooths the transition by blending toward the nearest interior foreground color.
   *
   * We work on the already-composited image (foreground on white), so we detect
   * "edge" pixels by finding foreground pixels that have at least one neighbor
   * that's near-white (background). For those edge pixels, we pull their color
   * slightly toward the average of their non-white neighbors to remove halos.
   */
  private static decontaminateEdges(
    imageData: ImageData,
    width: number,
    height: number
  ): void {
    const data = imageData.data;
    const isBackground = new Uint8Array(width * height);

    // Step 1: classify pixels as background (near-white) or foreground
    for (let i = 0; i < width * height; i++) {
      const offset = i * 4;
      const r = data[offset];
      const g = data[offset + 1];
      const b = data[offset + 2];
      // A pixel is "background" if it's very close to white
      if (r >= 248 && g >= 248 && b >= 248) {
        isBackground[i] = 1;
      }
    }

    // Step 2: find edge foreground pixels (foreground with at least one bg neighbor)
    // and blend them toward their foreground-only neighbors to remove color halo
    const edgePixels: Array<{ index: number; avgR: number; avgG: number; avgB: number; blend: number }> = [];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        if (isBackground[idx] === 1) continue; // skip pure bg

        let bgNeighborCount = 0;
        let fgSumR = 0, fgSumG = 0, fgSumB = 0;
        let fgCount = 0;

        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nIdx = (y + dy) * width + (x + dx);
            if (isBackground[nIdx] === 1) {
              bgNeighborCount++;
            } else {
              const nOff = nIdx * 4;
              fgSumR += data[nOff];
              fgSumG += data[nOff + 1];
              fgSumB += data[nOff + 2];
              fgCount++;
            }
          }
        }

        // Edge pixel: has both bg and fg neighbors
        if (bgNeighborCount > 0 && fgCount > 0) {
          // Blend strength based on how many bg neighbors (more bg = stronger blend)
          const blend = Math.min(0.6, bgNeighborCount * 0.08);
          edgePixels.push({
            index: idx,
            avgR: fgSumR / fgCount,
            avgG: fgSumG / fgCount,
            avgB: fgSumB / fgCount,
            blend,
          });
        }
      }
    }

    // Step 3: apply the decontamination blend
    for (const ep of edgePixels) {
      const offset = ep.index * 4;
      data[offset] = Math.round(data[offset] * (1 - ep.blend) + ep.avgR * ep.blend);
      data[offset + 1] = Math.round(data[offset + 1] * (1 - ep.blend) + ep.avgG * ep.blend);
      data[offset + 2] = Math.round(data[offset + 2] * (1 - ep.blend) + ep.avgB * ep.blend);
    }
  }

  /**
   * Load an image from a Blob.
   */
  private static loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load foreground image'));
      };
      img.src = url;
    });
  }

  /**
   * Convert canvas to Blob.
   */
  private static canvasToBlob(
    canvas: HTMLCanvasElement,
    mimeType: string,
    quality: number
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Canvas export failed'));
          }
        },
        mimeType,
        quality
      );
    });
  }

  /**
   * Dispose/reset cached state.
   */
  static dispose(): void {
    this.preloaded = false;
    this.preloadPromise = null;
  }
}
