import { useState, useEffect } from 'react';
import { ArrowLeft, Package, Clock, CheckCircle2, Calendar, MapPin, Phone, User, CreditCard, ChevronDown, ChevronUp, Truck, XCircle, Eye, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderTracking } from './OrderTracking';
import { OrderCancellationModal } from './OrderCancellationModal';
import { OrderListSkeleton } from './ui/skeleton-loaders';
import { StatusBadge } from './ui/Badge';
import { Button, IconButton } from './ui/button';
import { Card, CardHeader, CardContent } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { canCancelOrder } from '../types/cancellation';
import { EmptyState } from './ui/emptystate';

interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
  };
  quantity: number;
}

interface Order {
  id: number;
  date: string;
  items: OrderItem[];
  total: number;
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    comment?: string;
  };
  paymentMethod: 'cash' | 'payme' | 'click';
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
  estimatedDelivery?: string;
}

interface MyOrdersProps {
  onBack: () => void;
}

export function MyOrders({ onBack }: MyOrdersProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // Load orders from localStorage with real-time updates
  useEffect(() => {
    // Load orders function
    const loadOrders = () => {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      // Sort by date (newest first)
      const sortedOrders = savedOrders.sort((a: Order, b: Order) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setOrders(sortedOrders);
    };

    // Initial load with delay for skeleton
    const timer = setTimeout(() => {
      loadOrders();
      setIsLoading(false);
    }, 500);

    // Poll for updates every 5 seconds to detect admin changes
    const interval = setInterval(loadOrders, 5000);

    // Listen for storage events from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'orders' || e.key === 'admin_orders') {
        loadOrders();
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Kutilmoqda',
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          icon: Clock
        };
      case 'processing':
        return {
          label: 'Tayyorlanmoqda',
          color: 'text-blue-600',
          bgColor: 'bg-blue-100',
          icon: Package
        };
      case 'shipped':
        return {
          label: "Yo'lda",
          color: 'text-purple-600',
          bgColor: 'bg-purple-100',
          icon: Truck
        };
      case 'delivered':
        return {
          label: 'Yetkazildi',
          color: 'text-green-600',
          bgColor: 'bg-green-100',
          icon: CheckCircle2
        };
      case 'cancelled':
        return {
          label: 'Bekor qilindi',
          color: 'text-red-600',
          bgColor: 'bg-red-100',
          icon: XCircle
        };
      default:
        return {
          label: 'Noma\'lum',
          color: 'text-gray-600',
          bgColor: 'bg-gray-100',
          icon: Package
        };
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵 Naqd pul';
      case 'payme':
        return '💳 Payme';
      case 'click':
        return '💳 Click';
      default:
        return method;
    }
  };

  const toggleExpand = (orderId: number) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const openOrderTracking = (order: Order) => {
    setSelectedOrder(order);
  };

  const openCancellationModal = (order: Order) => {
    setOrderToCancel(order);
    setCancellationModalOpen(true);
  };

  const cancelOrder = (orderId: number) => {
    // Update order status
    const updatedOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled' as const } : o
    );
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    setSelectedOrder(null);
    setCancellationModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-gray-900">Buyurtmalarim</h1>
          </div>
        </div>

        {/* Loading State */}
        <div className="p-4 max-w-4xl mx-auto pb-24">
          <div className="space-y-4">
            <OrderListSkeleton />
            <OrderListSkeleton />
            <OrderListSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-gray-900">Buyurtmalarim</h1>
          </div>
        </div>

        {/* Empty State */}
        <div className="p-4 mt-12">
          <EmptyState
            icon={ShoppingBag}
            title="Buyurtmalar yo'q"
            description="Siz hali hech qanday buyurtma bermagansiz. Mahsulotlarni ko'rib chiqing va birinchi xaridingizni qiling!"
            actionLabel="Xarid qilishni boshlash"
            onAction={onBack}
            illustration="empty"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex-1">
            <h1 className="text-gray-900">Buyurtmalarim</h1>
            <p className="text-sm text-gray-500">{orders.length} ta buyurtma</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto pb-24">
        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = getStatusInfo(order.status);
            const StatusIcon = statusInfo.icon;
            const isExpanded = expandedOrder === order.id;

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div
                  onClick={() => toggleExpand(order.id)}
                  className="p-4 cursor-pointer hover:bg-gray-50 transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-900">
                          Buyurtma #{order.id.toString().slice(-6)}
                        </span>
                        <StatusBadge status={order.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(order.date)}</span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      {order.items.length} ta mahsulot
                    </div>
                    <div className="text-blue-600">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </div>

                {/* Order Details (Expandable) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t"
                    >
                      <div className="p-4 space-y-4">
                        {/* Products */}
                        <div>
                          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="w-4 h-4 text-blue-600" />
                            Mahsulotlar
                          </h3>
                          <div className="space-y-3">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex gap-3">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-16 h-16 object-cover rounded-lg"
                                />
                                <div className="flex-1">
                                  <p className="text-gray-900 text-sm">
                                    {item.product.name}
                                  </p>
                                  <p className="text-gray-500 text-sm">
                                    {item.quantity} x {formatPrice(item.product.price)}
                                  </p>
                                </div>
                                <div className="text-gray-900 text-sm">
                                  {formatPrice(item.product.price * item.quantity)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Customer Info */}
                        <div className="border-t pt-4">
                          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            Ma'lumotlar
                          </h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-start gap-2">
                              <User className="w-4 h-4 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">{order.customerInfo.name}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">{order.customerInfo.phone}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <span className="text-gray-600">{order.customerInfo.address}</span>
                            </div>
                            {order.customerInfo.comment && (
                              <div className="flex items-start gap-2">
                                <div className="w-4 h-4 text-gray-400 mt-0.5">💬</div>
                                <span className="text-gray-600">{order.customerInfo.comment}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="border-t pt-4">
                          <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-blue-600" />
                            To'lov usuli
                          </h3>
                          <div className="text-sm text-gray-600">
                            {getPaymentMethodLabel(order.paymentMethod)}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-900">Jami:</span>
                            <span className="text-blue-600 text-lg">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>

                        {/* Tracking */}
                        {order.trackingNumber && (
                          <div className="border-t pt-4">
                            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-600" />
                              Yetkazib berish
                            </h3>
                            <div className="text-sm text-gray-600">
                              Kuzatuv raqami: <span className="font-mono">{order.trackingNumber}</span>
                            </div>
                          </div>
                        )}

                        {/* View Details Button */}
                        <div className="border-t pt-4 space-y-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openOrderTracking(order);
                            }}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                          >
                            <Eye className="w-5 h-5" />
                            <span>To'liq ma'lumot</span>
                          </button>
                          
                          {/* Cancel Order Button (only for pending/processing orders) */}
                          {canCancelOrder(order.status) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openCancellationModal(order);
                              }}
                              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-5 h-5" />
                              <span>Buyurtmani bekor qilish</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Order Tracking Fullscreen */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] bg-gray-50">
          <OrderTracking
            order={selectedOrder}
            onBack={() => setSelectedOrder(null)}
            onCancelOrder={(orderId) => {
              // Update order status
              const updatedOrders = orders.map(o =>
                o.id === orderId ? { ...o, status: 'cancelled' as const } : o
              );
              setOrders(updatedOrders);
              localStorage.setItem('orders', JSON.stringify(updatedOrders));
              setSelectedOrder(null);
            }}
            onReorder={(order) => {
              // TODO: Implement reorder logic
              alert('Qayta buyurtma funksiyasi tez orada qo\'shiladi!');
              setSelectedOrder(null);
            }}
          />
        </div>
      )}

      {/* Order Cancellation Modal */}
      {cancellationModalOpen && orderToCancel && user && (
        <OrderCancellationModal
          isOpen={cancellationModalOpen}
          onClose={() => {
            setCancellationModalOpen(false);
            setOrderToCancel(null);
          }}
          orderId={orderToCancel.id.toString()}
          orderNumber={orderToCancel.id.toString().slice(-6)}
          orderTotal={orderToCancel.total}
          userId={user.id || user.email}
          userName={user.name || user.email}
          onCancelSuccess={() => {
            // Refresh orders
            const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
            const sortedOrders = savedOrders.sort((a: Order, b: Order) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            );
            setOrders(sortedOrders);
          }}
        />
      )}
    </div>
  );
}
