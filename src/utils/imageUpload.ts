// 🖼️ IMAGE UPLOAD UTILITIES
// Handles image compression, validation, and Base64 conversion

export interface ImageUploadOptions {
  maxSizeMB?: number; // Max file size in MB (default: 5)
  maxWidthPx?: number; // Max width in pixels (default: 1920)
  maxHeightPx?: number; // Max height in pixels (default: 1080)
  quality?: number; // Compression quality 0-1 (default: 0.8)
  outputFormat?: 'image/jpeg' | 'image/png' | 'image/webp'; // Output format (default: jpeg)
}

export interface ImageUploadResult {
  success: boolean;
  data?: string; // Base64 string
  error?: string;
  originalSize?: number;
  compressedSize?: number;
  compressionRatio?: number;
}

/**
 * Compress and convert image to Base64
 */
export async function compressImage(
  file: File,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  const {
    maxSizeMB = 5,
    maxWidthPx = 1920,
    maxHeightPx = 1080,
    quality = 0.8,
    outputFormat = 'image/jpeg'
  } = options;

  try {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'Faqat rasm fayllarini yuklash mumkin'
      };
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return {
        success: false,
        error: `Fayl hajmi ${maxSizeMB}MB dan kichik bo'lishi kerak (hozirgi: ${fileSizeMB.toFixed(2)}MB)`
      };
    }

    // Read file as data URL
    const originalSize = file.size;
    const dataUrl = await readFileAsDataURL(file);

    // Load image
    const img = await loadImage(dataUrl);

    // Calculate new dimensions (maintain aspect ratio)
    let { width, height } = img;
    if (width > maxWidthPx || height > maxHeightPx) {
      const aspectRatio = width / height;
      if (width > height) {
        width = maxWidthPx;
        height = width / aspectRatio;
      } else {
        height = maxHeightPx;
        width = height * aspectRatio;
      }
    }

    // Compress image
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    // Draw image with optional smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);

    // Convert to Base64
    const compressedDataUrl = canvas.toDataURL(outputFormat, quality);
    const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);
    const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

    return {
      success: true,
      data: compressedDataUrl,
      originalSize,
      compressedSize,
      compressionRatio
    };
  } catch (error) {
    console.error('Image compression error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Rasmni qayta ishlashda xatolik'
    };
  }
}

/**
 * Upload multiple images
 */
export async function uploadMultipleImages(
  files: FileList | File[],
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult[]> {
  const fileArray = Array.from(files);
  const uploadPromises = fileArray.map(file => compressImage(file, options));
  return Promise.all(uploadPromises);
}

/**
 * Validate image file
 */
export function validateImageFile(file: File, maxSizeMB: number = 5): boolean {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return false;
  }

  // Check file size
  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return false;
  }

  return true;
}

/**
 * Get image dimensions from Base64
 */
export async function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  const img = await loadImage(base64);
  return {
    width: img.width,
    height: img.height
  };
}

/**
 * Helper: Read file as Data URL
 */
function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Helper: Load image from data URL
 */
function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Convert Base64 to Blob (for downloading)
 */
export function base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
  const byteString = atob(base64.split(',')[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
}

/**
 * Download image from Base64
 */
export function downloadImage(base64: string, filename: string = 'image.jpg'): void {
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  link.click();
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Generate thumbnail from Base64
 */
export async function generateThumbnail(
  base64: string,
  size: number = 200
): Promise<string> {
  const img = await loadImage(base64);
  const canvas = document.createElement('canvas');
  const aspectRatio = img.width / img.height;
  
  let width = size;
  let height = size;
  if (aspectRatio > 1) {
    height = size / aspectRatio;
  } else {
    width = size * aspectRatio;
  }
  
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.7);
}
