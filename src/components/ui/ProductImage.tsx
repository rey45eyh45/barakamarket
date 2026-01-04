import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ImageOff, RefreshCw } from 'lucide-react';

interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
  fallbackSrc?: string;
  showRetry?: boolean;
  darkMode?: boolean;
}

// Default placeholder image - subtle gradient
const DEFAULT_PLACEHOLDER = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNmM2Y0ZjY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZTVlN2ViO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIi8+PC9zdmc+';

export function ProductImage({
  src,
  alt,
  className = '',
  aspectRatio = 'square',
  fallbackSrc = DEFAULT_PLACEHOLDER,
  showRetry = true,
  darkMode = false
}: ProductImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);

  // Get aspect ratio class
  const aspectClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]'
  }[aspectRatio];

  useEffect(() => {
    // Reset state when src changes
    setImageState('loading');
    setCurrentSrc(src);
    setRetryCount(0);

    // Preload image
    const img = new Image();
    img.src = src;

    const handleLoad = () => {
      setImageState('loaded');
    };

    const handleError = () => {
      if (fallbackSrc && fallbackSrc !== src) {
        setCurrentSrc(fallbackSrc);
        setImageState('loading');
        
        // Try fallback
        const fallbackImg = new Image();
        fallbackImg.src = fallbackSrc;
        fallbackImg.onload = () => setImageState('loaded');
        fallbackImg.onerror = () => setImageState('error');
      } else {
        setImageState('error');
      }
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);

    return () => {
      img.removeEventListener('load', handleLoad);
      img.removeEventListener('error', handleError);
    };
  }, [src, fallbackSrc]);

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setImageState('loading');
      setCurrentSrc(src + `?retry=${retryCount + 1}`); // Cache bust
    }
  };

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${aspectClass} ${className}`}>
      <AnimatePresence mode="wait">
        {/* Loading State */}
        {imageState === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200"
          >
            {/* Shimmer Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            
            {/* Loading Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full"
              />
            </div>
          </motion.div>
        )}

        {/* Error State */}
        {imageState === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
            >
              <ImageOff className="w-12 h-12 text-gray-400 mb-2" />
            </motion.div>
            <p className="text-xs text-gray-500 text-center mb-3">
              Rasm yuklanmadi
            </p>
            
            {showRetry && retryCount < 3 && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleRetry}
                className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg hover:bg-blue-600 transition flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Qayta urinish</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Loaded Image */}
        {imageState === 'loaded' && (
          <motion.div
            key="loaded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <img
              src={currentSrc}
              alt={alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            
            {/* Dark Mode Overlay */}
            {darkMode && (
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Variant for grid cards - optimized
export function ProductCardImage({
  src,
  alt,
  className = '',
  darkMode = false
}: Omit<ProductImageProps, 'aspectRatio'>) {
  return (
    <ProductImage
      src={src}
      alt={alt}
      className={className}
      aspectRatio="square"
      showRetry={false}
      darkMode={darkMode}
    />
  );
}

// Variant for product detail - with retry
export function ProductDetailImage({
  src,
  alt,
  className = '',
  aspectRatio = 'square',
  darkMode = false
}: Omit<ProductImageProps, 'showRetry' | 'fallbackSrc'>) {
  return (
    <ProductImage
      src={src}
      alt={alt}
      className={className}
      aspectRatio={aspectRatio}
      showRetry={true}
      darkMode={darkMode}
    />
  );
}