export type NotificationType = 'order' | 'promotion' | 'system' | 'vendor' | 'payment' | 'delivery';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  imageUrl?: string;
  userId?: string;
  metadata?: {
    orderId?: string;
    productId?: string;
    vendorId?: string;
    amount?: number;
  };
}

export interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  systemNotifications: boolean;
  vendorMessages: boolean;
  paymentAlerts: boolean;
  deliveryUpdates: boolean;
  sound: boolean;
  vibration: boolean;
}
