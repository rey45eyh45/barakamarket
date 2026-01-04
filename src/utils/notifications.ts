import { Notification, NotificationPreferences } from '../types/notification';

const NOTIFICATIONS_KEY = 'notifications';
const PREFERENCES_KEY = 'notification_preferences';

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  orderUpdates: true,
  promotions: true,
  systemNotifications: true,
  vendorMessages: true,
  paymentAlerts: true,
  deliveryUpdates: true,
  sound: true,
  vibration: true
};

// Get all notifications
export function getNotifications(userId?: string): Notification[] {
  try {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) return [];
    
    const all = JSON.parse(stored) as Notification[];
    
    // Filter by userId if provided
    if (userId) {
      return all.filter(n => !n.userId || n.userId === userId);
    }
    
    return all;
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return [];
  }
}

// Save notifications
export function saveNotifications(notifications: Notification[]): void {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
}

// Add new notification
export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  const newNotification: Notification = {
    ...notification,
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false
  };

  const existing = getNotifications();
  const updated = [newNotification, ...existing];
  
  saveNotifications(updated);
  
  return newNotification;
}

// Mark notification as read
export function markAsRead(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    n.id === notificationId ? { ...n, read: true } : n
  );
  saveNotifications(updated);
}

// Mark all as read
export function markAllAsRead(userId?: string): void {
  const notifications = getNotifications();
  const updated = notifications.map(n => 
    (!userId || n.userId === userId) ? { ...n, read: true } : n
  );
  saveNotifications(updated);
}

// Delete notification
export function deleteNotification(notificationId: string): void {
  const notifications = getNotifications();
  const updated = notifications.filter(n => n.id !== notificationId);
  saveNotifications(updated);
}

// Delete all notifications
export function deleteAllNotifications(userId?: string): void {
  if (userId) {
    const notifications = getNotifications();
    const updated = notifications.filter(n => n.userId !== userId);
    saveNotifications(updated);
  } else {
    localStorage.removeItem(NOTIFICATIONS_KEY);
  }
}

// Get unread count
export function getUnreadCount(userId?: string): number {
  const notifications = getNotifications(userId);
  return notifications.filter(n => !n.read).length;
}

// Get preferences
export function getNotificationPreferences(): NotificationPreferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return DEFAULT_PREFERENCES;
    
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Failed to load notification preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

// Save preferences
export function saveNotificationPreferences(preferences: NotificationPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }
}

// Helper: Create order notification
export function createOrderNotification(orderId: string, status: string, userId?: string): Notification {
  const messages: Record<string, { title: string; message: string }> = {
    pending: {
      title: '🛍️ Buyurtma qabul qilindi',
      message: `Buyurtma #${orderId} muvaffaqiyatli qabul qilindi va ko'rib chiqilmoqda.`
    },
    confirmed: {
      title: '✅ Buyurtma tasdiqlandi',
      message: `Buyurtma #${orderId} tasdiqlandi va tez orada jo'natiladi.`
    },
    shipped: {
      title: '📦 Buyurtma jo\'natildi',
      message: `Buyurtma #${orderId} jo'natildi. Tez orada yetkazib beriladi.`
    },
    delivered: {
      title: '🎉 Buyurtma yetkazildi',
      message: `Buyurtma #${orderId} muvaffaqiyatli yetkazib berildi. Xaridingiz uchun rahmat!`
    },
    cancelled: {
      title: '❌ Buyurtma bekor qilindi',
      message: `Buyurtma #${orderId} bekor qilindi.`
    }
  };

  const content = messages[status] || messages.pending;

  return addNotification({
    type: 'order',
    title: content.title,
    message: content.message,
    userId,
    metadata: { orderId }
  });
}

// Helper: Create promo notification
export function createPromoNotification(title: string, message: string, imageUrl?: string, userId?: string): Notification {
  return addNotification({
    type: 'promotion',
    title,
    message,
    imageUrl,
    userId
  });
}

// Helper: Create system notification
export function createSystemNotification(title: string, message: string, userId?: string): Notification {
  return addNotification({
    type: 'system',
    title,
    message,
    userId
  });
}

// Helper: Create vendor notification
export function createVendorNotification(title: string, message: string, vendorId: string): Notification {
  return addNotification({
    type: 'vendor',
    title,
    message,
    userId: vendorId,
    metadata: { vendorId }
  });
}

// Helper: Create payment notification
export function createPaymentNotification(amount: number, orderId: string, success: boolean, userId?: string): Notification {
  return addNotification({
    type: 'payment',
    title: success ? '💳 To\'lov muvaffaqiyatli' : '❌ To\'lov xatolik',
    message: success 
      ? `${new Intl.NumberFormat('uz-UZ').format(amount)} so'm to'lov muvaffaqiyatli amalga oshirildi.`
      : `To'lov amalga oshmadi. Iltimos, qayta urinib ko'ring.`,
    userId,
    metadata: { orderId, amount }
  });
}

// Helper: Create delivery notification
export function createDeliveryNotification(orderId: string, message: string, userId?: string): Notification {
  return addNotification({
    type: 'delivery',
    title: '🚚 Yetkazib berish',
    message,
    userId,
    metadata: { orderId }
  });
}