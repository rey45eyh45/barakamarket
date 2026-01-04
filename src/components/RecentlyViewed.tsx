import { motion } from 'motion/react';
import { Clock, X, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';
import { useTelegram } from '../contexts/TelegramContext';
import { toast } from 'sonner@2.0.3';

interface RecentlyViewedProps {
  onProductClick?: (product: Product) => void;
  maxItems?: number;
  showClearButton?: boolean;
}

export function RecentlyViewed({ 
  onProductClick, 
  maxItems = 8,
  showClearButton = true 
}: RecentlyViewedProps) {
  const { recentlyViewed, clearRecentlyViewed, removeFromRecentlyViewed } = useRecentlyViewed();
  const { haptic } = useTelegram();

  const displayedProducts = recentlyViewed.slice(0, maxItems);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const handleClear = () => {
    clearRecentlyViewed();
    haptic.success();
    toast.success('Ko\'rilgan mahsulotlar tozalandi');
  };

  const handleRemove = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromRecentlyViewed(productId);
    haptic.light();
    toast.success('O\'chirildi');
  };

  if (displayedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-gray-900 dark:text-white font-semibold">
            Yaqinda ko'rilgan
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({displayedProducts.length})
          </span>
        </div>

        {showClearButton && displayedProducts.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
          >
            <Trash2 className="w-4 h-4" />
            Tozalash
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {displayedProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              if (onProductClick) {
                onProductClick(product);
                haptic.light();
              }
            }}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer group relative"
          >
            {/* Remove Button */}
            <button
              onClick={(e) => handleRemove(product.id, e)}
              className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-full opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-50 dark:hover:bg-red-900/30"
            >
              <X className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
            </button>

            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Stock badge */}
              {product.stock !== undefined && product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    Mavjud emas
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h3 className="text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </h3>

              <div className="flex items-center justify-between">
                <div>
                  {product.discount && product.originalPrice ? (
                    <div>
                      <p className="text-red-600 dark:text-red-400 font-semibold">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-gray-400 text-xs line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    </div>
                  ) : (
                    <p className="text-blue-600 dark:text-blue-400 font-semibold">
                      {formatPrice(product.price)}
                    </p>
                  )}
                </div>

                {/* Discount Badge */}
                {product.discount && (
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded text-xs font-medium">
                    -{product.discount}%
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Show More Link */}
      {recentlyViewed.length > maxItems && (
        <div className="text-center">
          <button className="text-blue-600 dark:text-blue-400 text-sm hover:underline">
            Barchasini ko'rish ({recentlyViewed.length})
          </button>
        </div>
      )}
    </div>
  );
}

// Compact horizontal version
export function RecentlyViewedCompact({ 
  onProductClick, 
  maxItems = 6 
}: RecentlyViewedProps) {
  const { recentlyViewed } = useRecentlyViewed();
  const { haptic } = useTelegram();

  const displayedProducts = recentlyViewed.slice(0, maxItems);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  if (displayedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <h3 className="text-gray-900 dark:text-white font-medium text-sm">
          Yaqinda ko'rilgan
        </h3>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {displayedProducts.map((product) => (
          <motion.div
            key={product.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (onProductClick) {
                onProductClick(product);
                haptic.light();
              }
            }}
            className="flex-shrink-0 w-32 bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Info */}
            <div className="p-2">
              <p className="text-gray-900 dark:text-white text-xs line-clamp-2 mb-1">
                {product.name}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-xs font-semibold">
                {formatPrice(product.price)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
