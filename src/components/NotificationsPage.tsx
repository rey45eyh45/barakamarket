import { ArrowLeft, Bell, BellOff, Trash2, Check, Filter, Settings as SettingsIcon, Package, Tag, AlertCircle, CreditCard, Truck, Store, X, CheckCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Notification, NotificationType, NotificationPreferences } from '../types/notification';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  deleteAllNotifications,
  getNotificationPreferences,
  saveNotificationPreferences,
  getUnreadCount
} from '../utils/notifications';
import { useTelegram } from '../contexts/TelegramContext';
import { toast } from 'sonner@2.0.3';

interface NotificationsPageProps {
  onBack: () => void;
  userId?: string;
}

export function NotificationsPage({ onBack, userId }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<NotificationType | 'all'>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>(getNotificationPreferences());
  const [unreadCount, setUnreadCount] = useState(0);
  const { haptic } = useTelegram();

  // Load notifications
  useEffect(() => {
    loadNotifications();
  }, [userId]);

  // Filter notifications
  useEffect(() => {
    if (selectedFilter === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === selectedFilter));
    }
  }, [notifications, selectedFilter]);

  const loadNotifications = () => {
    const loaded = getNotifications(userId);
    setNotifications(loaded);
    setUnreadCount(getUnreadCount(userId));
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
    loadNotifications();
    haptic?.light();
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead(userId);
    loadNotifications();
    haptic?.success();
    toast.success('Barcha bildirishnomalar o\'qildi deb belgilandi');
  };

  const handleDelete = (notificationId: string) => {
    deleteNotification(notificationId);
    loadNotifications();
    haptic?.light();
    toast.success('Bildirishnoma o\'chirildi');
  };

  const handleDeleteAll = () => {
    if (confirm('Barcha bildirishnomalarni o\'chirmoqchimisiz?')) {
      deleteAllNotifications(userId);
      loadNotifications();
      haptic?.success();
      toast.success('Barcha bildirishnomalar o\'chirildi');
    }
  };

  const handleSavePreferences = () => {
    saveNotificationPreferences(preferences);
    setShowSettings(false);
    haptic?.success();
    toast.success('Sozlamalar saqlandi');
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5" />;
      case 'promotion':
        return <Tag className="w-5 h-5" />;
      case 'system':
        return <AlertCircle className="w-5 h-5" />;
      case 'vendor':
        return <Store className="w-5 h-5" />;
      case 'payment':
        return <CreditCard className="w-5 h-5" />;
      case 'delivery':
        return <Truck className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'promotion':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'system':
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
      case 'vendor':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'payment':
        return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'delivery':
        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Hozir';
    if (minutes < 60) return `${minutes} daqiqa oldin`;
    if (hours < 24) return `${hours} soat oldin`;
    if (days < 7) return `${days} kun oldin`;
    
    return date.toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' });
  };

  const filters = [
    { value: 'all', label: 'Barchasi', icon: Bell },
    { value: 'order', label: 'Buyurtmalar', icon: Package },
    { value: 'promotion', label: 'Aksiyalar', icon: Tag },
    { value: 'payment', label: 'To\'lovlar', icon: CreditCard },
    { value: 'delivery', label: 'Yetkazish', icon: Truck },
    { value: 'system', label: 'Tizim', icon: AlertCircle }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-gray-900 dark:text-white text-xl font-semibold">Bildirishnomalar</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">{unreadCount} ta yangi</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                    title="Barchasini o'qildi deb belgilash"
                  >
                    <CheckCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </button>
                )}
                <button
                  onClick={handleDeleteAll}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
                  title="Barchasini o'chirish"
                >
                  <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                </button>
              </>
            )}
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
            >
              <SettingsIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto scrollbar-hide">
          {filters.map(filter => {
            const Icon = filter.icon;
            const count = filter.value === 'all' 
              ? notifications.length 
              : notifications.filter(n => n.type === filter.value).length;
            
            return (
              <button
                key={filter.value}
                onClick={() => setSelectedFilter(filter.value as NotificationType | 'all')}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full transition ${
                  selectedFilter === filter.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{filter.label}</span>
                {count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    selectedFilter === filter.value
                      ? 'bg-white/20'
                      : 'bg-gray-200 dark:bg-gray-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {filteredNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-full mb-4">
              <BellOff className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Bildirishnomalar yo'q</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center text-sm">
              {selectedFilter === 'all' 
                ? 'Hali hech qanday bildirishnoma yo\'q'
                : `${filters.find(f => f.value === selectedFilter)?.label} bo'yicha bildirishnomalar yo'q`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white dark:bg-gray-800 rounded-xl p-4 border transition-all ${
                    notification.read
                      ? 'border-gray-200 dark:border-gray-700'
                      : 'border-blue-500 dark:border-blue-400 shadow-md'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold ${
                          notification.read 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {notification.message}
                      </p>

                      {notification.imageUrl && (
                        <div className="mb-2 rounded-lg overflow-hidden">
                          <img 
                            src={notification.imageUrl} 
                            alt="" 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(notification.timestamp)}
                        </span>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              O'qildi
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification.id)}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                          >
                            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="fixed inset-0 bg-black/50 z-40"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-t-3xl z-50 p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Bildirishnoma sozlamalari
                </h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {/* Order Updates */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Buyurtma yangiliklari</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Buyurtma holati o'zgarishi</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.orderUpdates}
                    onChange={() => setPreferences(prev => ({ ...prev, orderUpdates: !prev.orderUpdates }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>

                {/* Promotions */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Aksiyalar va chegirmalar</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Yangi takliflar haqida</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.promotions}
                    onChange={() => setPreferences(prev => ({ ...prev, promotions: !prev.promotions }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>

                {/* System Notifications */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Tizim xabarlari</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Muhim yangiliklar</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.systemNotifications}
                    onChange={() => setPreferences(prev => ({ ...prev, systemNotifications: !prev.systemNotifications }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>

                {/* Vendor Messages */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Store className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Sotuvchi xabarlari</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Do'konlardan xabarlar</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.vendorMessages}
                    onChange={() => setPreferences(prev => ({ ...prev, vendorMessages: !prev.vendorMessages }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>

                {/* Payment Alerts */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">To'lov xabarlari</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">To'lov holati</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.paymentAlerts}
                    onChange={() => setPreferences(prev => ({ ...prev, paymentAlerts: !prev.paymentAlerts }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>

                {/* Delivery Updates */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">Yetkazish yangiliklari</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Kuryer holati</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.deliveryUpdates}
                    onChange={() => setPreferences(prev => ({ ...prev, deliveryUpdates: !prev.deliveryUpdates }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Ovoz</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Bildirishnoma ovozi</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.sound}
                    onChange={() => setPreferences(prev => ({ ...prev, sound: !prev.sound }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>

                {/* Vibration */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Tebranish</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Haptic feedback</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.vibration}
                    onChange={() => setPreferences(prev => ({ ...prev, vibration: !prev.vibration }))}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>
              </div>

              <button
                onClick={handleSavePreferences}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
              >
                Saqlash
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
