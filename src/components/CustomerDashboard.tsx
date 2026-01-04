// Customer Dashboard Component - Customer personal cabinet

import React, { useState, useEffect } from 'react';
import {
  User,
  ShoppingBag,
  MapPin,
  CreditCard,
  Star,
  Gift,
  Heart,
  Settings,
  Package,
  TrendingUp,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import {
  getCustomer,
  getCustomerStats,
  getCustomerAddresses,
  getCustomerPaymentMethods,
  getLoyaltyTransactions,
  getAvailableRewards,
  getFavoriteVendors,
  type Customer,
  type CustomerStats as CustomerStatsType
} from '../types/customer';

interface CustomerDashboardProps {
  customerId: string;
  language?: 'uz' | 'ru' | 'en';
}

export function CustomerDashboard({ customerId, language = 'uz' }: CustomerDashboardProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [stats, setStats] = useState<CustomerStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [customerId]);

  useEffect(() => {
    const handleUpdate = () => loadDashboard();
    
    window.addEventListener('customers-updated', handleUpdate);
    window.addEventListener('orders-updated', handleUpdate);
    window.addEventListener('customer-loyalty-updated', handleUpdate);
    
    return () => {
      window.removeEventListener('customers-updated', handleUpdate);
      window.removeEventListener('orders-updated', handleUpdate);
      window.removeEventListener('customer-loyalty-updated', handleUpdate);
    };
  }, [customerId]);

  const loadDashboard = () => {
    setLoading(true);
    
    const customerData = getCustomer(customerId);
    const statsData = getCustomerStats(customerId);
    
    setCustomer(customerData);
    setStats(statsData);
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const getTierColor = (tier: Customer['loyaltyTier']) => {
    switch (tier) {
      case 'platinum': return 'from-gray-700 to-gray-900';
      case 'gold': return 'from-yellow-500 to-yellow-600';
      case 'silver': return 'from-gray-400 to-gray-500';
      default: return 'from-orange-600 to-orange-700';
    }
  };

  const getTierIcon = (tier: Customer['loyaltyTier']) => {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      default: return '🥉';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>

        {/* Content Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            {/* Loyalty Card */}
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-6 bg-white/20 rounded w-32 mb-4"></div>
              <div className="h-10 bg-white/20 rounded w-24 mb-2"></div>
              <div className="h-4 bg-white/20 rounded w-40"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!customer || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-bold text-gray-900">Mijoz topilmadi</h2>
        </div>
      </div>
    );
  }

  const addresses = getCustomerAddresses(customerId);
  const paymentMethods = getCustomerPaymentMethods(customerId);
  const loyaltyTransactions = getLoyaltyTransactions(customerId).slice(0, 5);
  const availableRewards = getAvailableRewards(customerId);
  const favoriteVendors = getFavoriteVendors(customerId);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {customer.avatar ? (
              <img
                src={customer.avatar}
                alt={customer.name}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {customer.name.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Salom, {customer.name}! 👋
              </h1>
              <p className="text-gray-600">
                Shaxsiy kabinetingiz
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="/orders"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <ShoppingBag size={20} />
              Buyurtmalarim
            </a>
            <a
              href="/settings"
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <Settings size={20} />
            </a>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
            customer.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {customer.status === 'active' ? '✅ Faol' : '🚫 Bloklangan'}
          </div>

          {customer.verified && (
            <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold flex items-center gap-1">
              <CheckCircle size={16} />
              Tasdiqlangan
            </div>
          )}

          <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
            📅 {stats.accountAge} kun
          </div>
        </div>
      </div>

      {/* Loyalty Card */}
      <div className={`bg-gradient-to-r ${getTierColor(stats.loyaltyTier)} rounded-xl shadow-lg p-6 text-white mb-8`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm opacity-90 mb-1">Loyalty darajangiz</div>
            <div className="text-3xl font-bold flex items-center gap-2">
              {getTierIcon(stats.loyaltyTier)}
              {stats.loyaltyTier.toUpperCase()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90 mb-1">Mavjud ballar</div>
            <div className="text-4xl font-bold">
              {stats.loyaltyPoints}
            </div>
          </div>
        </div>

        {stats.pointsToNextTier > 0 && (
          <div>
            <div className="text-sm opacity-90 mb-2">
              Keyingi darajaga: {stats.pointsToNextTier} ball
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{
                  width: `${((stats.loyaltyPoints % 1000) / 1000) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingBag className="text-blue-600" size={24} />
            </div>
            {stats.pendingOrders > 0 && (
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                {stats.pendingOrders}
              </div>
            )}
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalOrders}
          </div>
          <div className="text-sm text-gray-600">Jami buyurtmalar</div>
        </div>

        {/* Total Spent */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {formatPrice(stats.totalSpent)}
          </div>
          <div className="text-sm text-gray-600">Jami xarajat</div>
        </div>

        {/* Reviews */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {stats.totalReviews}
          </div>
          <div className="text-sm text-gray-600">Sharhlar</div>
        </div>

        {/* Favorite Vendors */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Heart className="text-purple-600" size={24} />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {favoriteVendors.length}
          </div>
          <div className="text-sm text-gray-600">Sevimli do'konlar</div>
        </div>
      </div>

      {/* Available Rewards */}
      {availableRewards.length > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Gift size={24} />
                <h3 className="text-xl font-bold">Mavjud mukofotlar</h3>
              </div>
              <p className="text-purple-100">
                {availableRewards.length} ta mukofotni olishingiz mumkin!
              </p>
            </div>
            <a
              href="/rewards"
              className="px-6 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all"
            >
              Ko'rish
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Spending Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={24} />
            Oylik xarajatlar
          </h2>
          <div className="space-y-3">
            {stats.spendingByMonth.map((item, index) => {
              const maxSpent = Math.max(...stats.spendingByMonth.map(s => s.spent));
              const width = maxSpent > 0 ? (item.spent / maxSpent) * 100 : 0;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">{item.month}</span>
                    <span className="font-semibold text-gray-900">
                      {formatPrice(item.spent)}
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

        {/* Top Categories */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="text-purple-600" size={24} />
            Sevimli kategoriyalar
          </h2>
          <div className="space-y-4">
            {stats.topCategories.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{item.category}</div>
                    <div className="text-xs text-gray-500">{item.orders} buyurtma</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    {formatPrice(item.spent)}
                  </div>
                </div>
              </div>
            ))}
          </div>
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
            href="/orders"
            className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
          >
            Barchasini ko'rish →
          </a>
        </div>
        
        {stats.recentOrders.length > 0 ? (
          <div className="space-y-4">
            {stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">
                      Buyurtma #{order.id.slice(0, 8)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">
                      {formatPrice(order.total)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Package size={16} />
                  {order.items.length} ta mahsulot
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ShoppingBag size={48} className="mx-auto mb-4 text-gray-300" />
            <p>Hali buyurtmalaringiz yo'q</p>
            <a
              href="/catalog"
              className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Xarid qilishni boshlash
            </a>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Addresses */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="text-green-600" size={24} />
              Saqlangan manzillar
            </h2>
            <a
              href="/addresses"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Barchasi →
            </a>
          </div>
          
          {addresses.length > 0 ? (
            <div className="space-y-3">
              {addresses.slice(0, 3).map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-semibold text-gray-900">
                      {address.label || address.type}
                    </div>
                    {address.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        Asosiy
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">
                    {address.street}, {address.city}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MapPin size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Manzil qo'shing</p>
            </div>
          )}
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard className="text-orange-600" size={24} />
              To'lov usullari
            </h2>
            <a
              href="/payment-methods"
              className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
            >
              Barchasi →
            </a>
          </div>
          
          {paymentMethods.length > 0 ? (
            <div className="space-y-3">
              {paymentMethods.slice(0, 3).map((method) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CreditCard size={20} className="text-gray-400" />
                      <span className="font-semibold text-gray-900">
                        {method.type === 'card' ? method.cardNumber : method.walletProvider}
                      </span>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        Asosiy
                      </span>
                    )}
                  </div>
                  {method.type === 'card' && method.cardBrand && (
                    <p className="text-sm text-gray-600 capitalize">
                      {method.cardBrand}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CreditCard size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">To'lov usuli qo'shing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
