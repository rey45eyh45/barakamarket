export type VariantType = 'color' | 'size' | 'material' | 'style' | 'capacity';

export interface VariantOption {
  id: string;
  type: VariantType;
  name: string;
  value: string;
  priceModifier?: number; // +/- price adjustment
  stockModifier?: number; // specific stock for this variant
  imageUrl?: string; // optional image for this variant
}

export interface ProductVariant {
  id: string;
  productId: string;
  options: VariantOption[]; // e.g., [{type: 'color', value: 'red'}, {type: 'size', value: 'L'}]
  sku?: string; // unique identifier
  price?: number; // override product price
  stock: number;
  imageUrl?: string;
  isAvailable: boolean;
}

export interface VariantGroup {
  type: VariantType;
  label: string;
  options: Array<{
    id: string;
    name: string;
    value: string;
    color?: string; // hex color for color variants
    priceModifier?: number;
  }>;
}

// Common variant presets
export const COLOR_VARIANTS = [
  { id: 'red', name: 'Qizil', value: 'red', color: '#ef4444' },
  { id: 'blue', name: "Ko'k", value: 'blue', color: '#3b82f6' },
  { id: 'green', name: 'Yashil', value: 'green', color: '#10b981' },
  { id: 'black', name: 'Qora', value: 'black', color: '#000000' },
  { id: 'white', name: 'Oq', value: 'white', color: '#ffffff' },
  { id: 'yellow', name: 'Sariq', value: 'yellow', color: '#eab308' },
  { id: 'purple', name: 'Binafsha', value: 'purple', color: '#a855f7' },
  { id: 'pink', name: 'Pushti', value: 'pink', color: '#ec4899' },
  { id: 'gray', name: 'Kulrang', value: 'gray', color: '#6b7280' },
  { id: 'orange', name: "To'q sariq", value: 'orange', color: '#f97316' }
];

export const SIZE_VARIANTS = [
  { id: 'xs', name: 'XS', value: 'xs' },
  { id: 's', name: 'S', value: 's' },
  { id: 'm', name: 'M', value: 'm' },
  { id: 'l', name: 'L', value: 'l' },
  { id: 'xl', name: 'XL', value: 'xl' },
  { id: 'xxl', name: 'XXL', value: 'xxl' },
  { id: '3xl', name: '3XL', value: '3xl' }
];

export const CAPACITY_VARIANTS = [
  { id: '64gb', name: '64GB', value: '64gb' },
  { id: '128gb', name: '128GB', value: '128gb', priceModifier: 50000 },
  { id: '256gb', name: '256GB', value: '256gb', priceModifier: 100000 },
  { id: '512gb', name: '512GB', value: '512gb', priceModifier: 200000 },
  { id: '1tb', name: '1TB', value: '1tb', priceModifier: 300000 }
];

export const MATERIAL_VARIANTS = [
  { id: 'cotton', name: 'Paxta', value: 'cotton' },
  { id: 'polyester', name: 'Polyester', value: 'polyester' },
  { id: 'leather', name: 'Charm', value: 'leather', priceModifier: 100000 },
  { id: 'silk', name: 'Ipak', value: 'silk', priceModifier: 150000 },
  { id: 'wool', name: 'Jun', value: 'wool', priceModifier: 80000 }
];