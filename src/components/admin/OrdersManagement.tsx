import { ShoppingBag, Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, User, X, MapPin, Phone, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

interface Order {
  id: string;
  customerName: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  vendorName: string;
}

export function OrdersManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);

  // Load orders from localStorage
  useEffect(() => {
    const getOrders = (): Order[] => {
      try {
        const stored = localStorage.getItem('admin_orders');
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error loading orders:', error);
      }
      
      // Default orders
      return [
        {
          id: 'ORD-001',
          customerName: 'Ali Valiyev',
          items: 3,
          total: 7150000,
          status: 'pending',
          createdAt: new Date().toISOString(),
          vendorName: 'Tech Galaxy'
        },
        {
          id: 'ORD-002',
          customerName: 'Sardor Rashidov',
          items: 1,
          total: 120000,
          status: 'processing',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          vendorName: 'Fashion House'
        },
        {
          id: 'ORD-003',
          customerName: 'Dilshod Karimov',
          items: 2,
          total: 1500000,
          status: 'shipped',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          vendorName: 'Tech Galaxy'
        },
        {
          id: 'ORD-004',
          customerName: 'Aziza Mahmudova',
          items: 1,
          total: 75000,
          status: 'delivered',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          vendorName: 'Book Paradise'
        },
        {
          id: 'ORD-005',
          customerName: 'Kamola Tursunova',
          items: 4,
          total: 2340000,
          status: 'pending',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          vendorName: 'Sport Zone'
        }
      ];
    };
    
    const loadedOrders = getOrders();
    setOrders(loadedOrders);
    localStorage.setItem('admin_orders', JSON.stringify(loadedOrders));
  }, []);

  // Save orders to localStorage
  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('admin_orders', JSON.stringify(updatedOrders));
    
    // Also update 'orders' key for customer view
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    
    // Dispatch storage event to notify other components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'orders',
      newValue: JSON.stringify(updatedOrders),
      storageArea: localStorage
    }));
  };

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    saveOrders(updated);
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
    toast.success(`Buyurtma ${orderId} statusi yangilandi`);
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: Clock,
        label: 'Kutilmoqda',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        iconColor: 'text-yellow-600'
      },
      processing: {
        icon: Package,
        label: 'Tayyorlanmoqda',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        iconColor: 'text-blue-600'
      },
      shipped: {
        icon: Truck,
        label: 'Yetkazilmoqda',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        iconColor: 'text-purple-600'
      },
      delivered: {
        icon: CheckCircle,
        label: 'Yetkazildi',
        color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
        iconColor: 'text-green-600'
      },
      cancelled: {
        icon: XCircle,
        label: 'Bekor qilindi',
        color: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        iconColor: 'text-red-600'
      }
    };
    return configs[status as keyof typeof configs];
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0)
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Buyurtmalar boshqaruvi</h1>
        <p className="text-gray-600 dark:text-gray-400">Barcha buyurtmalarni kuzatish va boshqarish</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Jami</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-yellow-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Kutilmoqda</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-blue-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Tayyorlanmoqda</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.processing}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Yetkazilmoqda</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.shipped}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Yetkazildi</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.delivered}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 shadow-sm border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Daromad</p>
          </div>
          <p className="text-gray-900 dark:text-white text-lg font-bold">{stats.totalRevenue.toLocaleString()} so'm</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buyurtma ID, mijoz yoki do'kon nomi bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
          >
            <option value="all">Barchasi</option>
            <option value="pending">Kutilmoqda</option>
            <option value="processing">Tayyorlanmoqda</option>
            <option value="shipped">Yetkazilmoqda</option>
            <option value="delivered">Yetkazildi</option>
            <option value="cancelled">Bekor qilindi</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Buyurtma ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mijoz
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Do'kon
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Mahsulotlar
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Summa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Sana
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Harakatlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredOrders.map(order => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;

                return (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.id}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-semibold">
                            {order.customerName.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {order.customerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {order.vendorName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {order.items} ta
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.total.toLocaleString()} so'm
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${statusConfig.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-1 ml-auto"
                      >
                        <Eye className="w-4 h-4" />
                        Ko'rish
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Buyurtmalar topilmadi</p>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-gray-900 dark:text-white font-semibold">Buyurtma tafsilotlari</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Status:</p>
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 ${getStatusConfig(selectedOrder.status).color}`}>
                    {(() => {
                      const StatusIcon = getStatusConfig(selectedOrder.status).icon;
                      return <StatusIcon className="w-4 h-4" />;
                    })()}
                    {getStatusConfig(selectedOrder.status).label}
                  </span>
                </div>
              </div>

              {/* Status Update Actions */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <p className="text-gray-900 dark:text-white font-medium mb-3 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-blue-600" />
                  Statusni o'zgartirish
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {selectedOrder.status !== 'processing' && selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-2"
                    >
                      <Package className="w-4 h-4" />
                      Tayyorlash
                    </button>
                  )}
                  {(selectedOrder.status === 'processing' || selectedOrder.status === 'pending') && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm flex items-center justify-center gap-2"
                    >
                      <Truck className="w-4 h-4" />
                      Yuborish
                    </button>
                  )}
                  {selectedOrder.status === 'shipped' && (
                    <button
                      onClick={() => updateOrderStatus(selectedOrder.id, 'delivered')}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Yetkazildi
                    </button>
                  )}
                  {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'delivered' && (
                    <button
                      onClick={() => {
                        if (confirm('Buyurtmani bekor qilishni xohlaysizmi?')) {
                          updateOrderStatus(selectedOrder.id, 'cancelled');
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Bekor qilish
                    </button>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {selectedOrder.customerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{selectedOrder.customerName}</p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Mijoz</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">+998 90 123 45 67</span>
                  </div>
                  <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mt-1" />
                    <span className="text-sm">Toshkent sh., Chilonzor tumani, 12-kvartal, 34-uy</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Do'kon:</p>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedOrder.vendorName}</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Buyurtma sanasi:</p>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {new Date(selectedOrder.createdAt).toLocaleDateString('uz-UZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Mahsulotlar soni:</p>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedOrder.items} ta</p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Jami summa:</p>
                  <p className="text-gray-900 dark:text-white font-medium">{selectedOrder.total.toLocaleString()} so'm</p>
                </div>
              </div>

              {/* Products (Demo) */}
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Buyurtma mahsulotlari:</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium text-sm">Samsung Galaxy A54</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">1 dona × 3,500,000 so'm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium text-sm">Sony WH-1000XM5</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">1 dona × 3,200,000 so'm</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-lg"></div>
                    <div className="flex-1">
                      <p className="text-gray-900 dark:text-white font-medium text-sm">Smartwatch Xiaomi Band 8</p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">1 dona × 450,000 so'm</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-gray-900 dark:text-white font-semibold">Jami to'lov:</p>
                  <p className="text-gray-900 dark:text-white font-bold text-xl">{selectedOrder.total.toLocaleString()} so'm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}