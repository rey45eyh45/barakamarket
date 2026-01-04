// Email Notification Types

export type EmailType = 
  | 'order_confirmation'
  | 'order_shipped'
  | 'order_delivered'
  | 'order_cancelled'
  | 'order_refund'
  | 'password_reset'
  | 'welcome'
  | 'promotional'
  | 'low_stock_alert'
  | 'review_request';

export type EmailStatus = 'pending' | 'sent' | 'failed' | 'delivered' | 'bounced';

export interface EmailNotification {
  id: string;
  type: EmailType;
  to: string;
  from: string;
  subject: string;
  templateId?: string;
  status: EmailStatus;
  
  // Template data
  data: Record<string, any>;
  
  // Metadata
  orderId?: string;
  userId?: string;
  productId?: string;
  
  // Tracking
  sentAt?: string;
  deliveredAt?: string;
  openedAt?: string;
  clickedAt?: string;
  
  // Error handling
  error?: string;
  retryCount: number;
  maxRetries: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface EmailPreferences {
  userId: string;
  
  // Marketing
  promotional: boolean;
  newsletter: boolean;
  newProducts: boolean;
  
  // Transactional (cannot disable)
  orderConfirmation: boolean;
  orderStatus: boolean;
  shipping: boolean;
  
  // Other
  reviewRequests: boolean;
  priceDrops: boolean;
  backInStock: boolean;
  
  updatedAt: string;
}

export interface EmailTemplate {
  id: string;
  type: EmailType;
  name: string;
  subject: string;
  html: string;
  text: string;
  variables: string[]; // List of variables used in template
  
  // Preview
  previewText?: string;
  
  // Status
  active: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface EmailStats {
  totalSent: number;
  totalDelivered: number;
  totalFailed: number;
  totalOpened: number;
  totalClicked: number;
  
  openRate: number; // %
  clickRate: number; // %
  deliveryRate: number; // %
  
  byType: {
    [key in EmailType]?: {
      sent: number;
      delivered: number;
      opened: number;
      clicked: number;
    };
  };
}

// Default email preferences
export const DEFAULT_EMAIL_PREFERENCES: Omit<EmailPreferences, 'userId' | 'updatedAt'> = {
  // Marketing - opt-in by default
  promotional: true,
  newsletter: true,
  newProducts: false,
  
  // Transactional - always enabled
  orderConfirmation: true,
  orderStatus: true,
  shipping: true,
  
  // Other
  reviewRequests: true,
  priceDrops: false,
  backInStock: false
};

// Email helper functions
export function createEmailNotification(
  type: EmailType,
  to: string,
  data: Record<string, any>,
  options?: {
    orderId?: string;
    userId?: string;
    productId?: string;
  }
): Omit<EmailNotification, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    type,
    to,
    from: 'noreply@dreammarket.uz',
    subject: getEmailSubject(type, data),
    data,
    status: 'pending',
    orderId: options?.orderId,
    userId: options?.userId,
    productId: options?.productId,
    retryCount: 0,
    maxRetries: 3
  };
}

export function getEmailSubject(type: EmailType, data: Record<string, any>): string {
  const subjects: Record<EmailType, string> = {
    order_confirmation: `Buyurtma tasdiqlandi #${data.orderNumber || ''}`,
    order_shipped: `Buyurtma jo'natildi #${data.orderNumber || ''}`,
    order_delivered: `Buyurtma yetkazildi #${data.orderNumber || ''}`,
    order_cancelled: `Buyurtma bekor qilindi #${data.orderNumber || ''}`,
    order_refund: `Pul qaytarildi #${data.orderNumber || ''}`,
    password_reset: 'Parolni tiklash',
    welcome: 'Baraka Market\'ga xush kelibsiz!',
    promotional: data.subject || 'Maxsus taklif!',
    low_stock_alert: `Kam qoldi: ${data.productName || ''}`,
    review_request: 'Fikr-mulohaza qoldiring'
  };
  
  return subjects[type];
}

export function getEmailPreferences(userId: string): EmailPreferences {
  const stored = localStorage.getItem(`email_preferences_${userId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    userId,
    ...DEFAULT_EMAIL_PREFERENCES,
    updatedAt: new Date().toISOString()
  };
}

export function saveEmailPreferences(preferences: EmailPreferences): void {
  localStorage.setItem(
    `email_preferences_${preferences.userId}`,
    JSON.stringify({
      ...preferences,
      updatedAt: new Date().toISOString()
    })
  );
}

export function canSendEmail(type: EmailType, userId: string): boolean {
  const preferences = getEmailPreferences(userId);
  
  // Transactional emails always allowed
  const transactionalTypes: EmailType[] = [
    'order_confirmation',
    'order_shipped',
    'order_delivered',
    'order_cancelled',
    'order_refund',
    'password_reset'
  ];
  
  if (transactionalTypes.includes(type)) {
    return true;
  }
  
  // Check preferences for other types
  const typeToPreference: Partial<Record<EmailType, keyof EmailPreferences>> = {
    promotional: 'promotional',
    welcome: 'newsletter',
    low_stock_alert: 'backInStock',
    review_request: 'reviewRequests'
  };
  
  const preferenceKey = typeToPreference[type];
  if (preferenceKey && preferenceKey in preferences) {
    return preferences[preferenceKey as keyof EmailPreferences] === true;
  }
  
  return true; // Default allow
}

export function queueEmail(notification: Omit<EmailNotification, 'id' | 'createdAt' | 'updatedAt'>): string {
  const id = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const fullNotification: EmailNotification = {
    ...notification,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Get queue
  const queue = JSON.parse(localStorage.getItem('email_queue') || '[]');
  queue.push(fullNotification);
  
  // Keep only last 100 emails
  if (queue.length > 100) {
    queue.shift();
  }
  
  localStorage.setItem('email_queue', JSON.stringify(queue));
  
  return id;
}

export function getEmailQueue(): EmailNotification[] {
  return JSON.parse(localStorage.getItem('email_queue') || '[]');
}

export function updateEmailStatus(
  emailId: string,
  status: EmailStatus,
  error?: string
): void {
  const queue = getEmailQueue();
  const index = queue.findIndex(e => e.id === emailId);
  
  if (index !== -1) {
    queue[index].status = status;
    queue[index].updatedAt = new Date().toISOString();
    
    if (status === 'sent') {
      queue[index].sentAt = new Date().toISOString();
    } else if (status === 'delivered') {
      queue[index].deliveredAt = new Date().toISOString();
    } else if (status === 'failed') {
      queue[index].error = error;
      queue[index].retryCount += 1;
    }
    
    localStorage.setItem('email_queue', JSON.stringify(queue));
  }
}

export function getEmailStats(): EmailStats {
  const queue = getEmailQueue();
  
  const totalSent = queue.filter(e => e.status === 'sent' || e.status === 'delivered').length;
  const totalDelivered = queue.filter(e => e.status === 'delivered').length;
  const totalFailed = queue.filter(e => e.status === 'failed').length;
  const totalOpened = queue.filter(e => e.openedAt).length;
  const totalClicked = queue.filter(e => e.clickedAt).length;
  
  const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
  const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
  const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
  
  // By type
  const byType: EmailStats['byType'] = {};
  queue.forEach(email => {
    if (!byType[email.type]) {
      byType[email.type] = { sent: 0, delivered: 0, opened: 0, clicked: 0 };
    }
    
    if (email.status === 'sent' || email.status === 'delivered') {
      byType[email.type]!.sent += 1;
    }
    if (email.status === 'delivered') {
      byType[email.type]!.delivered += 1;
    }
    if (email.openedAt) {
      byType[email.type]!.opened += 1;
    }
    if (email.clickedAt) {
      byType[email.type]!.clicked += 1;
    }
  });
  
  return {
    totalSent,
    totalDelivered,
    totalFailed,
    totalOpened,
    totalClicked,
    openRate,
    clickRate,
    deliveryRate,
    byType
  };
}

export function retryFailedEmails(): void {
  const queue = getEmailQueue();
  const failedEmails = queue.filter(
    e => e.status === 'failed' && e.retryCount < e.maxRetries
  );
  
  failedEmails.forEach(email => {
    // Reset status to pending for retry
    updateEmailStatus(email.id, 'pending');
  });
}