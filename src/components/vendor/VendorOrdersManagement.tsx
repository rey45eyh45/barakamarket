import { ShoppingBag, Search, Eye, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, User, X, MapPin, Phone, RefreshCw, TrendingUp, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner@2.0.3';

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

interface VendorOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  paymentMethod: 'cash' | 'payme' | 'click';
}

interface VendorOrdersManagementProps {
  vendorId: string;
  onBack: () => void;
}

export function VendorOrdersManagement({ vendorId, onBack }: VendorOrdersManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'>('all');
  const [selectedOrder, setSelectedOrder] = useState<VendorOrder | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);

  // Load vendor orders from localStorage
  useEffect(() => {
    const getVendorOrders = (): VendorOrder[] => {
      try {
        const stored = localStorage.getItem(`vendor_orders_${vendorId}`);
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (error) {
        console.error('Error loading vendor orders:', error);
      }
      
      // Default demo orders for this vendor
      return [
        {
          id: 'VORD-001',
          customerName: 'Ali Valiyev',
          customerPhone: '+998 90 123 45 67',
          customerAddress: 'Toshkent sh., Chilonzor tumani, 12-kvartal',
          items: [
            {
              id: '1',
              productName: 'Samsung Galaxy A54',
              productImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
              quantity: 1,
              price: 3500000
            },
            {
              id: '2',
              productName: 'Sony WH-1000XM5',
              productImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
              quantity: 1,
              price: 3200000
            }
          ],
          total: 6700000,
          status: 'pending',
          createdAt: new Date().toISOString(),
          paymentMethod: 'cash'
        },
        {
          id: 'VORD-002',
          customerName: 'Sardor Rashidov',
          customerPhone: '+998 91 234 56 78',
          customerAddress: 'Toshkent sh., Yunusobod tumani, 5-kvartal',
          items: [
            {
              id: '3',
              productName: 'Apple iPhone 13',
              productImage: 'https://images.unsplash.com/photo-1592286927505-b0501739c188?w=400',
              quantity: 1,
              price: 8500000
            }
          ],
          total: 8500000,
          status: 'processing',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          paymentMethod: 'payme'
        },
        {
          id: 'VORD-003',
          customerName: 'Dilshod Karimov',
          customerPhone: '+998 93 345 67 89',
          customerAddress: 'Toshkent sh., Sergeli tumani, Qorasuv',
          items: [
            {
              id: '4',
              productName: 'MacBook Pro 14',
              productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
              quantity: 1,
              price: 25000000
            }
          ],
          total: 25000000,
          status: 'shipped',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          paymentMethod: 'click'
        },
        {
          id: 'VORD-004',
          customerName: 'Aziza Mahmudova',
          customerPhone: '+998 94 456 78 90',
          customerAddress: 'Toshkent sh., Mirzo Ulug\'bek tumani',
          items: [
            {
              id: '5',
              productName: 'Samsung Galaxy A54',
              productImage: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400',
              quantity: 2,
              price: 3500000
            }
          ],
          total: 7000000,
          status: 'delivered',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          paymentMethod: 'cash'
        },
        {
          id: 'VORD-005',
          customerName: 'Kamola Tursunova',
          customerPhone: '+998 95 567 89 01',
          customerAddress: 'Toshkent sh., Bektemir tumani',
          items: [
            {
              id: '6',
              productName: 'Sony WH-1000XM5',
              productImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
              quantity: 1,
              price: 3200000
            }
          ],
          total: 3200000,
          status: 'pending',
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          paymentMethod: 'payme'
        }
      ];
    };
    
    const loadedOrders = getVendorOrders();
    setOrders(loadedOrders);
    localStorage.setItem(`vendor_orders_${vendorId}`, JSON.stringify(loadedOrders));
  }, [vendorId]);

  // Save orders to localStorage
  const saveOrders = (updatedOrders: VendorOrder[]) => {
    setOrders(updatedOrders);
    localStorage.setItem(`vendor_orders_${vendorId}`, JSON.stringify(updatedOrders));
  };

  // Update order status
  const updateOrderStatus = (orderId: string, newStatus: VendorOrder['status']) => {
    const updated = orders.map(o =>
      o.id === orderId ? { ...o, status: newStatus } : o
    );
    saveOrders(updated);
    setSelectedOrder(prev => prev && prev.id === orderId ? { ...prev, status: newStatus } : prev);
    
    // Toast notification
    const statusMessages = {
      processing: 'Buyurtma tayyorlanmoqda',
      shipped: 'Buyurtma yuborildi',
      delivered: 'Buyurtma yetkazildi',
      cancelled: 'Buyurtma bekor qilindi'
    };
    toast.success(statusMessages[newStatus] || 'Status yangilandi');
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0)
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusConfig = (status: VendorOrder['status']) => {
    switch (status) {
      case 'pending':
        return { label: 'Kutilmoqda', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock };
      case 'processing':
        return { label: 'Tayyorlanmoqda', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Package };
      case 'shipped':
        return { label: 'Yuborildi', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: Truck };
      case 'delivered':
        return { label: 'Yetkazildi', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle };
      case 'cancelled':
        return { label: 'Bekor qilindi', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle };
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return '💵 Naqd pul';
      case 'payme': return '💳 Payme';
      case 'click': return '💳 Click';
      default: return method;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-gray-900 dark:text-white">Buyurtmalar</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Mening do'konim uchun buyurtmalar</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
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
              <p className="text-gray-600 dark:text-gray-400 text-sm">Yuborildi</p>
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
          <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-4 shadow-sm text-white">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5" />
              <p className="text-white/90 text-sm">Daromad</p>
            </div>
            <p className="text-white text-lg font-bold">{(stats.revenue / 1000000).toFixed(1)}M</p>
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
                placeholder="Buyurtma ID yoki mijoz ismi bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'pending', label: 'Kutilmoqda' },
                { id: 'processing', label: 'Tayyorlanmoqda' },
                { id: 'shipped', label: 'Yuborildi' },
                { id: 'delivered', label: 'Yetkazildi' }
              ].map(status => (
                <button
                  key={status.id}
                  onClick={() => setSelectedStatus(status.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                    selectedStatus === status.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
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
                    Mahsulotlar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Jami
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Sana
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Harakatlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredOrders.map(order => {
                  const statusConfig = getStatusConfig(order.status);
                  const StatusIcon = statusConfig.icon;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white font-medium">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium">{order.customerName}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">{order.customerPhone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-600 dark:text-gray-400">
                          {order.items.length} ta mahsulot
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-gray-900 dark:text-white font-bold">
                          {formatPrice(order.total)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-1"
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
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-gray-900 dark:text-white font-semibold">
                Buyurtma #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

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
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Mijoz ma'lumotlari
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedOrder.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 dark:text-white">{selectedOrder.customerPhone}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-gray-900 dark:text-white">{selectedOrder.customerAddress}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Mahsulotlar
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-3 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <img
                        src={item.productImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="text-gray-900 dark:text-white font-medium">
                          {item.productName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          {item.quantity} x {formatPrice(item.price)}
                        </p>
                      </div>
                      <div className="text-gray-900 dark:text-white font-bold">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                  To'lov ma'lumotlari
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">To'lov usuli:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Sana:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-900 dark:text-white font-semibold">Jami:</span>
                      <span className="text-blue-600 dark:text-blue-400 text-xl font-bold">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
