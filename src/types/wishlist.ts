// Wishlist System Types

import { Product } from './index';

export interface WishlistItem {
  productId: string;
  product: Product;
  addedAt: string;
  priceAtAdd: number; // Track price changes
  notifyOnPriceDrop: boolean;
  notifyOnBackInStock: boolean;
}

export interface Wishlist {
  userId?: string; // If logged in
  items: WishlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface WishlistStats {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  priceDropCount: number; // Items with price drops
  outOfStockCount: number;
  
  byCategory: {
    [category: string]: number;
  };
  
  recentlyAdded: WishlistItem[]; // Last 5
  priceDrops: {
    item: WishlistItem;
    oldPrice: number;
    newPrice: number;
    percentageOff: number;
  }[];
}

export interface WishlistShare {
  id: string;
  wishlistItems: WishlistItem[];
  sharedBy?: string;
  shareUrl: string;
  expiresAt?: string;
  createdAt: string;
}

// Helper Functions

/**
 * Get wishlist from localStorage
 */
export function getWishlist(userId?: string): Wishlist {
  const key = userId ? `wishlist_${userId}` : 'wishlist_guest';
  const stored = localStorage.getItem(key);
  
  if (stored) {
    return JSON.parse(stored);
  }
  
  return {
    userId,
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Save wishlist to localStorage
 */
export function saveWishlist(wishlist: Wishlist): void {
  const key = wishlist.userId ? `wishlist_${wishlist.userId}` : 'wishlist_guest';
  
  const updated = {
    ...wishlist,
    updatedAt: new Date().toISOString()
  };
  
  localStorage.setItem(key, JSON.stringify(updated));
  
  // Trigger storage event for other tabs
  window.dispatchEvent(new Event('wishlist-updated'));
}

/**
 * Check if product is in wishlist
 */
export function isInWishlist(productId: string, userId?: string): boolean {
  const wishlist = getWishlist(userId);
  return wishlist.items.some(item => item.productId === productId);
}

/**
 * Add product to wishlist
 */
export function addToWishlist(
  product: Product,
  userId?: string,
  options?: {
    notifyOnPriceDrop?: boolean;
    notifyOnBackInStock?: boolean;
  }
): boolean {
  const wishlist = getWishlist(userId);
  
  // Check if already in wishlist
  if (wishlist.items.some(item => item.productId === product.id)) {
    return false; // Already exists
  }
  
  const item: WishlistItem = {
    productId: product.id,
    product,
    addedAt: new Date().toISOString(),
    priceAtAdd: product.price,
    notifyOnPriceDrop: options?.notifyOnPriceDrop ?? true,
    notifyOnBackInStock: options?.notifyOnBackInStock ?? true
  };
  
  wishlist.items.push(item);
  saveWishlist(wishlist);
  
  return true;
}

/**
 * Remove product from wishlist
 */
export function removeFromWishlist(productId: string, userId?: string): boolean {
  const wishlist = getWishlist(userId);
  const initialLength = wishlist.items.length;
  
  wishlist.items = wishlist.items.filter(item => item.productId !== productId);
  
  if (wishlist.items.length < initialLength) {
    saveWishlist(wishlist);
    return true;
  }
  
  return false;
}

/**
 * Toggle wishlist (add if not exists, remove if exists)
 */
export function toggleWishlist(product: Product, userId?: string): boolean {
  if (isInWishlist(product.id, userId)) {
    removeFromWishlist(product.id, userId);
    return false; // Removed
  } else {
    addToWishlist(product, userId);
    return true; // Added
  }
}

/**
 * Clear entire wishlist
 */
export function clearWishlist(userId?: string): void {
  const wishlist = getWishlist(userId);
  wishlist.items = [];
  saveWishlist(wishlist);
}

/**
 * Update wishlist item settings
 */
export function updateWishlistItem(
  productId: string,
  updates: {
    notifyOnPriceDrop?: boolean;
    notifyOnBackInStock?: boolean;
  },
  userId?: string
): boolean {
  const wishlist = getWishlist(userId);
  const item = wishlist.items.find(i => i.productId === productId);
  
  if (!item) return false;
  
  if (updates.notifyOnPriceDrop !== undefined) {
    item.notifyOnPriceDrop = updates.notifyOnPriceDrop;
  }
  
  if (updates.notifyOnBackInStock !== undefined) {
    item.notifyOnBackInStock = updates.notifyOnBackInStock;
  }
  
  saveWishlist(wishlist);
  return true;
}

/**
 * Get wishlist count
 */
export function getWishlistCount(userId?: string): number {
  const wishlist = getWishlist(userId);
  return wishlist.items.length;
}

/**
 * Get wishlist items
 */
export function getWishlistItems(userId?: string): WishlistItem[] {
  const wishlist = getWishlist(userId);
  return wishlist.items;
}

/**
 * Update product prices in wishlist (call this when products are fetched)
 */
export function syncWishlistPrices(products: Product[], userId?: string): void {
  const wishlist = getWishlist(userId);
  let hasChanges = false;
  
  wishlist.items.forEach(item => {
    const updatedProduct = products.find(p => p.id === item.productId);
    if (updatedProduct) {
      // Update product data
      item.product = updatedProduct;
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    saveWishlist(wishlist);
  }
}

/**
 * Get wishlist statistics
 */
export function getWishlistStats(userId?: string): WishlistStats {
  const wishlist = getWishlist(userId);
  const items = wishlist.items;
  
  const totalItems = items.length;
  const totalValue = items.reduce((sum, item) => sum + item.product.price, 0);
  const averagePrice = totalItems > 0 ? totalValue / totalItems : 0;
  
  // Price drops
  const priceDrops: WishlistStats['priceDrops'] = [];
  items.forEach(item => {
    if (item.product.price < item.priceAtAdd) {
      const percentageOff = ((item.priceAtAdd - item.product.price) / item.priceAtAdd) * 100;
      priceDrops.push({
        item,
        oldPrice: item.priceAtAdd,
        newPrice: item.product.price,
        percentageOff
      });
    }
  });
  
  const priceDropCount = priceDrops.length;
  
  // Out of stock count
  const outOfStockCount = items.filter(item => item.product.stock === 0).length;
  
  // By category
  const byCategory: { [category: string]: number } = {};
  items.forEach(item => {
    const category = item.product.category;
    byCategory[category] = (byCategory[category] || 0) + 1;
  });
  
  // Recently added (last 5)
  const recentlyAdded = [...items]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 5);
  
  return {
    totalItems,
    totalValue,
    averagePrice,
    priceDropCount,
    outOfStockCount,
    byCategory,
    recentlyAdded,
    priceDrops
  };
}

/**
 * Move wishlist item to cart
 */
export function moveWishlistToCart(
  productId: string,
  userId?: string
): { success: boolean; removed: boolean } {
  const wishlist = getWishlist(userId);
  const item = wishlist.items.find(i => i.productId === productId);
  
  if (!item) {
    return { success: false, removed: false };
  }
  
  // Add to cart (import cart functions)
  const cart = JSON.parse(localStorage.getItem('cart') || '{"items":[]}');
  
  // Check if already in cart
  const existingItem = cart.items.find((i: any) => i.product.id === productId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.items.push({
      product: item.product,
      quantity: 1
    });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  window.dispatchEvent(new Event('cart-updated'));
  
  // Remove from wishlist
  removeFromWishlist(productId, userId);
  
  return { success: true, removed: true };
}

/**
 * Move all wishlist items to cart
 */
export function moveAllWishlistToCart(userId?: string): number {
  const wishlist = getWishlist(userId);
  let movedCount = 0;
  
  wishlist.items.forEach(item => {
    if (item.product.stock > 0) {
      const result = moveWishlistToCart(item.productId, userId);
      if (result.success) {
        movedCount++;
      }
    }
  });
  
  return movedCount;
}

/**
 * Share wishlist - generate shareable link
 */
export function shareWishlist(userId?: string): WishlistShare {
  const wishlist = getWishlist(userId);
  
  const shareId = `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const share: WishlistShare = {
    id: shareId,
    wishlistItems: wishlist.items,
    sharedBy: userId,
    shareUrl: `${window.location.origin}/wishlist/shared/${shareId}`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    createdAt: new Date().toISOString()
  };
  
  // Save shared wishlist
  localStorage.setItem(`wishlist_share_${shareId}`, JSON.stringify(share));
  
  return share;
}

/**
 * Get shared wishlist by ID
 */
export function getSharedWishlist(shareId: string): WishlistShare | null {
  const stored = localStorage.getItem(`wishlist_share_${shareId}`);
  
  if (!stored) return null;
  
  const share: WishlistShare = JSON.parse(stored);
  
  // Check if expired
  if (share.expiresAt && new Date() > new Date(share.expiresAt)) {
    localStorage.removeItem(`wishlist_share_${shareId}`);
    return null;
  }
  
  return share;
}

/**
 * Import shared wishlist to own wishlist
 */
export function importSharedWishlist(shareId: string, userId?: string): number {
  const shared = getSharedWishlist(shareId);
  
  if (!shared) return 0;
  
  const wishlist = getWishlist(userId);
  let importedCount = 0;
  
  shared.wishlistItems.forEach(sharedItem => {
    // Check if not already in wishlist
    if (!wishlist.items.some(item => item.productId === sharedItem.productId)) {
      wishlist.items.push({
        ...sharedItem,
        addedAt: new Date().toISOString()
      });
      importedCount++;
    }
  });
  
  if (importedCount > 0) {
    saveWishlist(wishlist);
  }
  
  return importedCount;
}

/**
 * Migrate guest wishlist to user account
 */
export function migrateGuestWishlist(userId: string): number {
  const guestWishlist = getWishlist(); // Get guest wishlist
  const userWishlist = getWishlist(userId); // Get user wishlist
  
  let migratedCount = 0;
  
  guestWishlist.items.forEach(guestItem => {
    // Add if not already in user wishlist
    if (!userWishlist.items.some(item => item.productId === guestItem.productId)) {
      userWishlist.items.push(guestItem);
      migratedCount++;
    }
  });
  
  if (migratedCount > 0) {
    userWishlist.userId = userId;
    saveWishlist(userWishlist);
  }
  
  // Clear guest wishlist
  clearWishlist();
  
  return migratedCount;
}

/**
 * Get price drop alerts
 */
export function getPriceDropAlerts(userId?: string): WishlistStats['priceDrops'] {
  const stats = getWishlistStats(userId);
  return stats.priceDrops.filter(drop => drop.item.notifyOnPriceDrop);
}

/**
 * Get back in stock alerts
 */
export function getBackInStockAlerts(userId?: string): WishlistItem[] {
  const wishlist = getWishlist(userId);
  
  return wishlist.items.filter(item => 
    item.notifyOnBackInStock && 
    item.product.stock > 0 && 
    // Check if it was out of stock before (this is simplified)
    true
  );
}

/**
 * Sort wishlist items
 */
export function sortWishlist(
  sortBy: 'dateAdded' | 'price-low' | 'price-high' | 'name' | 'discount',
  userId?: string
): WishlistItem[] {
  const wishlist = getWishlist(userId);
  const items = [...wishlist.items];
  
  switch (sortBy) {
    case 'dateAdded':
      return items.sort((a, b) => 
        new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      );
    
    case 'price-low':
      return items.sort((a, b) => a.product.price - b.product.price);
    
    case 'price-high':
      return items.sort((a, b) => b.product.price - a.product.price);
    
    case 'name':
      return items.sort((a, b) => 
        a.product.name.localeCompare(b.product.name)
      );
    
    case 'discount':
      return items.sort((a, b) => {
        const discountA = a.product.discount || 0;
        const discountB = b.product.discount || 0;
        return discountB - discountA;
      });
    
    default:
      return items;
  }
}

/**
 * Filter wishlist items
 */
export function filterWishlist(
  filters: {
    category?: string;
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    onSale?: boolean;
  },
  userId?: string
): WishlistItem[] {
  const wishlist = getWishlist(userId);
  let items = [...wishlist.items];
  
  if (filters.category) {
    items = items.filter(item => item.product.category === filters.category);
  }
  
  if (filters.priceMin !== undefined) {
    items = items.filter(item => item.product.price >= filters.priceMin!);
  }
  
  if (filters.priceMax !== undefined) {
    items = items.filter(item => item.product.price <= filters.priceMax!);
  }
  
  if (filters.inStock) {
    items = items.filter(item => item.product.stock > 0);
  }
  
  if (filters.onSale) {
    items = items.filter(item => item.product.discount && item.product.discount > 0);
  }
  
  return items;
}

/**
 * Search wishlist
 */
export function searchWishlist(query: string, userId?: string): WishlistItem[] {
  const wishlist = getWishlist(userId);
  const lowerQuery = query.toLowerCase();
  
  return wishlist.items.filter(item => 
    item.product.name.toLowerCase().includes(lowerQuery) ||
    item.product.description?.toLowerCase().includes(lowerQuery) ||
    item.product.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Export wishlist as JSON
 */
export function exportWishlist(userId?: string): string {
  const wishlist = getWishlist(userId);
  return JSON.stringify(wishlist, null, 2);
}

/**
 * Import wishlist from JSON
 */
export function importWishlist(jsonData: string, userId?: string): boolean {
  try {
    const imported: Wishlist = JSON.parse(jsonData);
    
    if (!imported.items || !Array.isArray(imported.items)) {
      return false;
    }
    
    imported.userId = userId;
    imported.updatedAt = new Date().toISOString();
    
    saveWishlist(imported);
    return true;
  } catch (error) {
    console.error('Failed to import wishlist:', error);
    return false;
  }
}
