export type UserRole = 'customer' | 'vendor' | 'admin';

export interface User {
  id: string;
  phone: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar?: string;
  createdAt: string;
}

export interface VendorProfile {
  id: string;
  storeName: string;
  storeDescription: string;
  storeLogo?: string;
  storeBanner?: string;
  address: string;
  phone: string;
  email?: string; // NEW
  ownerName?: string; // NEW
  businessLicense?: string; // NEW
  rating?: number;
  totalSales?: number;
  status: 'pending' | 'active' | 'suspended'; // 'approved' -> 'active'
  commission?: number; // Percentage
  createdAt: string;
}

export interface AdminStats {
  totalUsers?: number;
  totalVendors: number;
  totalProducts: number;
  totalOrders?: number;
  totalRevenue: number;
  pendingOrders?: number;
  activeVendors: number;
  pendingVendors: number;
}