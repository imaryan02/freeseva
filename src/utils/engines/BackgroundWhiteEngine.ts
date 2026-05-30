export interface WhiteningOptions {
  mode: 'lightness' | 'chromakey';
  tolerance: number; // 0-100 threshold
  targetColor?: { r: number; g: number; b: number }; // color picked by user
}

export interface WhiteningResult {
  file: File;
  previewUrl: string;
  fileSize: number;
}

export class BackgroundWhiteEngine {
  /**
   * Cleans background tints or custom colors and replaces them with pure white (#FFFFFF)
   */
  static async whiten(file: File, options: WhiteningOptions): Promise<WhiteningResult> {
    const img = await this.loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Canvas 2D context could not be created for whitening');
    }

    ctx.drawImage(img, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (options.mode === 'lightness') {
      // Lightness mode: convert all light-gray/off-white pixels above threshold to pure white
      // Higher tolerance value = lower threshold (sweeps more dark values to white)
      const threshold = 255 - (options.tolerance / 100) * 150; // maps tolerance to 105-255 brightness

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) {
          // If transparent, paint it white
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
          continue;
        }

        // Grayscale lightness value
        const lightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

        if (lightness >= threshold) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
      }
    } else if (options.mode === 'chromakey' && options.targetColor) {
      // Chroma-key mode: convert any pixel close to selected color within tolerance to pure white
      const target = options.targetColor;
      const toleranceDist = (options.tolerance / 100) * 441.67; // 441.67 is max color distance in RGB cube

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
          data[i + 3] = 255;
          continue;
        }

        // Euclidean distance in RGB space
        const dist = Math.sqrt(
          Math.pow(r - target.r, 2) +
          Math.pow(g - target.g, 2) +
          Math.pow(b - target.b, 2)
        );

        if (dist <= toleranceDist) {
          data[i] = 255;
          data[i + 1] = 255;
          data[i + 2] = 255;
        }
      }
    }

    ctx.putImageData(imageData, 0, 0);

    // Export to JPEG (JPG is standard for form uploads)
    const blob = await this.canvasToBlob(canvas, 'image/jpeg');
    const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const finalFile = new File([blob], `${baseName}_whitebg.jpg`, { type: 'image/jpeg' });
    const previewUrl = URL.createObjectURL(finalFile);

    return {
      file: finalFile,
      previewUrl,
      fileSize: finalFile.size,
    };
  }

  private static loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Whitening failed loading image element'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Whitening failed reading file'));
      reader.readAsDataURL(file);
    });
  }

  private static canvasToBlob(canvas: HTMLCanvasElement, mimeType: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Whitening exporting failed'));
        }
      }, mimeType, 0.95);
    });
  }
}
