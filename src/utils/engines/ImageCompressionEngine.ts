import imageCompression from 'browser-image-compression';

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  width: number;
  height: number;
  previewUrl: string;
  savingsPercentage: number;
}

export class ImageCompressionEngine {
  /**
   * Compresses an image file iteratively to get as close as possible to the target size in KB (and strictly under it if possible).
   */
  static async compress(
    file: File,
    targetSizeKB: number,
    onProgress?: (progress: number) => void
  ): Promise<CompressionResult> {
    const originalSize = file.size;
    const targetSizeBytes = targetSizeKB * 1024;

    // Get original dimensions
    const originalDimensions = await this.getImageDimensions(file);
    
    let quality = 0.9;
    let maxDimension = Math.max(originalDimensions.width, originalDimensions.height);
    let currentFile = file;
    let iterations = 0;
    const maxIterations = 5;

    // Fallback in case of tiny files
    if (originalSize <= targetSizeBytes) {
      if (onProgress) onProgress(100);
      const previewUrl = URL.createObjectURL(file);
      return {
        file,
        originalSize,
        compressedSize: originalSize,
        width: originalDimensions.width,
        height: originalDimensions.height,
        previewUrl,
        savingsPercentage: 0,
      };
    }

    // Iterative feedback loop to optimize quality vs file size
    while (iterations < maxIterations) {
      const options = {
        maxSizeMB: targetSizeKB / 1024,
        maxWidthOrHeight: maxDimension,
        useWebWorker: true,
        fileType: file.type || 'image/jpeg',
        initialQuality: quality,
        onProgress: (p: number) => {
          if (onProgress) {
            // Distribute progress over iteration slots
            const currentProgress = Math.round(((iterations + p / 100) / maxIterations) * 100);
            onProgress(Math.min(currentProgress, 99));
          }
        }
      };

      try {
        const compressedBlob = await imageCompression(file, options);
        currentFile = new File([compressedBlob], file.name, { type: file.type || 'image/jpeg' });
        
        // If the file fits, check if it's sufficiently close to target (within 20%) or if quality has hit floor
        if (currentFile.size <= targetSizeBytes) {
          if (currentFile.size >= targetSizeBytes * 0.8 || quality <= 0.25) {
            break;
          }
        }

        // Adjust parameters if size is still too large
        if (currentFile.size > targetSizeBytes) {
          quality -= 0.15;
          maxDimension = Math.round(maxDimension * 0.8);
        } else {
          // If size is too small (over-compressed), try raising quality in next loop or exit
          break;
        }
      } catch (error) {
        console.error('ImageCompressionEngine iteration error:', error);
        break;
      }

      iterations++;
    }

    if (onProgress) onProgress(100);

    const finalDimensions = await this.getImageDimensions(currentFile);
    const previewUrl = URL.createObjectURL(currentFile);
    const savingsPercentage = Math.max(0, Math.round(((originalSize - currentFile.size) / originalSize) * 100));

    return {
      file: currentFile,
      originalSize,
      compressedSize: currentFile.size,
      width: finalDimensions.width,
      height: finalDimensions.height,
      previewUrl,
      savingsPercentage,
    };
  }

  /**
   * Helper to load an image and retrieve its dimensions
   */
  static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
          resolve({ width: 0, height: 0 });
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = () => {
        resolve({ width: 0, height: 0 });
      };
      reader.readAsDataURL(file);
    });
  }
}
