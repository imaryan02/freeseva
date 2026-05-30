export interface ConversionResult {
  file: File;
  originalFormat: string;
  targetFormat: string;
  originalSize: number;
  convertedSize: number;
  previewUrl: string;
}

export class ImageConversionEngine {
  /**
   * Converts an image file to JPG, PNG, or WEBP client-side.
   */
  static async convert(
    file: File,
    targetFormat: 'jpeg' | 'png' | 'webp'
  ): Promise<ConversionResult> {
    const originalFormat = file.type.split('/')[1] || 'unknown';
    const mimeType = `image/${targetFormat}`;

    // If already in target format, just return file to avoid redundant re-encoding
    if (file.type === mimeType) {
      return {
        file,
        originalFormat,
        targetFormat,
        originalSize: file.size,
        convertedSize: file.size,
        previewUrl: URL.createObjectURL(file),
      };
    }

    // Load image onto canvas
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas context could not be initialized for conversion');
    }

    // If converting to JPG, paint white background first as JPG doesn't support transparency
    if (targetFormat === 'jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    // Export to Blob
    const blob = await this.canvasToBlob(canvas, mimeType);
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const finalFile = new File([blob], `${baseName}.${targetFormat}`, { type: mimeType });
    const previewUrl = URL.createObjectURL(finalFile);

    return {
      file: finalFile,
      originalFormat,
      targetFormat,
      originalSize: file.size,
      convertedSize: finalFile.size,
      previewUrl,
    };
  }

  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Conversion failed loading image element'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Conversion failed reading file'));
      reader.readAsDataURL(file);
    });
  }

  private static canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Conversion exporting failed'));
        }
      }, mimeType, 0.95);
    });
  }
}
