/**
 * 💰 PRICE FORMATTERS
 */

export function formatPrice(price: number, currency: string = "so'm"): string {
  return new Intl.NumberFormat('uz-UZ').format(price) + ` ${currency}`;
}

export function formatPriceShort(price: number): string {
  if (price >= 1000000) {
    return (price / 1000000).toFixed(1) + ' mln';
  }
  if (price >= 1000) {
    return (price / 1000).toFixed(0) + ' ming';
  }
  return price.toString();
}

export function calculateDiscount(originalPrice: number, discountPercent: number): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

export function calculateDiscountAmount(originalPrice: number, discountPercent: number): number {
  return Math.round(originalPrice * (discountPercent / 100));
}

/**
 * 📅 DATE FORMATTERS
 */

export function formatDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function formatDateTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export function formatTimeAgo(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffSeconds = Math.floor(diffTime / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'Hozirgina';
  if (diffMinutes < 60) return `${diffMinutes} daqiqa oldin`;
  if (diffHours < 24) return `${diffHours} soat oldin`;
  if (diffDays === 1) return 'Kecha';
  if (diffDays < 7) return `${diffDays} kun oldin`;
  if (diffWeeks < 4) return `${diffWeeks} hafta oldin`;
  if (diffMonths < 12) return `${diffMonths} oy oldin`;
  
  return formatDate(date);
}

export function formatRelativeDate(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Bugun';
  if (diffDays === 1) return 'Kecha';
  if (diffDays < 7) return `${diffDays} kun oldin`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta oldin`;
  
  return date.toLocaleDateString('uz-UZ', { 
    day: '2-digit', 
    month: 'short',
    year: 'numeric'
  });
}

/**
 * 📱 PHONE FORMATTERS
 */

export function formatPhone(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format: +998 90 123 45 67
  if (cleaned.length === 12 && cleaned.startsWith('998')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10)}`;
  }
  
  // Format: 90 123 45 67
  if (cleaned.length === 9) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 5)} ${cleaned.slice(5, 7)} ${cleaned.slice(7)}`;
  }
  
  return phone;
}

export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 9 || (cleaned.length === 12 && cleaned.startsWith('998'));
}

/**
 * 📏 NUMBER FORMATTERS
 */

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('uz-UZ').format(num);
}

export function formatPercentage(value: number, decimals: number = 0): string {
  return value.toFixed(decimals) + '%';
}

export function formatRating(rating: number, decimals: number = 1): string {
  return rating.toFixed(decimals);
}

/**
 * 📦 FILE SIZE FORMATTER
 */

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 🔤 STRING FORMATTERS
 */

export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * 🎨 COLOR UTILITIES
 */

export function getStatusColor(status: string): {
  text: string;
  bg: string;
  border: string;
} {
  const colors: Record<string, { text: string; bg: string; border: string }> = {
    pending: {
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      border: 'border-yellow-200 dark:border-yellow-800'
    },
    processing: {
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      border: 'border-blue-200 dark:border-blue-800'
    },
    shipped: {
      text: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      border: 'border-purple-200 dark:border-purple-800'
    },
    delivered: {
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      border: 'border-green-200 dark:border-green-800'
    },
    cancelled: {
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      border: 'border-red-200 dark:border-red-800'
    }
  };

  return colors[status] || {
    text: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-900/30',
    border: 'border-gray-200 dark:border-gray-800'
  };
}

/**
 * 🛒 ORDER & PRODUCT UTILITIES
 */

export function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

export function generateTrackingNumber(): string {
  const prefix = 'TRK';
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}-${year}-${random}`;
}

export function formatOrderNumber(orderId: number): string {
  return `#${orderId.toString().padStart(6, '0')}`;
}

/**
 * 🔢 CALCULATION UTILITIES
 */

export function calculateTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

export function calculateSubtotal(price: number, quantity: number): number {
  return price * quantity;
}

export function calculateTax(amount: number, taxRate: number = 0): number {
  return Math.round(amount * taxRate);
}

export function calculateShipping(subtotal: number, shippingCost: number, freeShippingThreshold?: number): number {
  if (freeShippingThreshold && subtotal >= freeShippingThreshold) {
    return 0;
  }
  return shippingCost;
}

/**
 * 🔍 VALIDATION UTILITIES
 */

export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 📊 STATISTICS UTILITIES
 */

export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
}

export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * 🎯 ARRAY UTILITIES
 */

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

export function sortBy<T>(array: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}
