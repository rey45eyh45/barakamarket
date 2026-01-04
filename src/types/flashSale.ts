export interface FlashSale {
  id: string;
  title: string;
  description: string;
  startTime: string; // ISO date
  endTime: string; // ISO date
  products: FlashSaleProduct[];
  isActive: boolean;
  banner?: string; // Banner image URL
  createdAt: string;
  updatedAt: string;
}

export interface FlashSaleProduct {
  productId: string;
  originalPrice: number;
  flashPrice: number;
  discount: number; // Percentage
  stockLimit: number; // Limited quantity for flash sale
  soldCount: number;
  maxPerUser: number; // Max quantity per user
}

export interface FlashSaleTimer {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}
