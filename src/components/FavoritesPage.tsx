import { Product } from '../types';
import { Heart, ShoppingCart, HeartOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { ProductGridSkeleton } from './ui/skeleton-loaders';
import { ProductCardImage } from './ui/ProductImage';
import { Button, IconButton } from './ui/Button';
import { Card } from './ui/Card';
import { EmptyState } from './ui/EmptyState';

interface FavoritesPageProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  favoriteIds: string[];
  onToggleFavorite: (productId: string) => void;
}

export function FavoritesPage({
  products,
  onProductClick,
  onAddToCart,
  favoriteIds,
  onToggleFavorite
}: FavoritesPageProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-600 to-red-600 text-white px-4 py-6">
        <div className="flex items-center gap-3">
          <Heart className="w-8 h-8 fill-white" />
          <div>
            <h1 className="text-white">Sevimli mahsulotlar</h1>
            <p className="text-pink-100">
              {products.length} ta mahsulot
            </p>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="p-4">
        {isLoading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4"
          >
            {/* Animated Heart */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, -10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="w-24 h-24 bg-gradient-to-br from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-full flex items-center justify-center mb-4 relative"
            >
              <HeartOff className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              
              {/* Floating hearts */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ 
                    y: 0, 
                    x: 0, 
                    opacity: 0,
                    scale: 0 
                  }}
                  animate={{
                    y: [-20, -60],
                    x: [0, (i - 1) * 20],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    repeatDelay: 1
                  }}
                >
                  <Heart className="w-4 h-4 fill-pink-400 text-pink-400" />
                </motion.div>
              ))}
            </motion.div>
            
            <h2 className="text-gray-900 dark:text-white mb-2">Sevimli mahsulotlar yo'q</h2>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-6">
              Mahsulotlarni sevimli qilib belgilang
            </p>
            
            {/* Hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-xl p-4 max-w-sm"
            >
              <div className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-pink-600 dark:text-pink-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-pink-900 dark:text-pink-300 text-sm mb-1">
                    Maslahat
                  </p>
                  <p className="text-pink-700 dark:text-pink-400 text-sm">
                    Mahsulot rasmidagi yurak tugmasini bosing va ularni keyinroq ko'rish uchun saqlang
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {products.map((product, index) => {
                const isFavorite = favoriteIds.includes(product.id);
                
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card variant="elevated" padding="none" hoverable>
                      <div className="relative">
                        <div
                          onClick={() => onProductClick(product)}
                          className="cursor-pointer"
                        >
                          <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-lg">
                            <ProductCardImage
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        </div>
                        <IconButton
                          icon={<Heart className={isFavorite ? 'fill-current' : ''} />}
                          variant="destructive"
                          size="md"
                          rounded
                          onClick={() => onToggleFavorite(product.id)}
                          className="absolute top-2 right-2 shadow-md"
                        />
                      </div>
                      <div className="p-3">
                        <h3
                          onClick={() => onProductClick(product)}
                          className="text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer"
                        >
                          {product.name}
                        </h3>
                        
                        {/* Price with Discount */}
                        {product.originalPrice && product.originalPrice > product.price ? (
                          <div className="mb-2">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-gray-400 line-through text-sm">
                                {formatPrice(product.originalPrice)}
                              </span>
                              {product.discount && (
                                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                                  -{product.discount}%
                                </span>
                              )}
                            </div>
                            <p className="text-blue-600 font-bold">
                              {formatPrice(product.price)}
                            </p>
                          </div>
                        ) : (
                          <p className="text-blue-600 font-semibold mb-2">
                            {formatPrice(product.price)}
                          </p>
                        )}
                        
                        <Button
                          variant="primary"
                          size="sm"
                          fullWidth
                          icon={<ShoppingCart />}
                          onClick={() => onAddToCart(product)}
                        >
                          Savatga
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}