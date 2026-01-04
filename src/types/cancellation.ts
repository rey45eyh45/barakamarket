// Order Cancellation & Refund Types

export type CancellationReason = 
  | 'changed_mind'
  | 'found_better_price'
  | 'ordered_by_mistake'
  | 'shipping_too_slow'
  | 'product_not_needed'
  | 'other';

export type RefundStatus = 
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'processing'
  | 'completed';

export type RefundMethod = 
  | 'original_payment'
  | 'wallet'
  | 'bank_transfer'
  | 'cash';

export interface CancellationRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  reason: CancellationReason;
  reasonText: string; // Custom reason if "other"
  requestedAt: string;
  processedAt?: string;
  processedBy?: string; // Admin/Vendor ID
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface RefundRequest {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  amount: number;
  reason: string;
  refundMethod: RefundMethod;
  status: RefundStatus;
  requestedAt: string;
  approvedAt?: string;
  completedAt?: string;
  processedBy?: string; // Admin ID
  rejectionReason?: string;
  transactionId?: string; // Payment transaction ID
  refundTransactionId?: string; // Refund transaction ID
  notes?: string; // Admin notes
}

export interface OrderWithCancellation {
  id: string;
  canCancel: boolean; // Based on status (pending/processing only)
  cancellationDeadline?: string; // Time limit for cancellation
  cancellationRequest?: CancellationRequest;
  refundRequest?: RefundRequest;
}

// Helper constants
export const CANCELLATION_REASON_LABELS: Record<CancellationReason, { uz: string; ru: string; en: string }> = {
  changed_mind: {
    uz: "Fikrimni o'zgartirdim",
    ru: "Передумал(а)",
    en: "Changed my mind"
  },
  found_better_price: {
    uz: "Arzonroq topdim",
    ru: "Нашёл дешевле",
    en: "Found better price"
  },
  ordered_by_mistake: {
    uz: "Xatolik bilan buyurtma qildim",
    ru: "Заказал по ошибке",
    en: "Ordered by mistake"
  },
  shipping_too_slow: {
    uz: "Yetkazish juda sekin",
    ru: "Доставка слишком долгая",
    en: "Shipping too slow"
  },
  product_not_needed: {
    uz: "Mahsulot kerak emas",
    ru: "Товар не нужен",
    en: "Product not needed"
  },
  other: {
    uz: "Boshqa sabab",
    ru: "Другая причина",
    en: "Other reason"
  }
};

export const REFUND_STATUS_LABELS: Record<RefundStatus, { uz: string; ru: string; en: string }> = {
  pending: {
    uz: "Kutilmoqda",
    ru: "Ожидается",
    en: "Pending"
  },
  approved: {
    uz: "Tasdiqlandi",
    ru: "Одобрено",
    en: "Approved"
  },
  rejected: {
    uz: "Rad etildi",
    ru: "Отклонено",
    en: "Rejected"
  },
  processing: {
    uz: "Qayta ishlanmoqda",
    ru: "Обрабатывается",
    en: "Processing"
  },
  completed: {
    uz: "Yakunlandi",
    ru: "Завершено",
    en: "Completed"
  }
};

// Helper functions
export function canCancelOrder(orderStatus: string): boolean {
  return ['pending', 'processing'].includes(orderStatus);
}

export function getCancellationDeadline(orderDate: string): string {
  const deadline = new Date(orderDate);
  deadline.setHours(deadline.getHours() + 24); // 24 hours to cancel
  return deadline.toISOString();
}

export function isCancellationExpired(deadline: string): boolean {
  return new Date() > new Date(deadline);
}
