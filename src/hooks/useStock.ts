import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

interface StockStats {
  totalProducts: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  totalValue: number;
}

export function useStock(vendorId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<StockStats>({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    totalValue: 0
  });

  const loadProducts = useCallback(() => {
    try {
      const stored = localStorage.getItem('products');
      if (!stored) {
        setProducts([]);
        return;
      }

      let allProducts: Product[] = JSON.parse(stored);

      // Filter by vendor if vendorId provided
      if (vendorId) {
        allProducts = allProducts.filter(p => p.vendorId === vendorId);
      }

      setProducts(allProducts);
      calculateStats(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  }, [vendorId]);

  const calculateStats = (products: Product[]) => {
    const stats: StockStats = {
      totalProducts: products.length,
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      totalValue: 0
    };

    products.forEach(product => {
      const stock = product.stock ?? 0;
      const threshold = product.lowStockThreshold ?? 10;

      if (stock <= 0) {
        stats.outOfStock++;
      } else if (stock <= threshold) {
        stats.lowStock++;
      } else {
        stats.inStock++;
      }

      stats.totalValue += (product.price * stock);
    });

    setStats(stats);
  };

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateStock = useCallback((productId: string, newStock: number) => {
    try {
      const stored = localStorage.getItem('products');
      if (!stored) return false;

      const allProducts: Product[] = JSON.parse(stored);
      const productIndex = allProducts.findIndex(p => p.id === productId);

      if (productIndex === -1) return false;

      allProducts[productIndex].stock = Math.max(0, newStock);
      allProducts[productIndex].updatedAt = new Date().toISOString();

      localStorage.setItem('products', JSON.stringify(allProducts));
      loadProducts();
      return true;
    } catch (error) {
      console.error('Error updating stock:', error);
      return false;
    }
  }, [loadProducts]);

  const increaseStock = useCallback((productId: string, amount: number) => {
    try {
      const stored = localStorage.getItem('products');
      if (!stored) return false;

      const allProducts: Product[] = JSON.parse(stored);
      const productIndex = allProducts.findIndex(p => p.id === productId);

      if (productIndex === -1) return false;

      const currentStock = allProducts[productIndex].stock ?? 0;
      allProducts[productIndex].stock = currentStock + amount;
      allProducts[productIndex].updatedAt = new Date().toISOString();

      localStorage.setItem('products', JSON.stringify(allProducts));
      loadProducts();
      return true;
    } catch (error) {
      console.error('Error increasing stock:', error);
      return false;
    }
  }, [loadProducts]);

  const decreaseStock = useCallback((productId: string, amount: number) => {
    try {
      const stored = localStorage.getItem('products');
      if (!stored) return false;

      const allProducts: Product[] = JSON.parse(stored);
      const productIndex = allProducts.findIndex(p => p.id === productId);

      if (productIndex === -1) return false;

      const currentStock = allProducts[productIndex].stock ?? 0;
      allProducts[productIndex].stock = Math.max(0, currentStock - amount);
      allProducts[productIndex].updatedAt = new Date().toISOString();

      localStorage.setItem('products', JSON.stringify(allProducts));
      loadProducts();
      return true;
    } catch (error) {
      console.error('Error decreasing stock:', error);
      return false;
    }
  }, [loadProducts]);

  const setLowStockThreshold = useCallback((productId: string, threshold: number) => {
    try {
      const stored = localStorage.getItem('products');
      if (!stored) return false;

      const allProducts: Product[] = JSON.parse(stored);
      const productIndex = allProducts.findIndex(p => p.id === productId);

      if (productIndex === -1) return false;

      allProducts[productIndex].lowStockThreshold = Math.max(0, threshold);
      allProducts[productIndex].updatedAt = new Date().toISOString();

      localStorage.setItem('products', JSON.stringify(allProducts));
      loadProducts();
      return true;
    } catch (error) {
      console.error('Error setting threshold:', error);
      return false;
    }
  }, [loadProducts]);

  const getLowStockProducts = useCallback(() => {
    return products.filter(p => {
      const stock = p.stock ?? 0;
      const threshold = p.lowStockThreshold ?? 10;
      return stock > 0 && stock <= threshold;
    });
  }, [products]);

  const getOutOfStockProducts = useCallback(() => {
    return products.filter(p => (p.stock ?? 0) <= 0);
  }, [products]);

  const checkAvailability = useCallback((productId: string, quantity: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return false;
    
    const stock = product.stock ?? 0;
    return stock >= quantity;
  }, [products]);

  const bulkUpdateStock = useCallback((updates: Array<{ productId: string; stock: number }>) => {
    try {
      const stored = localStorage.getItem('products');
      if (!stored) return false;

      const allProducts: Product[] = JSON.parse(stored);
      let updated = false;

      updates.forEach(update => {
        const productIndex = allProducts.findIndex(p => p.id === update.productId);
        if (productIndex !== -1) {
          allProducts[productIndex].stock = Math.max(0, update.stock);
          allProducts[productIndex].updatedAt = new Date().toISOString();
          updated = true;
        }
      });

      if (updated) {
        localStorage.setItem('products', JSON.stringify(allProducts));
        loadProducts();
      }

      return updated;
    } catch (error) {
      console.error('Error bulk updating stock:', error);
      return false;
    }
  }, [loadProducts]);

  return {
    products,
    stats,
    updateStock,
    increaseStock,
    decreaseStock,
    setLowStockThreshold,
    getLowStockProducts,
    getOutOfStockProducts,
    checkAvailability,
    bulkUpdateStock,
    reload: loadProducts
  };
}

// Hook for checking stock before cart operations
export function useStockCheck() {
  const checkStock = useCallback((productId: string, quantity: number): {
    available: boolean;
    stock: number;
    message: string;
  } => {
    try {
      const stored = localStorage.getItem('products');
      if (!stored) {
        return { available: false, stock: 0, message: 'Mahsulot topilmadi' };
      }

      const products: Product[] = JSON.parse(stored);
      const product = products.find(p => p.id === productId);

      if (!product) {
        return { available: false, stock: 0, message: 'Mahsulot topilmadi' };
      }

      const stock = product.stock ?? Infinity;

      if (stock === Infinity || stock === undefined) {
        return { available: true, stock: Infinity, message: '' };
      }

      if (stock <= 0) {
        return { available: false, stock: 0, message: 'Mahsulot tugagan' };
      }

      if (stock < quantity) {
        return { 
          available: false, 
          stock, 
          message: `Faqat ${stock} ta mavjud` 
        };
      }

      return { available: true, stock, message: '' };
    } catch (error) {
      console.error('Error checking stock:', error);
      return { available: false, stock: 0, message: 'Xatolik yuz berdi' };
    }
  }, []);

  const checkCartStock = useCallback((cartItems: Array<{ product: Product; quantity: number }>): {
    valid: boolean;
    errors: Array<{ productId: string; productName: string; message: string }>;
  } => {
    const errors: Array<{ productId: string; productName: string; message: string }> = [];

    cartItems.forEach(item => {
      const result = checkStock(item.product.id, item.quantity);
      if (!result.available) {
        errors.push({
          productId: item.product.id,
          productName: item.product.name,
          message: result.message
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }, [checkStock]);

  return {
    checkStock,
    checkCartStock
  };
}
