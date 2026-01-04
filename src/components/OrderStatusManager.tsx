import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock,
  User,
  Phone,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useTelegram } from '../contexts/TelegramContext';

interface Order {
  id: number;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customerInfo: {
    name: string;
    phone: string;
    address: string;
  };
  items: any[];
  total: number;
  trackingNumber?: string;
  estimatedDelivery?: string;
  courierInfo?: {
    name: string;
    phone: string;
    vehicle?: string;
  };
}

interface OrderStatusManagerProps {
  order: Order;
  onUpdateStatus: (orderId: number, newStatus: Order['status'], additionalInfo?: any) => void;
  onClose: () => void;
}

export function OrderStatusManager({ order, onUpdateStatus, onClose }: OrderStatusManagerProps) {
  const { haptic } = useTelegram();
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [courierName, setCourierName] = useState(order.courierInfo?.name || '');
  const [courierPhone, setCourierPhone] = useState(order.courierInfo?.phone || '');
  const [courierVehicle, setCourierVehicle] = useState(order.courierInfo?.vehicle || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.estimatedDelivery ? order.estimatedDelivery.split('T')[0] : ''
  );

  const statuses = [
    { 
      value: 'pending', 
      label: 'Kutilmoqda', 
      icon: Clock, 
      color: 'yellow',
      description: 'Buyurtma qabul qilindi, tekshirilmoqda'
    },
    { 
      value: 'processing', 
      label: 'Tayyorlanmoqda', 
      icon: Package, 
      color: 'blue',
      description: 'Buyurtma to\'planmoqda'
    },
    { 
      value: 'shipped', 
      label: "Yo'lda", 
      icon: Truck, 
      color: 'purple',
      description: 'Kuryer orqali yetkazilmoqda'
    },
    { 
      value: 'delivered', 
      label: 'Yetkazildi', 
      icon: CheckCircle, 
      color: 'green',
      description: 'Buyurtma yetkazib berildi'
    },
  ];

  const handleUpdateStatus = () => {
    if (newStatus === order.status) {
      toast.error('Yangi status tanlang');
      return;
    }

    // Validate tracking number for shipped status
    if (newStatus === 'shipped' && !trackingNumber.trim()) {
      toast.error('Kuzatuv raqamini kiriting');
      return;
    }

    // Validate courier info for shipped status
    if (newStatus === 'shipped' && (!courierName.trim() || !courierPhone.trim())) {
      toast.error('Kuryer ma\'lumotlarini kiriting');
      return;
    }

    const additionalInfo: any = {};

    if (trackingNumber.trim()) {
      additionalInfo.trackingNumber = trackingNumber.trim();
    }

    if (courierName.trim() || courierPhone.trim()) {
      additionalInfo.courierInfo = {
        name: courierName.trim(),
        phone: courierPhone.trim(),
        vehicle: courierVehicle.trim() || undefined
      };
    }

    if (estimatedDelivery) {
      additionalInfo.estimatedDelivery = new Date(estimatedDelivery).toISOString();
    }

    onUpdateStatus(order.id, newStatus as Order['status'], additionalInfo);
    haptic.success();
    toast.success('Status yangilandi!');
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'processing': return 'blue';
      case 'shipped': return 'purple';
      case 'delivered': return 'green';
      case 'cancelled': return 'red';
      default: return 'gray';
    }
  };

  const currentStatusColor = getStatusColor(order.status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className={`bg-gradient-to-r from-${currentStatusColor}-500 to-${currentStatusColor}-600 text-white p-6 rounded-t-xl`}>
        <h2 className="text-white text-2xl mb-2">
          Status yangilash
        </h2>
        <p className="text-white/80">
          Buyurtma #{order.id.toString().padStart(6, '0')}
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Customer Info */}
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-gray-900 dark:text-white font-semibold mb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Mijoz ma'lumotlari
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Ism:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.customerInfo.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Telefon:</span>
              <span className="text-gray-900 dark:text-white font-medium">
                {order.customerInfo.phone}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <span className="text-gray-600 dark:text-gray-400">Manzil:</span>
                <p className="text-gray-900 dark:text-white font-medium">
                  {order.customerInfo.address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-1">
            Hozirgi status:
          </p>
          <p className="text-blue-900 dark:text-blue-100 font-semibold">
            {statuses.find(s => s.value === order.status)?.label}
          </p>
        </div>

        {/* Status Selection */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300 font-medium mb-3">
            Yangi status tanlang:
          </label>
          <div className="grid grid-cols-2 gap-3">
            {statuses.map((status) => {
              const Icon = status.icon;
              const isSelected = newStatus === status.value;
              const isDisabled = status.value === 'pending'; // Can't go back to pending

              return (
                <button
                  key={status.value}
                  onClick={() => {
                    if (!isDisabled) {
                      setNewStatus(status.value as Order['status']);
                      haptic.light();
                    }
                  }}
                  disabled={isDisabled}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-left
                    ${isSelected 
                      ? `border-${status.color}-500 bg-${status.color}-50 dark:bg-${status.color}-900/20` 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                    ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-6 h-6 ${isSelected ? `text-${status.color}-600` : 'text-gray-400'}`} />
                    <span className={`font-medium ${isSelected ? `text-${status.color}-900 dark:text-${status.color}-100` : 'text-gray-700 dark:text-gray-300'}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className={`text-xs ${isSelected ? `text-${status.color}-700 dark:text-${status.color}-300` : 'text-gray-500 dark:text-gray-400'}`}>
                    {status.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tracking Number (for shipped status) */}
        {(newStatus === 'shipped' || newStatus === 'delivered') && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Kuzatuv raqami:
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="TRK-2024-001234"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Estimated Delivery */}
        {(newStatus === 'processing' || newStatus === 'shipped') && (
          <div>
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
              Taxminiy yetkazib berish sanasi:
            </label>
            <input
              type="date"
              value={estimatedDelivery}
              onChange={(e) => setEstimatedDelivery(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Courier Info (for shipped status) */}
        {newStatus === 'shipped' && (
          <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-purple-900 dark:text-purple-100 font-medium">
              <Truck className="w-5 h-5" />
              <span>Kuryer ma'lumotlari</span>
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                Kuryer ismi:
              </label>
              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="Ism Familiya"
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                Kuryer telefoni:
              </label>
              <input
                type="tel"
                value={courierPhone}
                onChange={(e) => setCourierPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2 text-sm">
                Transport (ixtiyoriy):
              </label>
              <input
                type="text"
                value={courierVehicle}
                onChange={(e) => setCourierVehicle(e.target.value)}
                placeholder="Mashina rusumi va raqami"
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Warning */}
        {newStatus !== order.status && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-yellow-900 dark:text-yellow-100 font-medium mb-1">
                Diqqat!
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Status o'zgarishi mijozga bildirishnoma yuboriladi
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => {
              onClose();
              haptic.light();
            }}
            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition font-medium"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleUpdateStatus}
            disabled={newStatus === order.status}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}
