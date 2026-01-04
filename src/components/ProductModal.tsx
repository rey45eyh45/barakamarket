import { Button, IconButton } from './ui/button';
import { Card } from './ui/card';
import { VariantSelector } from './VariantSelector';
import { toast } from 'sonner@2.0.3';
import { Product } from '../types';
import { ProductVariant } from '../types/variant';
import { X, ShoppingCart, Heart, Star, ChevronLeft, ChevronRight, Share2, Truck, Shield, RotateCcw, AlertCircle, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useTelegram } from '../contexts/TelegramContext';
import { ProductReviews } from './ProductReviews';
import { trackProductView, trackAnalyticsEvent, getProductAnalytics } from '../types/analytics';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, variant?: ProductVariant) => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function ProductModal({ product, onClose, onAddToCart, isFavorite, onToggleFavorite }: ProductModalProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { tg, haptic } = useTelegram();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState<'description' | 'reviews' | 'details'>('description');
  const [quantity, setQuantity] = useState(1);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [viewStartTime] = useState(Date.now());

  // Track product view on mount
  useEffect(() => {
    trackProductView(product.id, user?.id || user?.email);
    
    // Track view duration on unmount
    return () => {
      const viewDuration = Math.floor((Date.now() - viewStartTime) / 1000);
      // TODO: Save view duration if needed
    };
  }, [product.id, user, viewStartTime]);

  // Use product.images array if available, otherwise fallback to single image
  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image];

  // Load reviews count
  useState(() => {
    try {
      const stored = localStorage.getItem(`reviews_${product.id}`);
      if (stored) {
        const reviews = JSON.parse(stored);
        setReviewsCount(reviews.length);
      }
    } catch (error) {
      console.error('Error loading reviews count:', error);
    }
  });

  // Telegram BackButton integration
  useEffect(() => {
    if (tg?.BackButton) {
      tg.BackButton.show();
      tg.BackButton.onClick(onClose);
      
      return () => {
        tg.BackButton.hide();
        tg.BackButton.offClick(onClose);
      };
    }
  }, [tg, onClose]);

  // Telegram MainButton integration
  useEffect(() => {
    if (tg?.MainButton) {
      tg.MainButton.setText(`Savatga qo'shish (${quantity} ta)`);
      tg.MainButton.color = '#3B82F6';
      tg.MainButton.textColor = '#FFFFFF';
      tg.MainButton.show();
      tg.MainButton.onClick(handleAddToCart);
      
      return () => {
        tg.MainButton.hide();
        tg.MainButton.offClick(handleAddToCart);
      };
    }
  }, [tg, quantity]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const handleAddToCart = () => {
    // Check if product has variants but none selected
    if (product.hasVariants && !selectedVariant) {
      toast.error('Iltimos, variantni tanlang');
      haptic?.error();
      return;
    }

    // Check stock
    const availableStock = selectedVariant?.stock || product.stock || 0;
    if (availableStock < quantity) {
      toast.error(`Faqat ${availableStock} ta mavjud`);
      haptic?.error();
      return;
    }

    // Track add to cart event
    trackAnalyticsEvent({
      type: 'add_to_cart',
      productId: product.id,
      userId: user?.id || user?.email,
      metadata: {
        quantity,
        variantId: selectedVariant?.id,
        price: selectedVariant?.price || product.price
      }
    });

    for (let i = 0; i < quantity; i++) {
      onAddToCart(product, selectedVariant || undefined);
    }
    
    haptic?.success();
    toast.success('Savatga qo\'shildi');
    onClose();
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end md:items-center justify-center"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 w-full md:max-w-4xl h-full md:h-[95vh] md:rounded-2xl overflow-hidden flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between z-10 shadow-sm">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleFavorite}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <Heart
                className={`w-6 h-6 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400 dark:text-gray-500'
                }`}
              />
            </button>
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition">
              <Share2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Image Gallery */}
          <div className="relative bg-gray-50 dark:bg-gray-900">
            <div className="aspect-square max-h-[500px] overflow-hidden relative">
              <img
                src={productImages[currentImageIndex]}
                alt={product.name}
                className="w-full h-full object-contain"
              />

              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition ${
                      index === currentImageIndex
                        ? 'bg-blue-600 dark:bg-blue-400 w-6'
                        : 'bg-white/60 dark:bg-gray-600/60'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Thumbnail Images */}
            <div className="flex gap-2 p-4 overflow-x-auto">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    index === currentImageIndex
                      ? 'border-blue-600 dark:border-blue-400'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <h1 className="text-gray-900 dark:text-white mb-4">{product.name}</h1>

            {/* Price */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Narxi:</p>
              <div className="flex items-center gap-3">
                {product.originalPrice && product.originalPrice > product.price ? (
                  <>
                    <span className="text-gray-400 dark:text-gray-500 line-through text-lg">
                      {formatPrice(selectedVariant?.price || product.originalPrice)}
                    </span>
                    <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                      {formatPrice(selectedVariant?.price || product.price)}
                    </span>
                    {product.discount && (
                      <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                        -{product.discount}%
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                    {formatPrice(selectedVariant?.price || product.price)}
                  </span>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            {product.hasVariants && product.variantGroups && product.variants && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h3 className="text-gray-900 dark:text-white font-semibold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600" />
                  Variantni tanlang
                </h3>
                <VariantSelector
                  variantGroups={product.variantGroups}
                  variants={product.variants}
                  onVariantChange={(variant) => {
                    setSelectedVariant(variant);
                    haptic?.light();
                  }}
                />
                {selectedVariant && (
                  <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-lg border-2 border-blue-600">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tanlangan:</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedVariant.options.map(opt => opt.name).join(' • ')}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      {selectedVariant.stock} ta mavjud
                    </p>
                  </div>
                )}
                {product.hasVariants && !selectedVariant && (
                  <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-300 dark:border-yellow-700">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      ⚠️ Iltimos, variantni tanlang
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-gray-900 dark:text-white text-xs">Bepul yetkazib berish</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-gray-900 dark:text-white text-xs">Kafolat 1 yil</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                <RotateCcw className="w-6 h-6 text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                <p className="text-gray-900 dark:text-white text-xs">14 kun qaytarish</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b dark:border-gray-700 mb-4">
              <div className="flex gap-6">
                <button
                  onClick={() => setSelectedTab('description')}
                  className={`pb-3 border-b-2 transition ${
                    selectedTab === 'description'
                      ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Tavsif
                </button>
                <button
                  onClick={() => setSelectedTab('reviews')}
                  className={`pb-3 border-b-2 transition ${
                    selectedTab === 'reviews'
                      ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Sharhlar ({reviewsCount})
                </button>
                <button
                  onClick={() => setSelectedTab('details')}
                  className={`pb-3 border-b-2 transition ${
                    selectedTab === 'details'
                      ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Ma'lumotlar
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="mb-6">
              {selectedTab === 'description' && (
                <div>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">{product.description}</p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                    <h4 className="text-gray-900 dark:text-white mb-2">Asosiy xususiyatlar:</h4>
                    <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>Yuqori sifatli materiallar</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>Zamonaviy dizayn</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>Uzoq ishlash muddati</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 mt-1">•</span>
                        <span>Ishonchli brenddan</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {selectedTab === 'reviews' && (
                <ProductReviews
                  productId={product.id}
                  productName={product.name}
                  user={user}
                />
              )}

              {selectedTab === 'details' && (
                <div className="space-y-3">
                  <div className="flex justify-between py-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Kategoriya:</span>
                    <span className="text-gray-900 dark:text-white">{product.category}</span>
                  </div>
                  <div className="flex justify-between py-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Brend:</span>
                    <span className="text-gray-900 dark:text-white">Original</span>
                  </div>
                  <div className="flex justify-between py-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Kafolat:</span>
                    <span className="text-gray-900 dark:text-white">1 yil</span>
                  </div>
                  <div className="flex justify-between py-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Yetkazib berish:</span>
                    <span className="text-gray-900 dark:text-white">1-3 kun</span>
                  </div>
                  <div className="flex justify-between py-3 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Mavjud:</span>
                    <span className="text-green-600 dark:text-green-400">Omborda bor</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 px-4 py-4 shadow-lg">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center border-2 border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
              >
                −
              </button>
              <span className="px-4 py-2 border-x-2 border-gray-200 dark:border-gray-600 min-w-[60px] text-center text-gray-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition text-gray-700 dark:text-gray-300"
              >
                +
              </button>
            </div>
            <div className="flex-1">
              <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">Jami:</p>
              <p className="text-blue-600 dark:text-blue-400">
                {formatPrice(product.price * quantity)}
              </p>
            </div>
          </div>
          <button
            onClick={handleAddToCart}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white py-4 rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <ShoppingCart className="w-5 h-5" />
            <span>Savatga qo'shish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
