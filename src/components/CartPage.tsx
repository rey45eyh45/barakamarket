import { CartItem } from '../types';
import { ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useTelegram } from '../contexts/TelegramContext';
import { useEffect } from 'react';
import { motion } from 'motion/react';

interface CartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  onRemoveItem: (productId: string, variantId?: string) => void;
  totalPrice: number;
  onCheckout: () => void;
}

export function CartPage({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  totalPrice,
  onCheckout
}: CartPageProps) {
  const { tg } = useTelegram();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  // Telegram MainButton integration
  useEffect(() => {
    if (tg?.MainButton && cartItems.length > 0) {
      tg.MainButton.setText(`To'lovga o'tish (${formatPrice(totalPrice)})`);
      tg.MainButton.color = '#3B82F6';
      tg.MainButton.textColor = '#FFFFFF';
      tg.MainButton.show();
      tg.MainButton.onClick(onCheckout);
      
      return () => {
        tg.MainButton.hide();
        tg.MainButton.offClick(onCheckout);
      };
    } else if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  }, [tg, cartItems, totalPrice, onCheckout]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-8 h-8" />
          <div>
            <h1 className="text-white">Savat</h1>
            <p className="text-blue-100">
              {cartItems.length} ta mahsulot
            </p>
          </div>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 flex flex-col items-center justify-center py-16 px-4"
        >
          {/* Animated Illustration */}
          <div className="relative mb-6">
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3,
                ease: "easeInOut"
              }}
              className="w-32 h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 dark:from-blue-900/30 dark:via-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center shadow-lg"
            >
              <ShoppingBag className="w-16 h-16 text-blue-600 dark:text-blue-400" />
            </motion.div>
            
            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [-5, 5, -5],
                rotate: [-5, 5, -5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 4,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2 bg-gradient-to-br from-yellow-400 to-orange-400 w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-lg"
            >
              ✨
            </motion.div>
            
            <motion.div
              animate={{ 
                y: [5, -5, 5],
                rotate: [5, -5, 5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 3.5,
                ease: "easeInOut",
                delay: 0.5
              }}
              className="absolute -bottom-2 -left-2 bg-gradient-to-br from-green-400 to-emerald-400 w-8 h-8 rounded-full flex items-center justify-center text-lg shadow-lg"
            >
              🎁
            </motion.div>
          </div>
          
          <h2 className="text-gray-900 dark:text-white mb-2">Savatingiz bo'sh</h2>
          <p className="text-gray-500 dark:text-gray-400 text-center mb-6 max-w-sm">
            Ajoyib mahsulotlarimizni ko'rib chiqing va xarid qilishni boshlang! 🛍️
          </p>
          
          {/* CTA Button - will be added later when we have navigation */}
        </motion.div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3 max-w-2xl mx-auto">
              {cartItems.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedVariant?.id || 'no-variant'}`}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 flex gap-3 shadow-sm"
                >
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-gray-900 dark:text-white mb-1 line-clamp-2">
                      {item.product.name}
                    </h3>
                    {item.selectedVariant && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {item.selectedVariant.options.map(opt => opt.name).join(', ')}
                      </p>
                    )}
                    <p className="text-blue-600 dark:text-blue-400 mb-3">
                      {formatPrice(item.selectedVariant?.price || item.product.price)}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1, item.selectedVariant?.id)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition"
                        >
                          <Minus className="w-4 h-4 dark:text-gray-300" />
                        </button>
                        <span className="text-gray-900 dark:text-white min-w-[2.5rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.selectedVariant?.id)}
                          className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition"
                        >
                          <Plus className="w-4 h-4 dark:text-gray-300" />
                        </button>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedVariant?.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-lg">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600 dark:text-gray-400">Jami:</span>
                <span className="text-blue-600 dark:text-blue-400">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition"
              >
                Buyurtma berish
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}