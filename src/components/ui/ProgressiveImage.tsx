import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderColor?: string;
}

export function ProgressiveImage({ 
  src, 
  alt, 
  className = '', 
  placeholderColor = 'bg-gray-200' 
}: ProgressiveImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when src changes
    setIsLoading(true);
    setHasError(false);
    setImageSrc(null);

    // Preload image
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      setHasError(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <motion.div
          className={`absolute inset-0 ${placeholderColor}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      )}

      {/* Error Fallback */}
      {hasError && (
        <div className={`absolute inset-0 ${placeholderColor} flex items-center justify-center`}>
          <div className="text-center">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-gray-500">Rasm yuklanmadi</p>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {imageSrc && !hasError && (
        <motion.img
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover ${className}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}

// Variant with blur placeholder
export function BlurImage({ 
  src, 
  alt, 
  className = '', 
  blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlNWU3ZWIiLz48L3N2Zz4='
}: ProgressiveImageProps & { blurDataURL?: string }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Blur Placeholder */}
      {isLoading && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: isLoading ? 1 : 0 }}
        >
          <img
            src={blurDataURL}
            alt=""
            className="w-full h-full object-cover filter blur-xl scale-110"
          />
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{
              x: ['-100%', '100%']
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        </motion.div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-xs text-gray-500">Rasm topilmadi</p>
          </div>
        </div>
      )}

      {/* Main Image */}
      <motion.img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: hasError ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
}
