// Vendor System Types

import { Product, Order } from './index';

export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  description?: string;
  logo?: string;
  banner?: string;
  
  // Business info
  businessName: string;
  businessType: 'individual' | 'company';
  taxId?: string;
  address?: {
    street: string;
    city: string;
    region: string;
    country: string;
    postalCode?: string;
  };
  
  // Account info
  status: 'active' | 'pending' | 'suspended' | 'blocked';
  verified: boolean;
  verifiedAt?: string;
  
  // Settings
  settings: {
    autoAcceptOrders: boolean;
    minOrderAmount?: number;
    deliveryTime?: string; // e.g., "2-3 days"
    returnPolicy?: string;
    languages: string[];
  };
  
  // Stats
  stats: {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
    responseTime: number; // in hours
    completionRate: number; // percentage
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface VendorProduct extends Product {
  vendorId: string;
  vendor?: Vendor;
}

export interface VendorOrder extends Order {
  vendorId: string;
  vendor?: Vendor;
  vendorStatus: 'pending' | 'accepted' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  vendorNotes?: string;
}

export interface VendorStats {
  // Overview
  totalProducts: number;
  activeProducts: number;
  outOfStockProducts: number;
  
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  
  totalRevenue: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number; // percentage
  
  // Performance
  averageRating: number;
  totalReviews: number;
  responseTime: number; // hours
  completionRate: number; // percentage
  
  // Top products
  topProducts: {
    product: Product;
    sales: number;
    revenue: number;
  }[];
  
  // Recent activity
  recentOrders: VendorOrder[];
  recentReviews: {
    id: string;
    productId: string;
    productName: string;
    rating: number;
    comment: string;
    customerName: string;
    createdAt: string;
  }[];
  
  // Charts data
  revenueByMonth: {
    month: string;
    revenue: number;
  }[];
  
  ordersByStatus: {
    status: string;
    count: number;
  }[];
  
  salesByCategory: {
    category: string;
    sales: number;
    revenue: number;
  }[];
}

export interface VendorRevenue {
  vendorId: string;
  
  // Total earnings
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  withdrawnBalance: number;
  
  // Commission
  commissionRate: number; // percentage (e.g., 10 = 10%)
  totalCommission: number;
  
  // Transactions
  transactions: VendorTransaction[];
  
  // Payouts
  payouts: VendorPayout[];
}

export interface VendorTransaction {
  id: string;
  vendorId: string;
  orderId: string;
  type: 'sale' | 'refund' | 'commission' | 'payout' | 'adjustment';
  amount: number;
  commission: number;
  netAmount: number; // amount - commission
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
}

export interface VendorPayout {
  id: string;
  vendorId: string;
  amount: number;
  method: 'bank_transfer' | 'paypal' | 'card' | 'wallet';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bankDetails?: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    swiftCode?: string;
  };
  notes?: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
}

export interface VendorReview {
  id: string;
  vendorId: string;
  productId: string;
  orderId: string;
  customerId: string;
  customerName: string;
  rating: number; // 1-5
  comment: string;
  images?: string[];
  response?: {
    text: string;
    createdAt: string;
  };
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

// Helper Functions

/**
 * Get vendor from localStorage
 */
export function getVendor(vendorId: string): Vendor | null {
  const vendors = getAllVendors();
  return vendors.find(v => v.id === vendorId) || null;
}

/**
 * Get all vendors
 */
export function getAllVendors(): Vendor[] {
  const stored = localStorage.getItem('vendors');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save vendor
 */
export function saveVendor(vendor: Vendor): void {
  const vendors = getAllVendors();
  const index = vendors.findIndex(v => v.id === vendor.id);
  
  if (index !== -1) {
    vendors[index] = {
      ...vendor,
      updatedAt: new Date().toISOString()
    };
  } else {
    vendors.push(vendor);
  }
  
  localStorage.setItem('vendors', JSON.stringify(vendors));
  window.dispatchEvent(new Event('vendors-updated'));
}

/**
 * Get vendor products
 */
export function getVendorProducts(vendorId: string): Product[] {
  const allProducts = JSON.parse(localStorage.getItem('products') || '[]');
  return allProducts.filter((p: any) => p.vendorId === vendorId);
}

/**
 * Get vendor orders
 */
export function getVendorOrders(vendorId: string): VendorOrder[] {
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  return allOrders
    .filter((o: any) => o.vendorId === vendorId)
    .map((o: any) => ({
      ...o,
      vendorStatus: o.vendorStatus || 'pending'
    }));
}

/**
 * Update vendor order status
 */
export function updateVendorOrderStatus(
  orderId: string,
  vendorId: string,
  status: VendorOrder['vendorStatus'],
  notes?: string
): boolean {
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const orderIndex = allOrders.findIndex((o: any) => o.id === orderId && o.vendorId === vendorId);
  
  if (orderIndex === -1) return false;
  
  allOrders[orderIndex] = {
    ...allOrders[orderIndex],
    vendorStatus: status,
    vendorNotes: notes,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem('orders', JSON.stringify(allOrders));
  window.dispatchEvent(new Event('orders-updated'));
  
  return true;
}

/**
 * Get vendor statistics
 */
export function getVendorStats(vendorId: string): VendorStats {
  const products = getVendorProducts(vendorId);
  const orders = getVendorOrders(vendorId);
  
  // Products stats
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  
  // Orders stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.vendorStatus === 'pending').length;
  const processingOrders = orders.filter(o => o.vendorStatus === 'processing').length;
  const completedOrders = orders.filter(o => o.vendorStatus === 'delivered').length;
  
  // Revenue stats
  const totalRevenue = orders
    .filter(o => o.vendorStatus === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);
  
  const now = new Date();
  const thisMonth = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === now.getMonth() && 
           orderDate.getFullYear() === now.getFullYear() &&
           o.vendorStatus === 'delivered';
  });
  
  const thisMonthRevenue = thisMonth.reduce((sum, o) => sum + o.total, 0);
  
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthOrders = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    return orderDate.getMonth() === lastMonth.getMonth() && 
           orderDate.getFullYear() === lastMonth.getFullYear() &&
           o.vendorStatus === 'delivered';
  });
  
  const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + o.total, 0);
  const revenueGrowth = lastMonthRevenue > 0 
    ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : 0;
  
  // Performance
  const reviews = getVendorReviews(vendorId);
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;
  const totalReviews = reviews.length;
  
  const responseTime = 2; // Placeholder - would calculate from actual response data
  const completionRate = totalOrders > 0 
    ? (completedOrders / totalOrders) * 100 
    : 0;
  
  // Top products
  const productSales: { [productId: string]: { product: Product; sales: number; revenue: number } } = {};
  
  orders.filter(o => o.vendorStatus === 'delivered').forEach(order => {
    order.items.forEach(item => {
      const productId = item.product.id;
      if (!productSales[productId]) {
        productSales[productId] = {
          product: item.product,
          sales: 0,
          revenue: 0
        };
      }
      productSales[productId].sales += item.quantity;
      productSales[productId].revenue += item.quantity * item.product.price;
    });
  });
  
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  // Recent activity
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);
  
  const recentReviews = reviews
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(r => ({
      id: r.id,
      productId: r.productId,
      productName: products.find(p => p.id === r.productId)?.name || 'Unknown',
      rating: r.rating,
      comment: r.comment,
      customerName: r.customerName,
      createdAt: r.createdAt
    }));
  
  // Charts data - Revenue by month (last 6 months)
  const revenueByMonth: { month: string; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthOrders = orders.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === date.getMonth() && 
             orderDate.getFullYear() === date.getFullYear() &&
             o.vendorStatus === 'delivered';
    });
    
    revenueByMonth.push({
      month: date.toLocaleDateString('uz-UZ', { month: 'short' }),
      revenue: monthOrders.reduce((sum, o) => sum + o.total, 0)
    });
  }
  
  // Orders by status
  const ordersByStatus = [
    { status: 'Kutilmoqda', count: pendingOrders },
    { status: 'Jarayonda', count: processingOrders },
    { status: 'Yetkazilgan', count: completedOrders },
    { status: 'Bekor qilingan', count: orders.filter(o => o.vendorStatus === 'cancelled').length }
  ];
  
  // Sales by category
  const categorySales: { [category: string]: { sales: number; revenue: number } } = {};
  
  orders.filter(o => o.vendorStatus === 'delivered').forEach(order => {
    order.items.forEach(item => {
      const category = item.product.category;
      if (!categorySales[category]) {
        categorySales[category] = { sales: 0, revenue: 0 };
      }
      categorySales[category].sales += item.quantity;
      categorySales[category].revenue += item.quantity * item.product.price;
    });
  });
  
  const salesByCategory = Object.entries(categorySales).map(([category, data]) => ({
    category,
    sales: data.sales,
    revenue: data.revenue
  }));
  
  return {
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalOrders,
    pendingOrders,
    processingOrders,
    completedOrders,
    totalRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    revenueGrowth,
    averageRating,
    totalReviews,
    responseTime,
    completionRate,
    topProducts,
    recentOrders,
    recentReviews,
    revenueByMonth,
    ordersByStatus,
    salesByCategory
  };
}

/**
 * Get vendor revenue
 */
export function getVendorRevenue(vendorId: string): VendorRevenue {
  const orders = getVendorOrders(vendorId);
  const commissionRate = 10; // 10% commission
  
  // Calculate earnings
  const deliveredOrders = orders.filter(o => o.vendorStatus === 'delivered');
  const totalEarnings = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
  const totalCommission = (totalEarnings * commissionRate) / 100;
  
  // Transactions
  const transactions: VendorTransaction[] = deliveredOrders.map(order => {
    const amount = order.total;
    const commission = (amount * commissionRate) / 100;
    const netAmount = amount - commission;
    
    return {
      id: `txn_${order.id}`,
      vendorId,
      orderId: order.id,
      type: 'sale',
      amount,
      commission,
      netAmount,
      status: 'completed',
      description: `Order #${order.id}`,
      createdAt: order.createdAt
    };
  });
  
  // Get payouts
  const payouts = getVendorPayouts(vendorId);
  const withdrawnBalance = payouts
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const pendingBalance = payouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const availableBalance = totalEarnings - totalCommission - withdrawnBalance - pendingBalance;
  
  return {
    vendorId,
    totalEarnings,
    availableBalance,
    pendingBalance,
    withdrawnBalance,
    commissionRate,
    totalCommission,
    transactions,
    payouts
  };
}

/**
 * Get vendor reviews
 */
export function getVendorReviews(vendorId: string): VendorReview[] {
  const stored = localStorage.getItem(`vendor_reviews_${vendorId}`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save vendor review
 */
export function saveVendorReview(review: VendorReview): void {
  const reviews = getVendorReviews(review.vendorId);
  const index = reviews.findIndex(r => r.id === review.id);
  
  if (index !== -1) {
    reviews[index] = {
      ...review,
      updatedAt: new Date().toISOString()
    };
  } else {
    reviews.push(review);
  }
  
  localStorage.setItem(`vendor_reviews_${review.vendorId}`, JSON.stringify(reviews));
  window.dispatchEvent(new Event('vendor-reviews-updated'));
}

/**
 * Get vendor payouts
 */
export function getVendorPayouts(vendorId: string): VendorPayout[] {
  const stored = localStorage.getItem(`vendor_payouts_${vendorId}`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Request payout
 */
export function requestVendorPayout(
  vendorId: string,
  amount: number,
  method: VendorPayout['method'],
  bankDetails?: VendorPayout['bankDetails']
): VendorPayout {
  const revenue = getVendorRevenue(vendorId);
  
  if (amount > revenue.availableBalance) {
    throw new Error('Insufficient balance');
  }
  
  const payout: VendorPayout = {
    id: `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    vendorId,
    amount,
    method,
    status: 'pending',
    bankDetails,
    requestedAt: new Date().toISOString()
  };
  
  const payouts = getVendorPayouts(vendorId);
  payouts.push(payout);
  
  localStorage.setItem(`vendor_payouts_${vendorId}`, JSON.stringify(payouts));
  window.dispatchEvent(new Event('vendor-payouts-updated'));
  
  return payout;
}

/**
 * Export vendor report
 */
export function exportVendorReport(vendorId: string, type: 'sales' | 'products' | 'revenue'): string {
  const vendor = getVendor(vendorId);
  const stats = getVendorStats(vendorId);
  const revenue = getVendorRevenue(vendorId);
  
  const report = {
    vendor,
    stats,
    revenue,
    type,
    exportedAt: new Date().toISOString()
  };
  
  return JSON.stringify(report, null, 2);
}
