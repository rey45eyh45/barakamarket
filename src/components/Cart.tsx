import { CartItem } from '../types';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Button, IconButton } from './ui/button';
import { Card } from './ui/card';
import { NumberBadge } from './ui/Badge';

interface CartProps {
  cartItems: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  totalPrice: number;
  onCheckout: () => void;
}

export function Cart({
  cartItems,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  totalPrice,
  onCheckout
}: CartProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-blue-600" />
            <h2 className="text-gray-900">Savat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-center">
              Savat bo'sh
            </p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <Card
                    key={item.product.id}
                    variant="outlined"
                    padding="md"
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-white flex-shrink-0">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-gray-900 mb-1 line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="text-blue-600 font-semibold mb-2">
                          {formatPrice(item.product.price)}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <IconButton
                              icon={<Minus />}
                              variant="secondary"
                              size="sm"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            />
                            <NumberBadge count={item.quantity} size="md" />
                            <IconButton
                              icon={<Plus />}
                              variant="secondary"
                              size="sm"
                              onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            />
                          </div>

                          <IconButton
                            icon={<Trash2 />}
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.product.id)}
                            className="text-red-500 hover:bg-red-50"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="border-t bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">Jami:</span>
                <span className="text-blue-600 text-xl font-bold">
                  {formatPrice(totalPrice)}
                </span>
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={onCheckout}
              >
                Buyurtma berish
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
