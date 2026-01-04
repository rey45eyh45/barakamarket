import { useState, useEffect, useCallback } from 'react';
import { FlashSale, FlashSaleProduct, FlashSaleTimer } from '../types/flashSale';
import { Product } from '../types';

const STORAGE_KEY = 'flash_sales';
const USER_PURCHASES_KEY = 'flash_sale_user_purchases';

export function useFlashSale() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([]);
  const [activeFlashSale, setActiveFlashSale] = useState<FlashSale | null>(null);

  const loadFlashSales = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        setFlashSales([]);
        return;
      }

      const sales: FlashSale[] = JSON.parse(stored);
      setFlashSales(sales);

      // Find active flash sale
      const now = new Date();
      const active = sales.find(sale => {
        const start = new Date(sale.startTime);
        const end = new Date(sale.endTime);
        return sale.isActive && now >= start && now <= end;
      });

      setActiveFlashSale(active || null);
    } catch (error) {
      console.error('Error loading flash sales:', error);
      setFlashSales([]);
      setActiveFlashSale(null);
    }
  }, []);

  useEffect(() => {
    loadFlashSales();

    // Smart refresh interval:
    // - Check every 10 seconds for expired/new sales
    // - Timer updates happen separately in useFlashSaleTimer (every 1s)
    const interval = setInterval(loadFlashSales, 10000);
    return () => clearInterval(interval);
  }, [loadFlashSales]);

  const createFlashSale = useCallback((sale: Omit<FlashSale, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSale: FlashSale = {
        ...sale,
        id: `flash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        products: sale.products.map(p => ({ ...p, soldCount: 0 }))
      };

      const stored = localStorage.getItem(STORAGE_KEY);
      const sales: FlashSale[] = stored ? JSON.parse(stored) : [];
      sales.push(newSale);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
      loadFlashSales();

      return { success: true, flashSale: newSale };
    } catch (error) {
      console.error('Error creating flash sale:', error);
      return { success: false, error: 'Xatolik yuz berdi' };
    }
  }, [loadFlashSales]);

  const updateFlashSale = useCallback((id: string, updates: Partial<FlashSale>) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { success: false };

      const sales: FlashSale[] = JSON.parse(stored);
      const index = sales.findIndex(s => s.id === id);

      if (index === -1) return { success: false };

      sales[index] = {
        ...sales[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
      loadFlashSales();

      return { success: true };
    } catch (error) {
      console.error('Error updating flash sale:', error);
      return { success: false };
    }
  }, [loadFlashSales]);

  const deleteFlashSale = useCallback((id: string) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return { success: false };

      const sales: FlashSale[] = JSON.parse(stored);
      const filtered = sales.filter(s => s.id !== id);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      loadFlashSales();

      return { success: true };
    } catch (error) {
      console.error('Error deleting flash sale:', error);
      return { success: false };
    }
  }, [loadFlashSales]);

  const getFlashSaleProduct = useCallback((productId: string): FlashSaleProduct | null => {
    if (!activeFlashSale) return null;
    return activeFlashSale.products.find(p => p.productId === productId) || null;
  }, [activeFlashSale]);

  const canUserPurchase = useCallback((userId: string, productId: string, quantity: number): boolean => {
    if (!activeFlashSale) return false;

    const product = getFlashSaleProduct(productId);
    if (!product) return false;

    // Check stock limit
    const remaining = product.stockLimit - product.soldCount;
    if (remaining < quantity) return false;

    // Check user purchase limit
    try {
      const stored = localStorage.getItem(USER_PURCHASES_KEY);
      const purchases: Record<string, Record<string, number>> = stored ? JSON.parse(stored) : {};
      
      const userPurchases = purchases[userId] || {};
      const userPurchaseCount = userPurchases[productId] || 0;

      return (userPurchaseCount + quantity) <= product.maxPerUser;
    } catch (error) {
      console.error('Error checking user purchases:', error);
      return false;
    }
  }, [activeFlashSale, getFlashSaleProduct]);

  const recordPurchase = useCallback((userId: string, productId: string, quantity: number) => {
    try {
      // Update sold count
      if (activeFlashSale) {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;

        const sales: FlashSale[] = JSON.parse(stored);
        const saleIndex = sales.findIndex(s => s.id === activeFlashSale.id);
        
        if (saleIndex !== -1) {
          const productIndex = sales[saleIndex].products.findIndex(p => p.productId === productId);
          if (productIndex !== -1) {
            sales[saleIndex].products[productIndex].soldCount += quantity;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
          }
        }
      }

      // Update user purchases
      const stored = localStorage.getItem(USER_PURCHASES_KEY);
      const purchases: Record<string, Record<string, number>> = stored ? JSON.parse(stored) : {};
      
      if (!purchases[userId]) {
        purchases[userId] = {};
      }
      
      purchases[userId][productId] = (purchases[userId][productId] || 0) + quantity;
      localStorage.setItem(USER_PURCHASES_KEY, JSON.stringify(purchases));

      loadFlashSales();
    } catch (error) {
      console.error('Error recording purchase:', error);
    }
  }, [activeFlashSale, loadFlashSales]);

  return {
    flashSales,
    activeFlashSale,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    getFlashSaleProduct,
    canUserPurchase,
    recordPurchase,
    reload: loadFlashSales
  };
}

// Hook for flash sale countdown timer
export function useFlashSaleTimer(endTime: string): FlashSaleTimer {
  const calculateTimeLeft = useCallback(() => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isExpired: true
      };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return {
      days,
      hours,
      minutes,
      seconds,
      isExpired: false
    };
  }, [endTime]);

  const [timer, setTimer] = useState<FlashSaleTimer>(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft]);

  return timer;
}

// Hook to get flash sale products with full product data
export function useFlashSaleProducts() {
  const { activeFlashSale } = useFlashSale();
  const [products, setProducts] = useState<Array<Product & { flashSaleData: FlashSaleProduct }>>([]);

  // Reload products when activeFlashSale changes
  const loadProducts = useCallback(() => {
    if (!activeFlashSale) {
      setProducts([]);
      return;
    }

    try {
      const productsStored = localStorage.getItem('all_products');
      if (!productsStored) {
        setProducts([]);
        return;
      }

      const allProducts: Product[] = JSON.parse(productsStored);
      
      const flashProducts = activeFlashSale.products
        .map(flashProduct => {
          const product = allProducts.find(p => p.id === flashProduct.productId);
          if (!product) return null;

          return {
            ...product,
            flashSaleData: flashProduct
          };
        })
        .filter((p): p is Product & { flashSaleData: FlashSaleProduct } => p !== null);

      setProducts(flashProducts);
    } catch (error) {
      console.error('Error loading flash sale products:', error);
      setProducts([]);
    }
  }, [activeFlashSale]);

  useEffect(() => {
    loadProducts();
    
    // Refresh products every 5 seconds to update sold counts
    const interval = setInterval(loadProducts, 5000);
    return () => clearInterval(interval);
  }, [loadProducts]);

  return products;
}