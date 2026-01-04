// Vendor Dashboard Component - Main vendor panel

import React, { useState, useEffect } from 'react';
import {
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Download,
  Eye
} from 'lucide-react';
import {
  getVendor,
  getVendorStats,
  getVendorRevenue,
  type Vendor,
  type VendorStats as VendorStatsType
} from '../types/vendor';

interface VendorDashboardProps {
  vendorId: string;
  language?: 'uz' | 'ru' | 'en';
}

export function VendorDashboard({ vendorId, language = 'uz' }: VendorDashboardProps) {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [stats, setStats] = useState<VendorStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [vendorId]);

  useEffect(() => {
    const handleUpdate = () => loadDashboard();
    window.addEventListener('vendors-updated', handleUpdate);
    window.addEventListener('orders-updated', handleUpdate);
    window.addEventListener('products-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('vendors-updated', handleUpdate);
      window.removeEventListener('orders-updated', handleUpdate);
      window.removeEventListener('products-updated', handleUpdate);
    };
  }, [vendorId]);

  const loadDashboard = () => {
    setLoading(true);
    
    const vendorData = getVendor(vendorId);
    const statsData = getVendorStats(vendorId);
    
    setVendor(vendorData);
    setStats(statsData);
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatPercent = (value: number) => {
    return (value >= 0 ? '+' : '') + value.toFixed(1) + '%';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!vendor || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Vendor topilmadi</h2>
        </div>
      </div>
    );
  }

  const revenue = getVendorRevenue(vendorId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              👋 Xush kelibsiz, {vendor.name}!
            </h1>
            <p className="text-gray-600">
              Boshqaruv panelingiz
            </p>
          </div>

          <div className="flex gap-2">
            <a
              href={`/vendor/${vendorId}/products`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Package size={20} />
              Mahsulotlar
            </a>
            <a
              href={`/vendor/${vendorId}/orders`}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <ShoppingBag size={20} />
              Buyurtmalar
            </a>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            vendor.status === 'active' ? 'bg-green-100 text-green-800' :
            vendor.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {vendor.status === 'active' ? '✅ Faol' :
             vendor.status === 'pending' ? '⏳ Kutilmoqda' :
             vendor.status === 'suspended' ? '⚠️ To\'xtatilgan' :
             '🚫 Bloklangan'}
          </div>

          {vendor.verified && (
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-1">
              <CheckCircle size={16} />
              Tasdiqlangan
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign size={24} />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              stats.revenueGrowth >= 0 ? 'text-green-200' : 'text-red-200'
            }`}>
              {stats.revenueGrowth >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {formatPercent(stats.revenueGrowth)}
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {formatPrice(stats.totalRevenue)}
          </div>
          <div className="text-blue-100 text-sm">Jami daromad</div>
          <div className="mt-2 text-xs text-blue-200">
            Bu oy: {formatPrice(stats.thisMonthRevenue)}
          </div>
        </div>

        {/* Orders */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingBag size={24} />
            </div>
            {stats.pendingOrders > 0 && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                {stats.pendingOrders}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold mb-1">
            {stats.totalOrders}
          </div>
          <div className="text-green-100 text-sm">Jami buyurtmalar</div>
          <div className="mt-2 text-xs text-green-200">
            Kutilmoqda: {stats.pendingOrders}
          </div>
        </div>

        {/* Products */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package size={24} />
            </div>
            {stats.outOfStockProducts > 0 && (
              <div className="flex items-center gap-1 text-xs text-yellow-200">
                <AlertCircle size={14} />
                {stats.outOfStockProducts}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold mb-1">
            {stats.totalProducts}
          </div>
          <div className="text-purple-100 text-sm">Jami mahsulotlar</div>
          <div className="mt-2 text-xs text-purple-200">
            Faol: {stats.activeProducts}
          </div>
        </div>

        {/* Rating */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Star size={24} />
            </div>
            <div className="text-sm text-orange-100">
              {stats.totalReviews} ta sharh
            </div>
          </div>
          <div className="text-3xl font-bold mb-1">
            {stats.averageRating.toFixed(1)} ⭐
          </div>
          <div className="text-orange-100 text-sm">O'rtacha reyting</div>
          <div className="mt-2 text-xs text-orange-200">
            Bajarilish: {stats.completionRate.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Available Balance */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-green-100 mb-2">Mavjud balans</div>
            <div className="text-4xl font-bold">
              {formatPrice(revenue.availableBalance)}
            </div>
            <div className="text-sm text-green-100 mt-2">
              Umumiy daromad: {formatPrice(revenue.totalEarnings)} • 
              Komissiya ({revenue.commissionRate}%): {formatPrice(revenue.totalCommission)}
            </div>
          </div>
          <a
            href={`/vendor/${vendorId}/payouts`}
            className="px-6 py-3 bg-white text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-all"
          >
            Pul yechish
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={24} />
            Oylik daromad
          </h2>
          <div className="space-y-3">
            {stats.revenueByMonth.map((item, index) => {
              const maxRevenue = Math.max(...stats.revenueByMonth.map(r => r.revenue));
              const width = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.revenue)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="text-green-600" size={24} />
            Buyurtmalar holati
          </h2>
          <div className="space-y-4">
            {stats.ordersByStatus.map((item, index) => {
              const colors = [
                'bg-yellow-500',
                'bg-blue-500',
                'bg-green-500',
                'bg-red-500'
              ];
              
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${colors[index]}`}></div>
                    <span className="text-gray-700">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-bold text-gray-900">
                      {item.count}
                    </div>
                    <div className="text-xs text-gray-500">
                      {stats.totalOrders > 0 
                        ? ((item.count / stats.totalOrders) * 100).toFixed(0) + '%'
                        : '0%'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-600" size={24} />
          Eng ko'p sotilgan mahsulotlar
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  #
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Mahsulot
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Sotildi
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Daromad
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((item, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.product.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.product.category}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-sm font-semibold text-gray-900">
                    {item.sales} dona
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatPrice(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Clock className="text-blue-600" size={24} />
            So'nggi buyurtmalar
          </h2>
          <a
            href={`/vendor/${vendorId}/orders`}
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1"
          >
            Barchasini ko'rish
            <Eye size={16} />
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Buyurtma
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                  Mijoz
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                  Holat
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Summa
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                  Vaqt
                </th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                    #{order.id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {order.customer?.name || 'Guest'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.vendorStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.vendorStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.vendorStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.vendorStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-gray-900">
                    {formatPrice(order.total)}
                  </td>
                  <td className="py-3 px-4 text-right text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Reviews */}
      {stats.recentReviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-yellow-500" size={24} />
            So'nggi sharhlar
          </h2>
          <div className="space-y-4">
            {stats.recentReviews.map((review) => (
              <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {review.customerName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {review.productName}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {review.comment}
                </p>
                <div className="text-xs text-gray-500">
                  {new Date(review.createdAt).toLocaleDateString('uz-UZ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
