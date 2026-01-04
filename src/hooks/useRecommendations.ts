import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

export type RecommendationType = 
  | 'related'           // Similar products (same category)
  | 'frequently-bought' // Frequently bought together
  | 'recently-viewed'   // Based on browsing history
  | 'trending'          // Popular/trending items
  | 'personalized';     // AI-based recommendations

interface RecommendationOptions {
  productId?: string;
  userId?: string;
  category?: string;
  limit?: number;
  excludeIds?: string[];
}

export function useRecommendations(
  type: RecommendationType,
  options: RecommendationOptions = {}
) {
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    productId,
    userId,
    category,
    limit = 8,
    excludeIds = []
  } = options;

  const generateRecommendations = useCallback(() => {
    setIsLoading(true);

    try {
      // Read from 'all_products' instead of 'products'
      const productsStored = localStorage.getItem('all_products');
      if (!productsStored) {
        setRecommendations([]);
        setIsLoading(false);
        return;
      }

      let allProducts: Product[] = JSON.parse(productsStored);

      // Filter out excluded products
      allProducts = allProducts.filter(p => !excludeIds.includes(p.id));

      let filtered: Product[] = [];

      switch (type) {
        case 'related':
          filtered = getRelatedProducts(allProducts, productId, category);
          break;

        case 'frequently-bought':
          filtered = getFrequentlyBoughtTogether(allProducts, productId);
          break;

        case 'recently-viewed':
          filtered = getRecentlyViewedRecommendations(allProducts, userId);
          break;

        case 'trending':
          filtered = getTrendingProducts(allProducts);
          break;

        case 'personalized':
          filtered = getPersonalizedRecommendations(allProducts, userId);
          break;

        default:
          filtered = allProducts;
      }

      // Shuffle and limit
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      setRecommendations(shuffled.slice(0, limit));
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecommendations([]);
    } finally {
      setIsLoading(false);
    }
  }, [type, productId, userId, category, limit, excludeIds]);

  useEffect(() => {
    generateRecommendations();
    
    // Refresh recommendations every 30 seconds to pick up new products
    const interval = setInterval(generateRecommendations, 30000);
    return () => clearInterval(interval);
  }, [generateRecommendations]);

  return {
    recommendations,
    isLoading,
    reload: generateRecommendations
  };
}

// Related products (same category)
function getRelatedProducts(
  products: Product[],
  productId?: string,
  category?: string
): Product[] {
  if (!productId && !category) {
    return products;
  }

  if (productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
      category = product.category;
    }
  }

  return products.filter(p => 
    p.category === category && p.id !== productId
  );
}

// Frequently bought together (based on order history)
function getFrequentlyBoughtTogether(
  products: Product[],
  productId?: string
): Product[] {
  if (!productId) return products;

  try {
    const ordersStored = localStorage.getItem('orders');
    if (!ordersStored) return products;

    const orders = JSON.parse(ordersStored);
    
    // Find orders containing the target product
    const relevantOrders = orders.filter((order: any) =>
      order.items?.some((item: any) => item.product.id === productId)
    );

    // Count frequency of other products in those orders
    const frequency: Record<string, number> = {};
    
    relevantOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        if (item.product.id !== productId) {
          frequency[item.product.id] = (frequency[item.product.id] || 0) + 1;
        }
      });
    });

    // Sort by frequency
    const sortedIds = Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .map(([id]) => id);

    // Return products in frequency order
    return sortedIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined);
  } catch (error) {
    console.error('Error getting frequently bought together:', error);
    return products;
  }
}

// Based on recently viewed history
function getRecentlyViewedRecommendations(
  products: Product[],
  userId?: string
): Product[] {
  try {
    const recentlyViewedStored = localStorage.getItem('recently_viewed_products');
    if (!recentlyViewedStored) return products;

    const recentlyViewed = JSON.parse(recentlyViewedStored);
    
    // Get categories of recently viewed products
    const viewedCategories = new Set<string>();
    recentlyViewed.forEach((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (product?.category) {
        viewedCategories.add(product.category);
      }
    });

    // Recommend products from those categories
    return products.filter(p => 
      p.category && viewedCategories.has(p.category) &&
      !recentlyViewed.some((rv: any) => rv.productId === p.id)
    );
  } catch (error) {
    console.error('Error getting recently viewed recommendations:', error);
    return products;
  }
}

// Trending/popular products
function getTrendingProducts(products: Product[]): Product[] {
  return products
    .filter(p => (p.soldCount || 0) > 0 || (p.views || 0) > 0)
    .sort((a, b) => {
      const scoreA = (a.soldCount || 0) * 2 + (a.views || 0) + (a.rating || 0) * 10;
      const scoreB = (b.soldCount || 0) * 2 + (b.views || 0) + (b.rating || 0) * 10;
      return scoreB - scoreA;
    });
}

// Personalized recommendations (based on user behavior)
function getPersonalizedRecommendations(
  products: Product[],
  userId?: string
): Product[] {
  if (!userId) return getTrendingProducts(products);

  try {
    // Get user's order history
    const ordersStored = localStorage.getItem('orders');
    const orders = ordersStored ? JSON.parse(ordersStored) : [];
    const userOrders = orders.filter((o: any) => o.userId === userId);

    // Get user's favorite categories
    const categoryFrequency: Record<string, number> = {};
    userOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const category = item.product.category;
        if (category) {
          categoryFrequency[category] = (categoryFrequency[category] || 0) + 1;
        }
      });
    });

    // Get user's favorite brands
    const brandFrequency: Record<string, number> = {};
    userOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const brand = item.product.brand;
        if (brand) {
          brandFrequency[brand] = (brandFrequency[brand] || 0) + 1;
        }
      });
    });

    // Get purchased product IDs to exclude
    const purchasedIds = new Set<string>();
    userOrders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        purchasedIds.add(item.product.id);
      });
    });

    // Score products based on user preferences
    const scored = products
      .filter(p => !purchasedIds.has(p.id))
      .map(product => {
        let score = 0;

        // Category match
        if (product.category && categoryFrequency[product.category]) {
          score += categoryFrequency[product.category] * 3;
        }

        // Brand match
        if (product.brand && brandFrequency[product.brand]) {
          score += brandFrequency[product.brand] * 2;
        }

        // Popularity
        score += (product.soldCount || 0) * 0.5;
        score += (product.rating || 0) * 2;

        return { product, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.product);

    return scored.length > 0 ? scored : getTrendingProducts(products);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return getTrendingProducts(products);
  }
}

// Hook for "You May Also Like" on product page
export function useRelatedProducts(productId: string, limit: number = 4) {
  return useRecommendations('related', {
    productId,
    limit,
    excludeIds: [productId]
  });
}

// Hook for "Frequently Bought Together"
export function useFrequentlyBought(productId: string, limit: number = 3) {
  return useRecommendations('frequently-bought', {
    productId,
    limit,
    excludeIds: [productId]
  });
}

// Hook for homepage recommendations
export function useHomepageRecommendations(userId?: string, limit: number = 8) {
  return useRecommendations(userId ? 'personalized' : 'trending', {
    userId,
    limit
  });
}

// Hook for trending products
export function useTrendingProducts(limit: number = 8) {
  return useRecommendations('trending', { limit });
}