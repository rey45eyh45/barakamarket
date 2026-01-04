import { Product } from '../types';
import { ChevronRight, Heart, ShoppingCart, Zap, TrendingUp, Tag, Sparkles, Share2, Trophy, Flame, Star, Gift } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTelegram } from '../contexts/TelegramContext';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';
import { BannerSkeleton, ProductCardSkeleton } from './ui/skeleton-loaders';
import { ProductCardImage } from './ui/ProductImage';
import { Button, IconButton } from './ui/button';
import { Card } from './ui/card';
import { SpinWheel } from './SpinWheel';
import { getSpinWheelConfig } from '../utils/spinWheelUtils';

interface HomePageProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onNavigateToCatalog: () => void;
  favoriteIds: string[];
  onToggleFavorite: (productId: string) => void;
}

export function HomePage({
  products,
  onProductClick,
  onAddToCart,
  onNavigateToCatalog,
  favoriteIds,
  onToggleFavorite
}: HomePageProps) {
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<Array<{id: string; imageUrl: string; title: string; description: string; isActive: boolean; order: number}>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const { haptic, shareToTelegram, isTelegram } = useTelegram();
  const { user } = useAuth();

  // Load admin products from localStorage
  useEffect(() => {
    const loadAdminProducts = () => {
      try {
        const saved = localStorage.getItem('admin_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          setAdminProducts(parsed.filter((p: any) => p.status === 'active'));
        }
      } catch (error) {
        console.error('Failed to load admin products:', error);
      }
    };

    loadAdminProducts();

    // Listen for changes
    const handleStorage = () => loadAdminProducts();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Load banners from localStorage
  useEffect(() => {
    const loadBanners = () => {
      try {
        const saved = localStorage.getItem('banners');
        if (saved) {
          const allBanners = JSON.parse(saved);
          const activeBanners = allBanners
            .filter((b: any) => b.isActive)
            .sort((a: any, b: any) => a.order - b.order);
          setBanners(activeBanners);
        }
      } catch (error) {
        console.error('Failed to load banners:', error);
      }
    };

    loadBanners();

    // Listen for changes
    const handleStorage = () => loadBanners();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 4000); // 4 sekundda bir o'zgaradi

    return () => clearInterval(interval);
  }, [banners.length]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  // Get TOP (featured) products from admin products
  const topProducts = adminProducts.length > 0 
    ? adminProducts.filter((p: any) => p.isFeatured).slice(0, 6)
    : [];

  // Get best sellers (sorted by sold count)
  const bestSellers = adminProducts.length > 0
    ? adminProducts
        .filter((p: any) => (p.sold || 0) > 0)
        .sort((a: any, b: any) => (b.sold || 0) - (a.sold || 0))
        .slice(0, 6)
    : [];

  const featuredProducts = products.slice(0, 4);
  const popularProducts = products.slice(4, 8);
  const newProducts = products.slice(8, 12);

  const renderProductCard = (product: Product) => {
    const isFavorite = favoriteIds.includes(product.id);
    
    return (
      <Card
        key={product.id}
        variant="elevated"
        padding="none"
        hoverable
      >
        <div className="relative">
          <div
            onClick={() => {
              haptic.light();
              onProductClick(product);
            }}
            className="cursor-pointer"
          >
            <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700 rounded-t-lg">
              <ProductCardImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <IconButton
            icon={<Heart className={isFavorite ? 'fill-current' : ''} />}
            variant={isFavorite ? 'destructive' : 'secondary'}
            size="md"
            rounded
            onClick={() => {
              haptic.light();
              onToggleFavorite(product.id);
            }}
            className="absolute top-2 right-2 shadow-md"
          />
        </div>
        <div className="p-3">
          <h3
            onClick={() => {
              haptic.light();
              onProductClick(product);
            }}
            className="text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer"
          >
            {product.name}
          </h3>
          
          {/* Price with Discount */}
          {product.originalPrice && product.originalPrice > product.price ? (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400 dark:text-gray-500 line-through text-sm">
                  {formatPrice(product.originalPrice)}
                </span>
                {product.discount && (
                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                    -{product.discount}%
                  </span>
                )}
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-bold">
                {formatPrice(product.price)}
              </p>
            </div>
          ) : (
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
              {formatPrice(product.price)}
            </p>
          )}
          
          <Button
            variant="primary"
            size="md"
            fullWidth
            icon={<ShoppingCart />}
            onClick={() => {
              haptic.success();
              onAddToCart(product);
            }}
          >
            Savatga
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Modern Compact Header with Logo - Warm Energetic Gradient */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white px-4 py-6 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-300/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex items-center justify-between">
          <Logo size="md" showText={true} />
          <motion.div
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Sparkles className="w-6 h-6 text-yellow-300" />
          </motion.div>
        </div>
      </div>

      {/* Banner Slider */}
      {isLoading ? (
        <div className="px-4 py-4">
          <BannerSkeleton />
        </div>
      ) : banners.length > 0 ? (
        <div className="px-4 py-4">
          <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-opacity duration-500 ${
                  index === currentBanner ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent flex items-center px-6">
                  <div>
                    <h3 className="text-white mb-2 text-2xl">{banner.title}</h3>
                    <p className="text-white/90 text-base">{banner.description}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentBanner
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-4">
          <BannerSkeleton />
        </div>
      )}

      {/* Quick Categories */}
      <div className="px-4 py-4">
        <div className="grid grid-cols-4 gap-3">
          <button
            onClick={onNavigateToCatalog}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Tezkor</span>
          </button>
          
          <button
            onClick={onNavigateToCatalog}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
              <Tag className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Chegirma</span>
          </button>
          
          <button
            onClick={onNavigateToCatalog}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Mashhur</span>
          </button>
          
          <button
            onClick={onNavigateToCatalog}
            className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm hover:shadow-md transition flex flex-col items-center"
          >
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-2">
              <Heart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 text-center">Top</span>
          </button>
        </div>
      </div>

      {/* TOP Mahsulotlar */}
      {topProducts.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-gray-900 dark:text-white">TOP mahsulotlar</h2>
            </div>
            <button
              onClick={onNavigateToCatalog}
              className="text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all"
            >
              <span>Barchasi</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {topProducts.map((product: any) => (
              <Card
                key={product.id}
                variant="elevated"
                padding="none"
                hoverable
              >
                <div className="relative">
                  <div
                    onClick={() => {
                      haptic.light();
                      onProductClick(product);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-lg relative">
                      {/* TOP Badge */}
                      <div className="absolute top-2 left-2 z-10">
                        <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                          <Trophy className="w-3 h-3" />
                          TOP
                        </span>
                      </div>
                      <ProductCardImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <IconButton
                    icon={<Heart className={favoriteIds.includes(product.id) ? 'fill-current' : ''} />}
                    variant={favoriteIds.includes(product.id) ? 'destructive' : 'secondary'}
                    size="md"
                    rounded
                    onClick={() => {
                      haptic.light();
                      onToggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 shadow-md"
                  />
                </div>
                <div className="p-3">
                  <h3
                    onClick={() => {
                      haptic.light();
                      onProductClick(product);
                    }}
                    className="text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  )}
                  
                  <p className="text-blue-600 font-semibold mb-2">
                    {formatPrice(product.price)}
                  </p>
                  
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    icon={<ShoppingCart />}
                    onClick={() => {
                      haptic.success();
                      onAddToCart(product);
                    }}
                  >
                    Savatga
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Ko'proq sotilgan */}
      {bestSellers.length > 0 && (
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-gray-900 dark:text-white">Ko'proq sotilgan</h2>
            </div>
            <button
              onClick={onNavigateToCatalog}
              className="text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
              <span>Barchasi</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {bestSellers.map((product: any) => (
              <Card
                key={product.id}
                variant="elevated"
                padding="none"
                hoverable
              >
                <div className="relative">
                  <div
                    onClick={() => {
                      haptic.light();
                      onProductClick(product);
                    }}
                    className="cursor-pointer"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 rounded-t-lg relative">
                      {/* Sold Count Badge */}
                      {product.sold && product.sold > 0 && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                            <TrendingUp className="w-3 h-3" />
                            {product.sold} ta
                          </span>
                        </div>
                      )}
                      <ProductCardImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>
                  <IconButton
                    icon={<Heart className={favoriteIds.includes(product.id) ? 'fill-current' : ''} />}
                    variant={favoriteIds.includes(product.id) ? 'destructive' : 'secondary'}
                    size="md"
                    rounded
                    onClick={() => {
                      haptic.light();
                      onToggleFavorite(product.id);
                    }}
                    className="absolute top-2 right-2 shadow-md"
                  />
                </div>
                <div className="p-3">
                  <h3
                    onClick={() => {
                      haptic.light();
                      onProductClick(product);
                    }}
                    className="text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer"
                  >
                    {product.name}
                  </h3>
                  
                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600">{product.rating}</span>
                    </div>
                  )}
                  
                  <p className="text-blue-600 font-semibold mb-2">
                    {formatPrice(product.price)}
                  </p>
                  
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    icon={<ShoppingCart />}
                    onClick={() => {
                      haptic.success();
                      onAddToCart(product);
                    }}
                  >
                    Savatga
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-900 dark:text-white">Maxsus takliflar</h2>
          <button
            onClick={onNavigateToCatalog}
            className="text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
            <span>Barchasi</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)
          ) : (
            featuredProducts.map(renderProductCard)
          )}
        </div>
      </div>

      {/* Popular Products */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-900 dark:text-white">Mashhur mahsulotlar</h2>
          <button
            onClick={onNavigateToCatalog}
            className="text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
            <span>Barchasi</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)
          ) : (
            popularProducts.map(renderProductCard)
          )}
        </div>
      </div>

      {/* New Products */}
      <div className="px-4 py-4 pb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-900 dark:text-white">Yangi mahsulotlar</h2>
          <button
            onClick={onNavigateToCatalog}
            className="text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:gap-2 transition-all">
            <span>Barchasi</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {isLoading ? (
            Array.from({ length: 4 }, (_, index) => <ProductCardSkeleton key={index} />)
          ) : (
            newProducts.map(renderProductCard)
          )}
        </div>
      </div>

      {/* Floating Spin Wheel Button */}
      {user && getSpinWheelConfig().isEnabled && (
        <>
          <motion.button
            onClick={() => {
              haptic.light();
              setShowSpinWheel(true);
            }}
            className="fixed bottom-24 right-4 z-40 w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-2xl flex items-center justify-center"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              y: [0, -10, 0],
            }}
            transition={{
              y: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut"
              }
            }}
          >
            <Gift className="w-8 h-8 text-white" />
            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-amber-400 animate-ping opacity-75" />
          </motion.button>

          {/* Spin Wheel Modal */}
          <SpinWheel
            isOpen={showSpinWheel}
            onClose={() => setShowSpinWheel(false)}
            userId={user.id}
          />
        </>
      )}
    </div>
  );
}
