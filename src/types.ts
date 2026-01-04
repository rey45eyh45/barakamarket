import { ProductVariant, VariantGroup } from './types/variant';

// Review Interface
export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  images?: string[]; // Review rasmlar (Base64 yoki URLs)
  isVerifiedPurchase?: boolean; // Sotib olingan mahsulot uchun sharh
  helpfulCount?: number; // "Foydali" bosishlar soni
  helpfulBy?: string[]; // Foydali deb belgilagan userlar ID'lari
  vendorResponse?: {
    message: string;
    respondedAt: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export interface PromoCode {
  id: string;
  code: string; // Unique code (uppercase)
  type: 'percentage' | 'fixed'; // Foiz yoki fix summa
  value: number; // Chegirma qiymati (foiz: 0-100, fix: summa)
  description: string; // Tavsif
  minOrderAmount: number; // Min buyurtma summasi
  maxDiscount?: number; // Max chegirma summasi (percentage uchun)
  usageLimit: number; // Umumiy foydalanish limiti
  usedCount: number; // Foydalanilgan soni
  userLimit: number; // Har bir user necha marta ishlatishi mumkin
  validFrom: string; // ISO date
  validUntil: string; // ISO date
  isActive: boolean; // Faol/Faol emas
  createdAt: string;
  updatedAt: string;
}

export interface PromoCodeUsage {
  userId: string;
  promoCodeId: string;
  usedCount: number;
  lastUsed: string;
}

// Shipping Types
export interface ShippingZone {
  id: string;
  name: string; // Hudud nomi (e.g., "Toshkent shahri", "Toshkent viloyati")
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingMethod {
  id: string;
  zoneId: string; // Qaysi hudud uchun
  name: string; // Yetkazish turi (e.g., "Standart", "Tez", "Express")
  description: string; // Tavsif
  deliveryTime: string; // Yetkazish vaqti (e.g., "1-3 kun", "24 soat")
  
  // Pricing
  type: 'fixed' | 'weight' | 'price'; // Narx hisobi turi
  baseCost: number; // Asosiy narx
  
  // For weight-based
  costPerKg?: number; // Har kg uchun qo'shimcha
  freeShippingThreshold?: number; // Bepul yetkazish chegarasi (summa)
  
  // For price-based (percentage)
  costPercentage?: number; // Buyurtma summasidan foiz (e.g., 5%)
  maxCost?: number; // Maksimal narx
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  vendorId?: string;
  
  // Stock Management
  stock?: number; // Available quantity
  lowStockThreshold?: number; // Alert threshold
  
  // Discount System
  originalPrice?: number; // Price before discount (avvalgi narx)
  discount?: number; // Discount percentage (0-100)
  discountValidUntil?: string; // ISO date string
  
  // Product Details (NEW)
  warranty?: string; // Kafolat muddati (e.g., "12 oy", "2 yil")
  returnPolicy?: string; // Qaytarish muddati (e.g., "14 kun", "30 kun")
  
  // Additional Fields (NEW)
  brand?: string; // Brend
  material?: string; // Material
  color?: string; // Rang
  size?: string; // O'lcham
  weight?: string; // Og'irlik
  dimensions?: string; // O'lchamlari (e.g., "30x20x10 cm")
  madeIn?: string; // Ishlab chiqarilgan mamlakat
  
  // Multiple Images
  images?: string[]; // Qo'shimcha rasmlar
  
  // Product Variations (NEW)
  hasVariants?: boolean; // Variantlari bormi
  variantGroups?: VariantGroup[]; // Variant turlari (rang, o'lcham, etc.)
  variants?: ProductVariant[]; // Barcha variant kombinatsiyalari
  
  // Featured & Analytics (NEW)
  isFeatured?: boolean; // TOP mahsulotmi (bosh sahifada ko'rsatiladi)
  soldCount?: number; // Sotilgan mahsulotlar soni
  views?: number; // Ko'rilganlar soni
  rating?: number; // Reyting (0-5)
  reviewsCount?: number; // Sharhlar soni
  
  // Timestamps
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: ProductVariant; // Tanlangan variant
}