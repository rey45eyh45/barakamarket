import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  User,
  CreditCard,
  RefreshCw,
  AlertCircle,
  Calendar,
  Copy,
  Check
} from 'lucide-react';
import { useTelegram } from '../contexts/TelegramContext';

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
  courierInfo?: {
    name: string;
    phone: string;
    vehicle?: string;
  };
  timeline?: Array<{
    status: string;
    label: string;
    timestamp: string;
    description?: string;
  }>;
}

interface OrderTrackingProps {
  order: Order;
  onBack: () => void;
  onCancelOrder?: (orderId: number) => void;
  onReorder?: (order: Order) => void;
}

export function OrderTracking({ order, onBack, onCancelOrder, onReorder }: OrderTrackingProps) {
  const { haptic } = useTelegram();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const copyTrackingNumber = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopied(true);
      haptic.success();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelOrder = () => {
    if (onCancelOrder) {
      onCancelOrder(order.id);
      haptic.success();
      setShowCancelConfirm(false);
      onBack();
    }
  };

  const handleReorder = () => {
    if (onReorder) {
      onReorder(order);
      haptic.success();
    }
  };

  // Generate timeline based on status
  const getTimeline = () => {
    const baseTimeline = [
      {
        status: 'pending',
        label: 'Buyurtma qabul qilindi',
        timestamp: order.date,
        description: 'Buyurtmangiz muvaffaqiyatli qabul qilindi',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      },
      {
        status: 'processing',
        label: 'Tayyorlanmoqda',
        timestamp: '',
        description: 'Buyurtmangiz tayyorlanmoqda',
        icon: Package,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      },
      {
        status: 'shipped',
        label: "Yo'lda",
        timestamp: '',
        description: 'Buyurtmangiz kuryer tomonidan yetkazilmoqda',
        icon: Truck,
        color: 'text-purple-600',
        bgColor: 'bg-purple-100'
      },
      {
        status: 'delivered',
        label: 'Yetkazildi',
        timestamp: '',
        description: 'Buyurtmangiz muvaffaqiyatli yetkazildi',
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      }
    ];

    if (order.status === 'cancelled') {
      return [
        baseTimeline[0],
        {
          status: 'cancelled',
          label: 'Bekor qilindi',
          timestamp: new Date().toISOString(),
          description: 'Buyurtma bekor qilindi',
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100'
        }
      ];
    }

    const statusIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status);
    return baseTimeline.map((item, index) => ({
      ...item,
      completed: index <= statusIndex,
      active: index === statusIndex
    }));
  };

  const timeline = getTimeline();
  const canCancel = order.status === 'pending' || order.status === 'processing';
  const canReorder = order.status === 'delivered' || order.status === 'cancelled';

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

  const getStatusBadge = () => {
    switch (order.status) {
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
          icon: CheckCircle
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

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={() => {
                haptic.light();
                onBack();
              }}
              className="p-2 hover:bg-white/10 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-white">Buyurtma tafsilotlari</h1>
              <p className="text-white/80 text-sm">
                #{order.id.toString().padStart(6, '0')}
              </p>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusBadge.bgColor}`}>
              <StatusIcon className={`w-4 h-4 ${statusBadge.color}`} />
              <span className={`text-sm ${statusBadge.color}`}>
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Tracking Number */}
          {order.trackingNumber && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between"
            >
              <div>
                <p className="text-white/70 text-xs mb-1">Kuzatuv raqami</p>
                <p className="text-white font-mono">{order.trackingNumber}</p>
              </div>
              <button
                onClick={copyTrackingNumber}
                className="p-2 hover:bg-white/10 rounded-lg transition"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-300" />
                ) : (
                  <Copy className="w-5 h-5 text-white" />
                )}
              </button>
            </motion.div>
          )}
        </div>
      </div>

      <div className="p-4 pb-24 max-w-4xl mx-auto space-y-4">
        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-card p-6"
        >
          <h2 className="text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Buyurtma holati
          </h2>

          <div className="space-y-6">
            {timeline.map((item: any, index: number) => {
              const TimelineIcon = item.icon;
              const isLast = index === timeline.length - 1;

              return (
                <div key={item.status} className="flex gap-4">
                  {/* Icon */}
                  <div className="relative flex flex-col items-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${
                        item.completed || item.active
                          ? item.bgColor
                          : 'bg-gray-100'
                      }`}
                    >
                      <TimelineIcon
                        className={`w-6 h-6 ${
                          item.completed || item.active
                            ? item.color
                            : 'text-gray-400'
                        }`}
                      />
                    </motion.div>

                    {/* Connecting Line */}
                    {!isLast && (
                      <div
                        className={`w-0.5 h-16 mt-2 ${
                          item.completed ? 'bg-green-300' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3
                      className={`mb-1 ${
                        item.completed || item.active
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {item.label}
                    </h3>
                    <p
                      className={`text-sm mb-2 ${
                        item.completed || item.active
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}
                    >
                      {item.description}
                    </p>
                    {item.timestamp && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(item.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estimated Delivery */}
          {order.estimatedDelivery && order.status !== 'delivered' && order.status !== 'cancelled' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-blue-50 rounded-lg flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-blue-900 mb-1">
                  Taxminiy yetkazib berish
                </p>
                <p className="text-blue-700 text-sm">
                  {formatDate(order.estimatedDelivery)}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-card p-6"
        >
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Mahsulotlar
          </h2>
          <div className="space-y-3">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">{item.product.name}</p>
                  <p className="text-gray-500 text-sm mb-2">
                    {item.quantity} x {formatPrice(item.product.price)}
                  </p>
                  <p className="text-blue-600">
                    {formatPrice(item.product.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <span className="text-gray-900">Jami:</span>
            <span className="text-blue-600 text-xl">
              {formatPrice(order.total)}
            </span>
          </div>
        </motion.div>

        {/* Customer Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-card p-6"
        >
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Yetkazib berish ma'lumotlari
          </h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <User className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs mb-1">Ism</p>
                <p className="text-gray-900">{order.customerInfo.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs mb-1">Telefon</p>
                <p className="text-gray-900">{order.customerInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-500 text-xs mb-1">Manzil</p>
                <p className="text-gray-900">{order.customerInfo.address}</p>
              </div>
            </div>
            {order.customerInfo.comment && (
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-xl mt-0.5">💬</div>
                <div>
                  <p className="text-gray-500 text-xs mb-1">Izoh</p>
                  <p className="text-gray-900">{order.customerInfo.comment}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Payment Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-card p-6"
        >
          <h2 className="text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600" />
            To'lov usuli
          </h2>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-900">
              {getPaymentMethodLabel(order.paymentMethod)}
            </p>
          </div>
        </motion.div>

        {/* Courier Info */}
        {order.courierInfo && order.status === 'shipped' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl shadow-card p-6"
          >
            <h2 className="text-gray-900 mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Kuryer ma'lumotlari
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <User className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">Ism</p>
                  <p className="text-gray-900">{order.courierInfo.name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="text-gray-500 text-xs mb-1">Telefon</p>
                  <a
                    href={`tel:${order.courierInfo.phone}`}
                    className="text-purple-600 font-medium hover:underline"
                  >
                    {order.courierInfo.phone}
                  </a>
                </div>
              </div>
              {order.courierInfo.vehicle && (
                <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                  <Truck className="w-5 h-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Transport</p>
                    <p className="text-gray-900">{order.courierInfo.vehicle}</p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm text-center">
                📞 Kuryer siz bilan bog'lanadi
              </p>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3"
        >
          {canReorder && onReorder && (
            <button
              onClick={() => {
                haptic.light();
                handleReorder();
              }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Qayta buyurtma</span>
            </button>
          )}

          {canCancel && onCancelOrder && (
            <button
              onClick={() => {
                haptic.light();
                setShowCancelConfirm(true);
              }}
              className="flex-1 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2"
            >
              <XCircle className="w-5 h-5" />
              <span>Bekor qilish</span>
            </button>
          )}
        </motion.div>
      </div>

      {/* Cancel Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50"
              onClick={() => setShowCancelConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl z-50 max-w-sm mx-auto"
            >
              <div className="p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-gray-900 text-center mb-2">
                  Buyurtmani bekor qilish
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Buyurtmani bekor qilishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      haptic.light();
                      setShowCancelConfirm(false);
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    Yo'q
                  </button>
                  <button
                    onClick={() => {
                      haptic.light();
                      handleCancelOrder();
                    }}
                    className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                  >
                    Ha, bekor qilish
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}