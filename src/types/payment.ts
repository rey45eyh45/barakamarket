// Payment System Types for Payme & Click Integration

export type PaymentMethod = 'cash' | 'card' | 'payme' | 'click' | 'uzum';

export type PaymentStatus = 
  | 'pending'      // Waiting for payment
  | 'processing'   // Payment in progress
  | 'paid'         // Successfully paid
  | 'failed'       // Payment failed
  | 'cancelled'    // Payment cancelled
  | 'refunded'     // Payment refunded
  | 'expired';     // Payment link expired

export type PaymentGateway = 'payme' | 'click' | 'uzum' | 'manual';

export interface Payment {
  id: string;
  orderId: string;
  orderNumber: string;
  
  // Payment details
  amount: number; // in so'm
  currency: 'UZS';
  method: PaymentMethod;
  gateway?: PaymentGateway;
  
  // Status
  status: PaymentStatus;
  
  // Gateway response
  transactionId?: string; // From payment gateway
  paymentUrl?: string; // Payment link for customer
  
  // Payme specific
  paymeTransactionId?: string;
  paymeAccountId?: string;
  
  // Click specific
  clickTransId?: string;
  clickMerchantTransId?: string;
  
  // Customer info
  customerId?: string;
  customerEmail?: string;
  customerPhone?: string;
  
  // Metadata
  description?: string;
  metadata?: Record<string, any>;
  
  // Error handling
  error?: string;
  errorCode?: string;
  retryCount: number;
  
  // Timestamps
  createdAt: string;
  paidAt?: string;
  failedAt?: string;
  refundedAt?: string;
  expiresAt?: string;
  updatedAt: string;
}

export interface PaymeConfig {
  merchantId: string; // Payme merchant ID
  secretKey: string; // Payme secret key
  callbackUrl: string; // Webhook URL
  returnUrl: string; // Return URL after payment
  testMode: boolean; // Use test environment
}

export interface ClickConfig {
  merchantId: string; // Click merchant ID
  serviceId: string; // Click service ID
  secretKey: string; // Click secret key
  callbackUrl: string; // Webhook URL
  returnUrl: string; // Return URL
  testMode: boolean;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  description?: string;
  customerEmail?: string;
  customerPhone?: string;
  returnUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  paymentUrl?: string;
  transactionId?: string;
  error?: string;
}

export interface PaymentVerification {
  success: boolean;
  status: PaymentStatus;
  transactionId?: string;
  paidAt?: string;
  error?: string;
}

export interface PaymentWebhook {
  gateway: PaymentGateway;
  event: string;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  orderId?: string;
  timestamp: string;
  signature?: string;
  rawData: any;
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  successfulPayments: number;
  successfulAmount: number;
  failedPayments: number;
  refundedPayments: number;
  refundedAmount: number;
  
  successRate: number; // %
  averageAmount: number;
  
  byMethod: {
    [key in PaymentMethod]?: {
      count: number;
      amount: number;
    };
  };
  
  byGateway: {
    [key in PaymentGateway]?: {
      count: number;
      amount: number;
      successRate: number;
    };
  };
  
  byDate: {
    date: string;
    count: number;
    amount: number;
  }[];
}

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  refundId?: string;
  refundedAmount: number;
  error?: string;
}

// Helper Functions

export function createPayment(
  orderId: string,
  orderNumber: string,
  amount: number,
  method: PaymentMethod,
  options?: {
    customerId?: string;
    customerEmail?: string;
    customerPhone?: string;
    description?: string;
    metadata?: Record<string, any>;
  }
): Omit<Payment, 'id' | 'createdAt' | 'updatedAt'> {
  const gateway: PaymentGateway | undefined = 
    method === 'payme' ? 'payme' :
    method === 'click' ? 'click' :
    method === 'card' ? 'manual' :
    undefined;

  return {
    orderId,
    orderNumber,
    amount,
    currency: 'UZS',
    method,
    gateway,
    status: 'pending',
    customerId: options?.customerId,
    customerEmail: options?.customerEmail,
    customerPhone: options?.customerPhone,
    description: options?.description,
    metadata: options?.metadata,
    retryCount: 0
  };
}

export function savePayment(payment: Payment): void {
  const payments = getPayments();
  const index = payments.findIndex(p => p.id === payment.id);
  
  if (index !== -1) {
    payments[index] = {
      ...payment,
      updatedAt: new Date().toISOString()
    };
  } else {
    payments.push({
      ...payment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }
  
  localStorage.setItem('payments', JSON.stringify(payments));
}

export function getPayments(): Payment[] {
  const stored = localStorage.getItem('payments');
  return stored ? JSON.parse(stored) : [];
}

export function getPaymentById(paymentId: string): Payment | null {
  const payments = getPayments();
  return payments.find(p => p.id === paymentId) || null;
}

export function getPaymentsByOrderId(orderId: string): Payment[] {
  const payments = getPayments();
  return payments.filter(p => p.orderId === orderId);
}

export function updatePaymentStatus(
  paymentId: string,
  status: PaymentStatus,
  data?: {
    transactionId?: string;
    error?: string;
    errorCode?: string;
  }
): void {
  const payment = getPaymentById(paymentId);
  if (!payment) return;

  payment.status = status;
  payment.updatedAt = new Date().toISOString();
  
  if (data?.transactionId) {
    payment.transactionId = data.transactionId;
  }
  
  if (data?.error) {
    payment.error = data.error;
  }
  
  if (data?.errorCode) {
    payment.errorCode = data.errorCode;
  }

  if (status === 'paid') {
    payment.paidAt = new Date().toISOString();
  } else if (status === 'failed') {
    payment.failedAt = new Date().toISOString();
    payment.retryCount += 1;
  } else if (status === 'refunded') {
    payment.refundedAt = new Date().toISOString();
  }

  savePayment(payment);
}

export function getPaymentStats(periodDays: number = 30): PaymentStats {
  const payments = getPayments();
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  
  const periodPayments = payments.filter(p => 
    new Date(p.createdAt) >= periodStart
  );

  const totalPayments = periodPayments.length;
  const totalAmount = periodPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const successfulPayments = periodPayments.filter(p => p.status === 'paid');
  const successfulAmount = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const failedPayments = periodPayments.filter(p => p.status === 'failed').length;
  
  const refundedPayments = periodPayments.filter(p => p.status === 'refunded');
  const refundedAmount = refundedPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const successRate = totalPayments > 0 
    ? (successfulPayments.length / totalPayments) * 100 
    : 0;
  
  const averageAmount = totalPayments > 0 
    ? totalAmount / totalPayments 
    : 0;

  // By method
  const byMethod: PaymentStats['byMethod'] = {};
  periodPayments.forEach(p => {
    if (!byMethod[p.method]) {
      byMethod[p.method] = { count: 0, amount: 0 };
    }
    byMethod[p.method]!.count += 1;
    byMethod[p.method]!.amount += p.amount;
  });

  // By gateway
  const byGateway: PaymentStats['byGateway'] = {};
  periodPayments.forEach(p => {
    if (p.gateway) {
      if (!byGateway[p.gateway]) {
        byGateway[p.gateway] = { count: 0, amount: 0, successRate: 0 };
      }
      byGateway[p.gateway]!.count += 1;
      byGateway[p.gateway]!.amount += p.amount;
    }
  });

  // Calculate success rates for gateways
  Object.keys(byGateway).forEach(gateway => {
    const gatewayPayments = periodPayments.filter(p => p.gateway === gateway);
    const gatewaySuccessful = gatewayPayments.filter(p => p.status === 'paid').length;
    byGateway[gateway as PaymentGateway]!.successRate = 
      gatewayPayments.length > 0 
        ? (gatewaySuccessful / gatewayPayments.length) * 100 
        : 0;
  });

  // By date (last 7 days)
  const byDate: PaymentStats['byDate'] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const datePayments = periodPayments.filter(p => 
      p.createdAt.startsWith(dateStr) && p.status === 'paid'
    );
    
    byDate.push({
      date: dateStr,
      count: datePayments.length,
      amount: datePayments.reduce((sum, p) => sum + p.amount, 0)
    });
  }

  return {
    totalPayments,
    totalAmount,
    successfulPayments: successfulPayments.length,
    successfulAmount,
    failedPayments,
    refundedPayments: refundedPayments.length,
    refundedAmount,
    successRate,
    averageAmount,
    byMethod,
    byGateway,
    byDate
  };
}

export function generatePaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
}

export function getPaymentStatusText(status: PaymentStatus, language: 'uz' | 'ru' | 'en' = 'uz'): string {
  const texts = {
    pending: { uz: 'Kutilmoqda', ru: 'Ожидание', en: 'Pending' },
    processing: { uz: 'Jarayonda', ru: 'В процессе', en: 'Processing' },
    paid: { uz: 'To\'langan', ru: 'Оплачено', en: 'Paid' },
    failed: { uz: 'Xatolik', ru: 'Ошибка', en: 'Failed' },
    cancelled: { uz: 'Bekor qilingan', ru: 'Отменено', en: 'Cancelled' },
    refunded: { uz: 'Qaytarilgan', ru: 'Возвращено', en: 'Refunded' },
    expired: { uz: 'Muddati tugagan', ru: 'Истек срок', en: 'Expired' }
  };
  
  return texts[status][language];
}

export function getPaymentMethodText(method: PaymentMethod, language: 'uz' | 'ru' | 'en' = 'uz'): string {
  const texts = {
    cash: { uz: 'Naqd pul', ru: 'Наличные', en: 'Cash' },
    card: { uz: 'Karta', ru: 'Карта', en: 'Card' },
    payme: { uz: 'Payme', ru: 'Payme', en: 'Payme' },
    click: { uz: 'Click', ru: 'Click', en: 'Click' },
    uzum: { uz: 'Uzum Bank', ru: 'Uzum Bank', en: 'Uzum Bank' }
  };
  
  return texts[method][language];
}

export function isPaymentExpired(payment: Payment): boolean {
  if (!payment.expiresAt) return false;
  return new Date() > new Date(payment.expiresAt);
}

export function canRetryPayment(payment: Payment): boolean {
  return payment.status === 'failed' && payment.retryCount < 3;
}

export function canRefundPayment(payment: Payment): boolean {
  return payment.status === 'paid' && !payment.refundedAt;
}
