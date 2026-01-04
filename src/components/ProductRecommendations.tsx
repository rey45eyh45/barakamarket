import { motion } from 'motion/react';
import { Sparkles, TrendingUp, ShoppingBag, Heart, ChevronRight } from 'lucide-react';
import { Product } from '../types';
import {
  useRelatedProducts,
  useFrequentlyBought,
  useHomepageRecommendations,
  useTrendingProducts
} from '../hooks/useRecommendations';
import { formatPrice } from '../utils/formatters';
import { StockBadge } from './StockBadge';
import { DiscountBadge } from './DiscountBadge';
import { useTelegram } from '../contexts/TelegramContext';

interface ProductRecommendationsProps {
  title?: string;
  icon?: typeof Sparkles;
  productId?: string;
  userId?: string;
  type: 'related' | 'frequently-bought' | 'personalized' | 'trending';
  limit?: number;
  onProductClick?: (product: Product) => void;
  onViewAll?: () => void;
}

export function ProductRecommendations({
  title,
  icon: Icon,
  productId = '',
  userId,
  type,
  limit = 8,
  onProductClick,
  onViewAll
}: ProductRecommendationsProps) {
  const { haptic } = useTelegram();

  // Select appropriate hook based on type
  let recommendations: Product[] = [];
  let isLoading = false;

  if (type === 'related' && productId) {
    const result = useRelatedProducts(productId, limit);
    recommendations = result.recommendations;
    isLoading = result.isLoading;
  } else if (type === 'frequently-bought' && productId) {
    const result = useFrequentlyBought(productId, limit);
    recommendations = result.recommendations;
    isLoading = result.isLoading;
  } else if (type === 'personalized') {
    const result = useHomepageRecommendations(userId, limit);
    recommendations = result.recommendations;
    isLoading = result.isLoading;
  } else if (type === 'trending') {
    const result = useTrendingProducts(limit);
    recommendations = result.recommendations;
    isLoading = result.isLoading;
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 dark:bg-gray-700 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  const getDefaultIcon = () => {
    switch (type) {
      case 'related': return Sparkles;
      case 'frequently-bought': return ShoppingBag;
      case 'personalized': return Heart;
      case 'trending': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'related': return 'Shunga o\'xshash mahsulotlar';
      case 'frequently-bought': return 'Tez-tez birga olinadi';
      case 'personalized': return 'Siz uchun tavsiya';
      case 'trending': return 'Mashhurlari';
      default: return 'Tavsiya qilamiz';
    }
  };

  const DisplayIcon = Icon || getDefaultIcon();
  const displayTitle = title || getDefaultTitle();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DisplayIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-gray-900 dark:text-white font-bold text-lg">
            {displayTitle}
          </h3>
        </div>

        {onViewAll && recommendations.length >= limit && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Barchasi
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {recommendations.map((product, index) => (
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
            {/* Discount Badge */}
            {product.discount && (
              <DiscountBadge
                discount={product.discount}
                size="sm"
                position="top-left"
              />
            )}

            {/* Product Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Stock overlay */}
              {product.stock !== undefined && product.stock <= 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    Tugagan
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h4 className="text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                {product.name}
              </h4>

              {/* Price */}
              <div className="mb-2">
                {product.discount && product.originalPrice ? (
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 dark:text-red-400 font-bold">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <span className="text-gray-400 text-xs line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </div>
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              {/* Rating & Stock */}
              <div className="flex items-center justify-between text-xs">
                {product.rating && (
                  <div className="flex items-center gap-1 text-yellow-500">
                    <span>⭐</span>
                    <span>{product.rating.toFixed(1)}</span>
                  </div>
                )}

                {product.stock !== undefined && (
                  <StockBadge stock={product.stock} size="sm" showIcon={false} />
                )}
              </div>

              {/* Sold count */}
              {product.soldCount && product.soldCount > 0 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {product.soldCount} ta sotildi
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Horizontal scrollable version
export function ProductRecommendationsCarousel({
  title,
  icon: Icon,
  productId = '',
  userId,
  type,
  limit = 8,
  onProductClick
}: ProductRecommendationsProps) {
  const { haptic } = useTelegram();

  let recommendations: Product[] = [];
  let isLoading = false;

  if (type === 'related' && productId) {
    const result = useRelatedProducts(productId, limit);
    recommendations = result.recommendations;
    isLoading = result.isLoading;
  } else if (type === 'frequently-bought' && productId) {
    const result = useFrequentlyBought(productId, limit);
    recommendations = result.recommendations;
    isLoading = result.isLoading;
  } else if (type === 'personalized') {
    const result = useHomepageRecommendations(userId, limit);
    recommendations = result.recommendations;
    isLoading = result.isLoading;
  } else if (type === 'trending') {
    const result = useTrendingProducts(limit);
    recommendations = result.recommendations;
    isLoading = result.isLoading;
  }

  if (isLoading || recommendations.length === 0) {
    return null;
  }

  const getDefaultIcon = () => {
    switch (type) {
      case 'related': return Sparkles;
      case 'frequently-bought': return ShoppingBag;
      case 'personalized': return Heart;
      case 'trending': return TrendingUp;
      default: return Sparkles;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'related': return 'Shunga o\'xshash';
      case 'frequently-bought': return 'Birga olinadi';
      case 'personalized': return 'Sizga tavsiya';
      case 'trending': return 'Mashhur';
      default: return 'Tavsiya';
    }
  };

  const DisplayIcon = Icon || getDefaultIcon();
  const displayTitle = title || getDefaultTitle();

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <DisplayIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <h4 className="text-gray-900 dark:text-white font-semibold">
          {displayTitle}
        </h4>
      </div>

      {/* Horizontal Scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {recommendations.map((product) => (
          <motion.div
            key={product.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (onProductClick) {
                onProductClick(product);
                haptic.light();
              }
            }}
            className="flex-shrink-0 w-40 bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-md transition cursor-pointer"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {product.discount && (
                <div className="absolute top-1 right-1 bg-red-600 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                  -{product.discount}%
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-2">
              <p className="text-gray-900 dark:text-white text-xs line-clamp-2 mb-1 min-h-[2rem]">
                {product.name}
              </p>
              <p className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                {formatPrice(product.price)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
