// Product Analytics Types

export interface ProductView {
  productId: string;
  viewedAt: string; // ISO date
  userId?: string; // Optional user ID
  sessionId: string; // Browser session ID
  referrer?: string; // Where user came from
  duration?: number; // How long viewed (seconds)
}

export interface ProductAnalytics {
  productId: string;
  productName: string;
  
  // View Analytics
  totalViews: number;
  uniqueViews: number; // Unique sessions
  viewsToday: number;
  viewsThisWeek: number;
  viewsThisMonth: number;
  
  // Sales Analytics
  totalSales: number; // Total quantity sold
  revenue: number; // Total revenue
  salesToday: number;
  salesThisWeek: number;
  salesThisMonth: number;
  
  // Conversion
  conversionRate: number; // (sales / views) * 100
  averageOrderValue: number; // revenue / totalSales
  
  // Engagement
  averageViewDuration: number; // seconds
  addToCartCount: number;
  addToWishlistCount: number;
  
  // Performance
  rating: number;
  reviewsCount: number;
  
  // Timestamps
  lastViewedAt?: string;
  lastSoldAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsEvent {
  id: string;
  type: 'view' | 'add_to_cart' | 'purchase' | 'wishlist' | 'search' | 'share';
  productId?: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface TrendingProduct {
  productId: string;
  productName: string;
  trendScore: number; // Weighted score
  viewsGrowth: number; // % growth from previous period
  salesGrowth: number; // % growth from previous period
  rank: number;
}

export interface AnalyticsSummary {
  totalProducts: number;
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  
  // Top Performers
  topViewedProducts: { productId: string; views: number; name: string }[];
  topSellingProducts: { productId: string; sales: number; name: string }[];
  topRevenueProducts: { productId: string; revenue: number; name: string }[];
  trendingProducts: TrendingProduct[];
  
  // Time-based
  viewsTrend: { date: string; count: number }[]; // Last 7 days
  salesTrend: { date: string; count: number }[]; // Last 7 days
  revenueTrend: { date: string; amount: number }[]; // Last 7 days
  
  // Categories
  topCategories: { category: string; views: number; sales: number }[];
  
  // Conversion
  averageConversionRate: number;
  
  period: {
    from: string;
    to: string;
  };
}

// Helper functions
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}

export function trackProductView(productId: string, userId?: string): void {
  const view: ProductView = {
    productId,
    viewedAt: new Date().toISOString(),
    userId,
    sessionId: getSessionId(),
    referrer: document.referrer
  };
  
  // Save to localStorage
  const views = JSON.parse(localStorage.getItem('product_views') || '[]');
  views.push(view);
  
  // Keep only last 1000 views to prevent storage overflow
  if (views.length > 1000) {
    views.shift();
  }
  
  localStorage.setItem('product_views', JSON.stringify(views));
  
  // Update product analytics
  updateProductAnalytics(productId);
}

export function trackAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'sessionId'>): void {
  const analyticsEvent: AnalyticsEvent = {
    ...event,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    sessionId: getSessionId(),
    timestamp: new Date().toISOString()
  };
  
  const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
  events.push(analyticsEvent);
  
  // Keep only last 500 events
  if (events.length > 500) {
    events.shift();
  }
  
  localStorage.setItem('analytics_events', JSON.stringify(events));
}

export function updateProductAnalytics(productId: string): void {
  const analytics = getProductAnalytics(productId);
  const allAnalytics = JSON.parse(localStorage.getItem('product_analytics') || '{}');
  allAnalytics[productId] = analytics;
  localStorage.setItem('product_analytics', JSON.stringify(allAnalytics));
}

export function getProductAnalytics(productId: string): ProductAnalytics {
  // Get all views for this product
  const allViews: ProductView[] = JSON.parse(localStorage.getItem('product_views') || '[]');
  const productViews = allViews.filter(v => v.productId === productId);
  
  // Get all events for this product
  const allEvents: AnalyticsEvent[] = JSON.parse(localStorage.getItem('analytics_events') || '[]');
  const productEvents = allEvents.filter(e => e.productId === productId);
  
  // Get product data
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  const product = products.find((p: any) => p.id === productId);
  
  // Calculate time periods
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  // Count unique sessions
  const uniqueSessions = new Set(productViews.map(v => v.sessionId));
  
  // Count views by period
  const viewsToday = productViews.filter(v => new Date(v.viewedAt) >= todayStart).length;
  const viewsThisWeek = productViews.filter(v => new Date(v.viewedAt) >= weekStart).length;
  const viewsThisMonth = productViews.filter(v => new Date(v.viewedAt) >= monthStart).length;
  
  // Get sales data from orders
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');
  let totalSales = 0;
  let revenue = 0;
  let salesToday = 0;
  let salesThisWeek = 0;
  let salesThisMonth = 0;
  let lastSoldAt: string | undefined;
  
  orders.forEach((order: any) => {
    order.items?.forEach((item: any) => {
      if (item.product?.id === productId) {
        const quantity = item.quantity || 0;
        const price = item.product?.price || 0;
        const orderDate = new Date(order.date);
        
        totalSales += quantity;
        revenue += quantity * price;
        
        if (orderDate >= todayStart) salesToday += quantity;
        if (orderDate >= weekStart) salesThisWeek += quantity;
        if (orderDate >= monthStart) salesThisMonth += quantity;
        
        if (!lastSoldAt || orderDate > new Date(lastSoldAt)) {
          lastSoldAt = order.date;
        }
      }
    });
  });
  
  // Count add to cart events
  const addToCartCount = productEvents.filter(e => e.type === 'add_to_cart').length;
  const addToWishlistCount = productEvents.filter(e => e.type === 'wishlist').length;
  
  // Calculate conversion rate
  const conversionRate = productViews.length > 0 ? (totalSales / productViews.length) * 100 : 0;
  const averageOrderValue = totalSales > 0 ? revenue / totalSales : 0;
  
  // Get last viewed
  const lastViewedAt = productViews.length > 0 
    ? productViews[productViews.length - 1].viewedAt 
    : undefined;
  
  return {
    productId,
    productName: product?.name || 'Unknown Product',
    totalViews: productViews.length,
    uniqueViews: uniqueSessions.size,
    viewsToday,
    viewsThisWeek,
    viewsThisMonth,
    totalSales,
    revenue,
    salesToday,
    salesThisWeek,
    salesThisMonth,
    conversionRate,
    averageOrderValue,
    averageViewDuration: 0, // TODO: Implement duration tracking
    addToCartCount,
    addToWishlistCount,
    rating: product?.rating || 0,
    reviewsCount: product?.reviewsCount || 0,
    lastViewedAt,
    lastSoldAt,
    createdAt: product?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export function getAllProductsAnalytics(): ProductAnalytics[] {
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  return products.map((p: any) => getProductAnalytics(p.id));
}

export function getTopViewedProducts(limit: number = 10): ProductAnalytics[] {
  const allAnalytics = getAllProductsAnalytics();
  return allAnalytics
    .sort((a, b) => b.totalViews - a.totalViews)
    .slice(0, limit);
}

export function getTopSellingProducts(limit: number = 10): ProductAnalytics[] {
  const allAnalytics = getAllProductsAnalytics();
  return allAnalytics
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);
}

export function getTopRevenueProducts(limit: number = 10): ProductAnalytics[] {
  const allAnalytics = getAllProductsAnalytics();
  return allAnalytics
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function getTrendingProducts(limit: number = 10): TrendingProduct[] {
  const allAnalytics = getAllProductsAnalytics();
  
  return allAnalytics
    .map(analytics => {
      // Calculate trend score based on recent activity
      const viewsWeight = analytics.viewsThisWeek * 1.5;
      const salesWeight = analytics.salesThisWeek * 3;
      const ratingWeight = analytics.rating * 10;
      const conversionWeight = analytics.conversionRate * 2;
      
      const trendScore = viewsWeight + salesWeight + ratingWeight + conversionWeight;
      
      // Calculate growth (simplified - compare this week vs last week)
      const viewsGrowth = analytics.viewsThisWeek > 0 ? 50 : 0; // Simplified
      const salesGrowth = analytics.salesThisWeek > 0 ? 50 : 0; // Simplified
      
      return {
        productId: analytics.productId,
        productName: analytics.productName,
        trendScore,
        viewsGrowth,
        salesGrowth,
        rank: 0 // Will be set after sorting
      };
    })
    .sort((a, b) => b.trendScore - a.trendScore)
    .slice(0, limit)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

export function getAnalyticsSummary(periodDays: number = 30): AnalyticsSummary {
  const allAnalytics = getAllProductsAnalytics();
  const products = JSON.parse(localStorage.getItem('products') || '[]');
  
  // Calculate totals
  const totalProducts = products.length;
  const totalViews = allAnalytics.reduce((sum, a) => sum + a.totalViews, 0);
  const totalSales = allAnalytics.reduce((sum, a) => sum + a.totalSales, 0);
  const totalRevenue = allAnalytics.reduce((sum, a) => sum + a.revenue, 0);
  
  // Get top performers
  const topViewedProducts = getTopViewedProducts(5).map(a => ({
    productId: a.productId,
    views: a.totalViews,
    name: a.productName
  }));
  
  const topSellingProducts = getTopSellingProducts(5).map(a => ({
    productId: a.productId,
    sales: a.totalSales,
    name: a.productName
  }));
  
  const topRevenueProducts = getTopRevenueProducts(5).map(a => ({
    productId: a.productId,
    revenue: a.revenue,
    name: a.productName
  }));
  
  const trendingProducts = getTrendingProducts(5);
  
  // Calculate average conversion rate
  const averageConversionRate = allAnalytics.length > 0
    ? allAnalytics.reduce((sum, a) => sum + a.conversionRate, 0) / allAnalytics.length
    : 0;
  
  // Get category stats
  const categoryStats = new Map<string, { views: number; sales: number }>();
  allAnalytics.forEach(a => {
    const product = products.find((p: any) => p.id === a.productId);
    if (product) {
      const category = product.category;
      const existing = categoryStats.get(category) || { views: 0, sales: 0 };
      categoryStats.set(category, {
        views: existing.views + a.totalViews,
        sales: existing.sales + a.totalSales
      });
    }
  });
  
  const topCategories = Array.from(categoryStats.entries())
    .map(([category, stats]) => ({ category, ...stats }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);
  
  // Generate trends (last 7 days)
  const viewsTrend: { date: string; count: number }[] = [];
  const salesTrend: { date: string; count: number }[] = [];
  const revenueTrend: { date: string; amount: number }[] = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    viewsTrend.push({ date: dateStr, count: Math.floor(Math.random() * 100) }); // TODO: Real data
    salesTrend.push({ date: dateStr, count: Math.floor(Math.random() * 20) }); // TODO: Real data
    revenueTrend.push({ date: dateStr, amount: Math.floor(Math.random() * 100000) }); // TODO: Real data
  }
  
  const now = new Date();
  const periodStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
  
  return {
    totalProducts,
    totalViews,
    totalSales,
    totalRevenue,
    topViewedProducts,
    topSellingProducts,
    topRevenueProducts,
    trendingProducts,
    viewsTrend,
    salesTrend,
    revenueTrend,
    topCategories,
    averageConversionRate,
    period: {
      from: periodStart.toISOString(),
      to: now.toISOString()
    }
  };
}
