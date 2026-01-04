import { useState, useEffect } from 'react';
import { Product } from '../types';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 20; // Maximum number of recently viewed items

interface RecentlyViewedItem {
  productId: string;
  viewedAt: string;
}

export function useRecentlyViewed() {
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);

  // Load recently viewed products
  useEffect(() => {
    loadRecentlyViewed();
  }, []);

  const loadRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setRecentlyViewed([]);
        return;
      }

      const items: RecentlyViewedItem[] = JSON.parse(stored);
      
      // Load full product data from products storage
      const productsStored = localStorage.getItem('products');
      if (!productsStored) {
        setRecentlyViewed([]);
        return;
      }

      const allProducts: Product[] = JSON.parse(productsStored);
      
      // Map product IDs to full product data
      const products = items
        .map(item => {
          const product = allProducts.find(p => p.id === item.productId);
          return product;
        })
        .filter((p): p is Product => p !== undefined);

      setRecentlyViewed(products);
    } catch (error) {
      console.error('Error loading recently viewed:', error);
      setRecentlyViewed([]);
    }
  };

  const addToRecentlyViewed = (product: Product) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let items: RecentlyViewedItem[] = stored ? JSON.parse(stored) : [];

      // Remove if already exists (to move to top)
      items = items.filter(item => item.productId !== product.id);

      // Add to beginning
      items.unshift({
        productId: product.id,
        viewedAt: new Date().toISOString()
      });

      // Keep only MAX_ITEMS
      if (items.length > MAX_ITEMS) {
        items = items.slice(0, MAX_ITEMS);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      loadRecentlyViewed();
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  };

  const clearRecentlyViewed = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  };

  const removeFromRecentlyViewed = (productId: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;

      let items: RecentlyViewedItem[] = JSON.parse(stored);
      items = items.filter(item => item.productId !== productId);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      loadRecentlyViewed();
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
    }
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    clearRecentlyViewed,
    removeFromRecentlyViewed
  };
}
