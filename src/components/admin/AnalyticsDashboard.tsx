import { useState, useEffect } from 'react';
import { TrendingUp, Eye, ShoppingCart, DollarSign, Package, Star, Award, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../../contexts/LanguageContext';
import { 
  getAnalyticsSummary, 
  getTopViewedProducts, 
  getTopSellingProducts, 
  getTrendingProducts,
  ProductAnalytics,
  TrendingProduct,
  AnalyticsSummary
} from '../../types/analytics';
import { Card, CardHeader, CardContent } from '../ui/card';

export function AnalyticsDashboard() {
  const { language } = useLanguage();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [topViewed, setTopViewed] = useState<ProductAnalytics[]>([]);
  const [topSelling, setTopSelling] = useState<ProductAnalytics[]>([]);
  const [trending, setTrending] = useState<TrendingProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    setIsLoading(true);
    
    try {
      const analyticsSummary = getAnalyticsSummary(30);
      setSummary(analyticsSummary);
      
      const topViewedData = getTopViewedProducts(5);
      setTopViewed(topViewedData);
      
      const topSellingData = getTopSellingProducts(5);
      setTopSelling(topSellingData);
      
      const trendingData = getTrendingProducts(5);
      setTrending(trendingData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('uz-UZ').format(Math.floor(num));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(Math.floor(price)) + ' so\'m';
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        {language === 'uz' 
          ? "Ma'lumot yuklanmadi" 
          : language === 'ru' 
          ? "Данные не загружены" 
          : "No data loaded"}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'uz' 
              ? "Analitika" 
              : language === 'ru' 
              ? "Аналитика" 
              : "Analytics"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'uz' 
              ? "Mahsulotlar va sotuvlar statistikasi" 
              : language === 'ru' 
              ? "Статистика товаров и продаж" 
              : "Products and sales statistics"}
          </p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <Activity className="w-5 h-5" />
          {language === 'uz' ? 'Yangilash' : language === 'ru' ? 'Обновить' : 'Refresh'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card variant="elevated">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {language === 'uz' ? 'Mahsulotlar' : language === 'ru' ? 'Товары' : 'Products'}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(summary.totalProducts)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Views */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card variant="elevated">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {language === 'uz' ? 'Ko\'rishlar' : language === 'ru' ? 'Просмотры' : 'Views'}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(summary.totalViews)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card variant="elevated">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {language === 'uz' ? 'Sotuvlar' : language === 'ru' ? 'Продажи' : 'Sales'}
                  </p>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatNumber(summary.totalSales)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card variant="elevated">
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">
                    {language === 'uz' ? 'Daromad' : language === 'ru' ? 'Доход' : 'Revenue'}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatPrice(summary.totalRevenue)}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Viewed Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-gray-900 dark:text-white font-semibold">
                  {language === 'uz' 
                    ? "Eng ko'p ko'rilgan" 
                    : language === 'ru' 
                    ? "Самые просматриваемые" 
                    : "Most Viewed"}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {topViewed.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {language === 'uz' ? "Ma'lumot yo'q" : language === 'ru' ? "Нет данных" : "No data"}
                </p>
              ) : (
                <div className="space-y-3">
                  {topViewed.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-400">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium line-clamp-1">
                            {product.productName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatNumber(product.uniqueViews)} {language === 'uz' ? 'noyob' : language === 'ru' ? 'уник.' : 'unique'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatNumber(product.totalViews)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'uz' ? 'ko\'rish' : language === 'ru' ? 'просм.' : 'views'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Selling Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-green-600 dark:text-green-400" />
                <h2 className="text-gray-900 dark:text-white font-semibold">
                  {language === 'uz' 
                    ? "Eng ko'p sotilgan" 
                    : language === 'ru' 
                    ? "Бестселлеры" 
                    : "Best Sellers"}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {topSelling.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {language === 'uz' ? "Ma'lumot yo'q" : language === 'ru' ? "Нет данных" : "No data"}
                </p>
              ) : (
                <div className="space-y-3">
                  {topSelling.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center font-bold text-green-600 dark:text-green-400">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium line-clamp-1">
                            {product.productName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatPrice(product.revenue)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatNumber(product.totalSales)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'uz' ? 'sotildi' : language === 'ru' ? 'продано' : 'sold'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Trending Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <h2 className="text-gray-900 dark:text-white font-semibold">
                  {language === 'uz' 
                    ? "Trend mahsulotlar" 
                    : language === 'ru' 
                    ? "Популярные товары" 
                    : "Trending Products"}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {trending.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {language === 'uz' ? "Ma'lumot yo'q" : language === 'ru' ? "Нет данных" : "No data"}
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {trending.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium line-clamp-1">
                            {product.productName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                              <TrendingUp className="w-3 h-3" />
                              {product.viewsGrowth.toFixed(0)}%
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Score: {product.trendScore.toFixed(0)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Award className="w-6 h-6 text-amber-500" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="lg:col-span-2"
        >
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-gray-900 dark:text-white font-semibold">
                  {language === 'uz' 
                    ? "Top kategoriyalar" 
                    : language === 'ru' 
                    ? "Топ категории" 
                    : "Top Categories"}
                </h2>
              </div>
            </CardHeader>
            <CardContent>
              {summary.topCategories.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {language === 'uz' ? "Ma'lumot yo'q" : language === 'ru' ? "Нет данных" : "No data"}
                </p>
              ) : (
                <div className="space-y-4">
                  {summary.topCategories.map((category, index) => {
                    const maxViews = Math.max(...summary.topCategories.map(c => c.views));
                    const percentage = (category.views / maxViews) * 100;
                    
                    return (
                      <div key={category.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-900 dark:text-white font-medium capitalize">
                            {category.category}
                          </span>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatNumber(category.views)} {language === 'uz' ? 'ko\'rish' : language === 'ru' ? 'просм.' : 'views'}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {formatNumber(category.sales)} {language === 'uz' ? 'sotuv' : language === 'ru' ? 'прод.' : 'sales'}
                            </span>
                          </div>
                        </div>
                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, delay: 0.1 * index }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Conversion Rate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card variant="elevated">
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-1">
                  {language === 'uz' 
                    ? "O'rtacha konversiya" 
                    : language === 'ru' 
                    ? "Средняя конверсия" 
                    : "Average Conversion Rate"}
                </p>
                <h3 className="text-4xl font-bold text-gray-900 dark:text-white">
                  {summary.averageConversionRate.toFixed(2)}%
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {language === 'uz' 
                    ? "Ko'rishdan sotuvga" 
                    : language === 'ru' 
                    ? "От просмотра к покупке" 
                    : "Views to sales"}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Activity className="w-10 h-10 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
