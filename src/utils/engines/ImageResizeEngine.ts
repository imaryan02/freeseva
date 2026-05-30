export interface ResizeOptions {
  width: number;
  height: number;
  unit: 'px' | 'cm' | 'inch';
  dpi: number; // typically 200 or 300 DPI for forms
  maintainAspectRatio: boolean;
  outputFormat: 'jpeg' | 'png' | 'webp';
}

export interface ResizeResult {
  file: File;
  width: number;
  height: number;
  previewUrl: string;
  fileSize: number;
}

export class ImageResizeEngine {
  /**
   * Resizes an image file based on provided dimensions, units, and aspect ratio locks.
   */
  static async resize(file: File, options: ResizeOptions): Promise<ResizeResult> {
    // 1. Convert unit to pixels
    const targetPx = this.convertToPixels(
      options.width,
      options.height,
      options.unit,
      options.dpi
    );

    // 2. Load original image to get aspect ratio
    const img = await this.loadImage(file);
    const originalWidth = img.naturalWidth;
    const originalHeight = img.naturalHeight;
    const originalRatio = originalWidth / originalHeight;

    let targetWidth = targetPx.width;
    let targetHeight = targetPx.height;

    // 3. Handle aspect ratio locking
    if (options.maintainAspectRatio) {
      const targetRatio = targetWidth / targetHeight;
      if (originalRatio > targetRatio) {
        // Source is wider than target container - limit by target width
        targetHeight = Math.round(targetWidth / originalRatio);
      } else {
        // Source is taller than target container - limit by target height
        targetWidth = Math.round(targetHeight * originalRatio);
      }
    }

    // 4. Perform resizing on Canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context retrieval failed');
    }

    // Use high-quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw and scale image
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // 5. Export canvas to file blob
    const mimeType = `image/${options.outputFormat === 'jpeg' ? 'jpeg' : options.outputFormat}`;
    const blob = await this.canvasToBlob(canvas, mimeType);
    
    // Build final file
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const finalName = `${baseName}_resized.${options.outputFormat}`;
    const resizedFile = new File([blob], finalName, { type: mimeType });
    const previewUrl = URL.createObjectURL(resizedFile);

    return {
      file: resizedFile,
      width: targetWidth,
      height: targetHeight,
      previewUrl,
      fileSize: resizedFile.size,
    };
  }

  /**
   * Converts dimensions in standard metric units into pixels based on DPI parameters
   */
  static convertToPixels(
    width: number,
    height: number,
    unit: 'px' | 'cm' | 'inch',
    dpi: number
  ): { width: number; height: number } {
    if (unit === 'px') {
      return { width, height };
    }

    if (unit === 'cm') {
      // 1 cm = 0.3937 inches
      const widthInches = width * 0.3937;
      const heightInches = height * 0.3937;
      return {
        width: Math.round(widthInches * dpi),
        height: Math.round(heightInches * dpi),
      };
    }

    if (unit === 'inch') {
      return {
        width: Math.round(width * dpi),
        height: Math.round(height * dpi),
      };
    }

    return { width, height };
  }

  /**
   * Helper to load File into HTML Image Element
   */
  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Resizer failed loading image element'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Resizer failed reading file'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Export Canvas to Blob
   */
  private static canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Resizer exporting failed'));
        }
      }, mimeType, 0.95);
    });
  }
}
