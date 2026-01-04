// Customer System Types

import { Order, Product } from './index';
import { Vendor } from './vendor';

export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  
  // Profile info
  birthDate?: string;
  gender?: 'male' | 'female' | 'other';
  
  // Account status
  status: 'active' | 'suspended' | 'blocked';
  verified: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Loyalty program
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  
  // Stats
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    completedOrders: number;
    cancelledOrders: number;
    totalReviews: number;
    averageRating: number; // Rating customer gives
  };
  
  // Preferences
  preferences: {
    language: 'uz' | 'ru' | 'en';
    currency: 'UZS' | 'USD';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    newsletter: boolean;
  };
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  type: 'home' | 'work' | 'other';
  label?: string; // e.g., "Home", "Office"
  isDefault: boolean;
  
  // Address details
  fullName: string;
  phone: string;
  street: string;
  apartment?: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
  
  // Location
  coordinates?: {
    lat: number;
    lng: number;
  };
  
  instructions?: string; // Delivery instructions
  
  createdAt: string;
  updatedAt: string;
}

export interface CustomerPaymentMethod {
  id: string;
  customerId: string;
  type: 'card' | 'bank_account' | 'wallet';
  isDefault: boolean;
  
  // Card details (masked)
  cardNumber?: string; // e.g., "**** **** **** 1234"
  cardHolder?: string;
  cardBrand?: 'visa' | 'mastercard' | 'uzcard' | 'humo';
  expiryMonth?: number;
  expiryYear?: number;
  
  // Bank account (masked)
  accountNumber?: string;
  bankName?: string;
  
  // Wallet
  walletProvider?: 'payme' | 'click' | 'paypal';
  walletId?: string;
  
  verified: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface CustomerLoyaltyTransaction {
  id: string;
  customerId: string;
  type: 'earned' | 'redeemed' | 'expired' | 'adjusted';
  points: number; // Positive for earned, negative for redeemed
  description: string;
  orderId?: string;
  
  // Balance after transaction
  balanceAfter: number;
  
  createdAt: string;
  expiresAt?: string;
}

export interface CustomerReward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  type: 'discount' | 'free_shipping' | 'gift' | 'cashback';
  
  // Discount details
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  
  // Restrictions
  minOrderAmount?: number;
  validUntil?: string;
  maxRedemptions?: number;
  currentRedemptions: number;
  
  image?: string;
  active: boolean;
}

export interface CustomerFavoriteVendor {
  customerId: string;
  vendorId: string;
  vendor: Vendor;
  addedAt: string;
}

export interface CustomerStats {
  // Orders
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  
  // Spending
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  
  // Loyalty
  loyaltyPoints: number;
  loyaltyTier: Customer['loyaltyTier'];
  pointsToNextTier: number;
  
  // Reviews
  totalReviews: number;
  averageRating: number;
  
  // Activity
  lastLoginAt?: string;
  accountAge: number; // days
  
  // Top categories
  topCategories: {
    category: string;
    orders: number;
    spent: number;
  }[];
  
  // Recent orders
  recentOrders: Order[];
  
  // Spending by month (last 6 months)
  spendingByMonth: {
    month: string;
    spent: number;
  }[];
}

// Helper Functions

/**
 * Get customer from localStorage
 */
export function getCustomer(customerId: string): Customer | null {
  const customers = getAllCustomers();
  return customers.find(c => c.id === customerId) || null;
}

/**
 * Get all customers
 */
export function getAllCustomers(): Customer[] {
  const stored = localStorage.getItem('customers');
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save customer
 */
export function saveCustomer(customer: Customer): void {
  const customers = getAllCustomers();
  const index = customers.findIndex(c => c.id === customer.id);
  
  if (index !== -1) {
    customers[index] = {
      ...customer,
      updatedAt: new Date().toISOString()
    };
  } else {
    customers.push(customer);
  }
  
  localStorage.setItem('customers', JSON.stringify(customers));
  window.dispatchEvent(new Event('customers-updated'));
}

/**
 * Get customer orders
 */
export function getCustomerOrders(customerId: string): Order[] {
  const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  return allOrders
    .filter((o: any) => o.customerId === customerId)
    .sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

/**
 * Get customer addresses
 */
export function getCustomerAddresses(customerId: string): CustomerAddress[] {
  const stored = localStorage.getItem(`customer_addresses_${customerId}`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save customer address
 */
export function saveCustomerAddress(address: CustomerAddress): void {
  const addresses = getCustomerAddresses(address.customerId);
  const index = addresses.findIndex(a => a.id === address.id);
  
  // If setting as default, unset others
  if (address.isDefault) {
    addresses.forEach(a => a.isDefault = false);
  }
  
  if (index !== -1) {
    addresses[index] = {
      ...address,
      updatedAt: new Date().toISOString()
    };
  } else {
    addresses.push(address);
  }
  
  localStorage.setItem(`customer_addresses_${address.customerId}`, JSON.stringify(addresses));
  window.dispatchEvent(new Event('customer-addresses-updated'));
}

/**
 * Delete customer address
 */
export function deleteCustomerAddress(customerId: string, addressId: string): boolean {
  const addresses = getCustomerAddresses(customerId);
  const filtered = addresses.filter(a => a.id !== addressId);
  
  if (filtered.length < addresses.length) {
    localStorage.setItem(`customer_addresses_${customerId}`, JSON.stringify(filtered));
    window.dispatchEvent(new Event('customer-addresses-updated'));
    return true;
  }
  
  return false;
}

/**
 * Get default address
 */
export function getDefaultAddress(customerId: string): CustomerAddress | null {
  const addresses = getCustomerAddresses(customerId);
  return addresses.find(a => a.isDefault) || addresses[0] || null;
}

/**
 * Get customer payment methods
 */
export function getCustomerPaymentMethods(customerId: string): CustomerPaymentMethod[] {
  const stored = localStorage.getItem(`customer_payment_methods_${customerId}`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Save payment method
 */
export function savePaymentMethod(method: CustomerPaymentMethod): void {
  const methods = getCustomerPaymentMethods(method.customerId);
  const index = methods.findIndex(m => m.id === method.id);
  
  // If setting as default, unset others
  if (method.isDefault) {
    methods.forEach(m => m.isDefault = false);
  }
  
  if (index !== -1) {
    methods[index] = {
      ...method,
      updatedAt: new Date().toISOString()
    };
  } else {
    methods.push(method);
  }
  
  localStorage.setItem(`customer_payment_methods_${method.customerId}`, JSON.stringify(methods));
  window.dispatchEvent(new Event('customer-payment-methods-updated'));
}

/**
 * Delete payment method
 */
export function deletePaymentMethod(customerId: string, methodId: string): boolean {
  const methods = getCustomerPaymentMethods(customerId);
  const filtered = methods.filter(m => m.id !== methodId);
  
  if (filtered.length < methods.length) {
    localStorage.setItem(`customer_payment_methods_${customerId}`, JSON.stringify(filtered));
    window.dispatchEvent(new Event('customer-payment-methods-updated'));
    return true;
  }
  
  return false;
}

/**
 * Get customer loyalty points
 */
export function getCustomerLoyaltyPoints(customerId: string): number {
  const customer = getCustomer(customerId);
  return customer?.loyaltyPoints || 0;
}

/**
 * Get loyalty transactions
 */
export function getLoyaltyTransactions(customerId: string): CustomerLoyaltyTransaction[] {
  const stored = localStorage.getItem(`customer_loyalty_${customerId}`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Add loyalty points
 */
export function addLoyaltyPoints(
  customerId: string,
  points: number,
  description: string,
  orderId?: string
): void {
  const customer = getCustomer(customerId);
  if (!customer) return;
  
  // Update customer points
  customer.loyaltyPoints += points;
  
  // Update tier if needed
  customer.loyaltyTier = calculateLoyaltyTier(customer.loyaltyPoints);
  
  saveCustomer(customer);
  
  // Add transaction
  const transactions = getLoyaltyTransactions(customerId);
  const transaction: CustomerLoyaltyTransaction = {
    id: `loyalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    type: 'earned',
    points,
    description,
    orderId,
    balanceAfter: customer.loyaltyPoints,
    createdAt: new Date().toISOString()
  };
  
  transactions.push(transaction);
  localStorage.setItem(`customer_loyalty_${customerId}`, JSON.stringify(transactions));
  window.dispatchEvent(new Event('customer-loyalty-updated'));
}

/**
 * Redeem loyalty points
 */
export function redeemLoyaltyPoints(
  customerId: string,
  points: number,
  description: string
): boolean {
  const customer = getCustomer(customerId);
  if (!customer || customer.loyaltyPoints < points) {
    return false;
  }
  
  // Update customer points
  customer.loyaltyPoints -= points;
  customer.loyaltyTier = calculateLoyaltyTier(customer.loyaltyPoints);
  saveCustomer(customer);
  
  // Add transaction
  const transactions = getLoyaltyTransactions(customerId);
  const transaction: CustomerLoyaltyTransaction = {
    id: `loyalty_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    customerId,
    type: 'redeemed',
    points: -points,
    description,
    balanceAfter: customer.loyaltyPoints,
    createdAt: new Date().toISOString()
  };
  
  transactions.push(transaction);
  localStorage.setItem(`customer_loyalty_${customerId}`, JSON.stringify(transactions));
  window.dispatchEvent(new Event('customer-loyalty-updated'));
  
  return true;
}

/**
 * Calculate loyalty tier based on points
 */
function calculateLoyaltyTier(points: number): Customer['loyaltyTier'] {
  if (points >= 10000) return 'platinum';
  if (points >= 5000) return 'gold';
  if (points >= 1000) return 'silver';
  return 'bronze';
}

/**
 * Get points needed for next tier
 */
export function getPointsToNextTier(customerId: string): number {
  const customer = getCustomer(customerId);
  if (!customer) return 0;
  
  const points = customer.loyaltyPoints;
  const tier = customer.loyaltyTier;
  
  if (tier === 'platinum') return 0;
  if (tier === 'gold') return 10000 - points;
  if (tier === 'silver') return 5000 - points;
  return 1000 - points;
}

/**
 * Get available rewards
 */
export function getAvailableRewards(customerId: string): CustomerReward[] {
  const allRewards = getAllRewards();
  const points = getCustomerLoyaltyPoints(customerId);
  
  return allRewards.filter(r => 
    r.active && 
    r.pointsRequired <= points &&
    (r.maxRedemptions === undefined || r.currentRedemptions < r.maxRedemptions) &&
    (r.validUntil === undefined || new Date(r.validUntil) > new Date())
  );
}

/**
 * Get all rewards
 */
export function getAllRewards(): CustomerReward[] {
  const stored = localStorage.getItem('customer_rewards');
  return stored ? JSON.parse(stored) : [
    {
      id: 'reward_1',
      name: '10% chegirma',
      description: '10% chegirma barcha mahsulotlarga',
      pointsRequired: 500,
      type: 'discount',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 100000,
      currentRedemptions: 0,
      active: true
    },
    {
      id: 'reward_2',
      name: 'Bepul yetkazish',
      description: 'Bepul yetkazib berish',
      pointsRequired: 300,
      type: 'free_shipping',
      currentRedemptions: 0,
      active: true
    },
    {
      id: 'reward_3',
      name: '50,000 so\'m chegirma',
      description: '50,000 so\'m chegirma 500,000 so\'mdan yuqori xaridlarga',
      pointsRequired: 1000,
      type: 'discount',
      discountType: 'fixed',
      discountValue: 50000,
      minOrderAmount: 500000,
      currentRedemptions: 0,
      active: true
    }
  ];
}

/**
 * Get favorite vendors
 */
export function getFavoriteVendors(customerId: string): CustomerFavoriteVendor[] {
  const stored = localStorage.getItem(`customer_favorite_vendors_${customerId}`);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Add favorite vendor
 */
export function addFavoriteVendor(customerId: string, vendor: Vendor): boolean {
  const favorites = getFavoriteVendors(customerId);
  
  if (favorites.some(f => f.vendorId === vendor.id)) {
    return false; // Already favorited
  }
  
  const favorite: CustomerFavoriteVendor = {
    customerId,
    vendorId: vendor.id,
    vendor,
    addedAt: new Date().toISOString()
  };
  
  favorites.push(favorite);
  localStorage.setItem(`customer_favorite_vendors_${customerId}`, JSON.stringify(favorites));
  window.dispatchEvent(new Event('customer-favorites-updated'));
  
  return true;
}

/**
 * Remove favorite vendor
 */
export function removeFavoriteVendor(customerId: string, vendorId: string): boolean {
  const favorites = getFavoriteVendors(customerId);
  const filtered = favorites.filter(f => f.vendorId !== vendorId);
  
  if (filtered.length < favorites.length) {
    localStorage.setItem(`customer_favorite_vendors_${customerId}`, JSON.stringify(filtered));
    window.dispatchEvent(new Event('customer-favorites-updated'));
    return true;
  }
  
  return false;
}

/**
 * Get customer statistics
 */
export function getCustomerStats(customerId: string): CustomerStats {
  const customer = getCustomer(customerId);
  if (!customer) {
    return {
      totalOrders: 0,
      completedOrders: 0,
      cancelledOrders: 0,
      pendingOrders: 0,
      totalSpent: 0,
      averageOrderValue: 0,
      loyaltyPoints: 0,
      loyaltyTier: 'bronze',
      pointsToNextTier: 1000,
      totalReviews: 0,
      averageRating: 0,
      accountAge: 0,
      topCategories: [],
      recentOrders: [],
      spendingByMonth: []
    };
  }
  
  const orders = getCustomerOrders(customerId);
  
  // Orders stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
  const pendingOrders = orders.filter(o => 
    o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
  ).length;
  
  // Spending stats
  const completedOrdersList = orders.filter(o => o.status === 'delivered');
  const totalSpent = completedOrdersList.reduce((sum, o) => sum + o.total, 0);
  const averageOrderValue = completedOrders > 0 ? totalSpent / completedOrders : 0;
  const lastOrderDate = orders[0]?.createdAt;
  
  // Loyalty
  const loyaltyPoints = customer.loyaltyPoints;
  const loyaltyTier = customer.loyaltyTier;
  const pointsToNextTier = getPointsToNextTier(customerId);
  
  // Reviews
  const totalReviews = customer.stats.totalReviews;
  const averageRating = customer.stats.averageRating;
  
  // Activity
  const accountAge = Math.floor(
    (Date.now() - new Date(customer.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  
  // Top categories
  const categoryStats: { [category: string]: { orders: number; spent: number } } = {};
  
  completedOrdersList.forEach(order => {
    order.items.forEach(item => {
      const category = item.product.category;
      if (!categoryStats[category]) {
        categoryStats[category] = { orders: 0, spent: 0 };
      }
      categoryStats[category].orders += 1;
      categoryStats[category].spent += item.quantity * item.product.price;
    });
  });
  
  const topCategories = Object.entries(categoryStats)
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);
  
  // Recent orders
  const recentOrders = orders.slice(0, 5);
  
  // Spending by month (last 6 months)
  const spendingByMonth: { month: string; spent: number }[] = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthOrders = completedOrdersList.filter(o => {
      const orderDate = new Date(o.createdAt);
      return orderDate.getMonth() === date.getMonth() && 
             orderDate.getFullYear() === date.getFullYear();
    });
    
    spendingByMonth.push({
      month: date.toLocaleDateString('uz-UZ', { month: 'short' }),
      spent: monthOrders.reduce((sum, o) => sum + o.total, 0)
    });
  }
  
  return {
    totalOrders,
    completedOrders,
    cancelledOrders,
    pendingOrders,
    totalSpent,
    averageOrderValue,
    lastOrderDate,
    loyaltyPoints,
    loyaltyTier,
    pointsToNextTier,
    totalReviews,
    averageRating,
    lastLoginAt: customer.lastLoginAt,
    accountAge,
    topCategories,
    recentOrders,
    spendingByMonth
  };
}

/**
 * Update customer preferences
 */
export function updateCustomerPreferences(
  customerId: string,
  preferences: Partial<Customer['preferences']>
): boolean {
  const customer = getCustomer(customerId);
  if (!customer) return false;
  
  customer.preferences = {
    ...customer.preferences,
    ...preferences
  };
  
  saveCustomer(customer);
  return true;
}

/**
 * Calculate loyalty points from order
 */
export function calculateOrderLoyaltyPoints(orderTotal: number): number {
  // 1 point per 10,000 so'm
  return Math.floor(orderTotal / 10000);
}
