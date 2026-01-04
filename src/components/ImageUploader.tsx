import { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { compressImage, formatFileSize, type ImageUploadOptions } from '../utils/imageUpload';
import { toast } from 'sonner@2.0.3';

interface ImageUploaderProps {
  maxImages?: number; // Max number of images (default: 5)
  onUpload: (images: string[]) => void; // Updated prop name
  images?: string[]; // Current images
  options?: ImageUploadOptions; // Compression options
  disabled?: boolean;
}

export function ImageUploader({
  maxImages = 5,
  onUpload,
  images: currentImages = [],
  options,
  disabled = false
}: ImageUploaderProps) {
  const [images, setImages] = useState<string[]>(currentImages);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with prop changes
  useEffect(() => {
    setImages(currentImages);
  }, [currentImages]);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length >= maxImages) {
      toast.error(`Maksimal ${maxImages} ta rasm yuklash mumkin`);
      return;
    }

    setUploading(true);

    try {
      const remainingSlots = maxImages - images.length;
      const filesToUpload = Array.from(files).slice(0, remainingSlots);

      // Process images in parallel
      const uploadPromises = filesToUpload.map(async (file) => {
        const result = await compressImage(file, options);
        if (!result.success) {
          toast.error(result.error || 'Rasmni yuklashda xatolik');
          return null;
        }
        
        // Show compression info
        if (result.compressionRatio && result.compressionRatio > 10) {
          toast.success(
            `Rasm ${result.compressionRatio.toFixed(0)}% siqildi (${formatFileSize(result.originalSize!)} → ${formatFileSize(result.compressedSize!)})`
          );
        }
        
        return result.data!;
      });

      const uploadedImages = (await Promise.all(uploadPromises)).filter(
        (img): img is string => img !== null
      );

      if (uploadedImages.length > 0) {
        const newImages = [...images, ...uploadedImages];
        setImages(newImages);
        onUpload(newImages);
        toast.success(`${uploadedImages.length} ta rasm yuklandi`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Rasmlarni yuklashda xatolik yuz berdi');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onUpload(newImages);
    toast.success('Rasm o\'chirildi');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'}
          ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled || images.length >= maxImages}
        />

        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              <p className="text-gray-600 dark:text-gray-400">
                Rasmlar yuklanmoqda...
              </p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <p className="text-gray-900 dark:text-white font-medium mb-1">
                  Rasm yuklash
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Rasmni bosing yoki bu yerga torting
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                  PNG, JPG, WebP (max 5MB) • {images.length}/{maxImages}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Status Badge */}
        {images.length >= maxImages && (
          <div className="absolute top-3 right-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Maksimal rasm soni
          </div>
        )}
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {images.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800"
              >
                {/* Image */}
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(index);
                    }}
                    disabled={disabled}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Primary Badge */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Asosiy
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Tips */}
      {images.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start gap-3">
          <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
              Rasm yuklash bo'yicha maslahatlar:
            </p>
            <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs list-disc list-inside">
              <li>Birinchi rasm asosiy rasm bo'ladi</li>
              <li>Yuqori sifatli rasmlar (1920x1080 yoki undan yuqori)</li>
              <li>Rasmlar avtomatik siqiladi va optimallashtiriladi</li>
              <li>Bir vaqtning o'zida bir nechta rasm yuklash mumkin</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}