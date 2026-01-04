import { VendorProfile } from '../../types/roles';
import { Product } from '../../types';
import { Store, Package, ShoppingBag, DollarSign, Edit, Trash2, Plus, Eye, TrendingUp, AlertCircle, Clock, Star } from 'lucide-react';

interface VendorDashboardProps {
  vendor: VendorProfile;
  products: Product[];
  onAddProduct: () => void;
  onEditProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onViewOrders: () => void;
  onViewRevenue?: () => void; // NEW
}

export function VendorDashboard({
  vendor,
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onViewOrders,
  onViewRevenue
}: VendorDashboardProps) {
  // Mock stats
  const stats = {
    totalProducts: products.length,
    totalOrders: 45,
    totalRevenue: 12500000,
    monthlyRevenue: 3200000,
    pendingOrders: 8,
    completedOrders: 37
  };

  const statCards = [
    {
      icon: Package,
      label: 'Mahsulotlar',
      value: stats.totalProducts,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      icon: ShoppingBag,
      label: 'Buyurtmalar',
      value: stats.totalOrders,
      color: 'orange',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-600'
    },
    {
      icon: DollarSign,
      label: 'Jami daromad',
      value: `${(stats.totalRevenue / 1000000).toFixed(1)}M`,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      icon: TrendingUp,
      label: 'Bu oy',
      value: `${(stats.monthlyRevenue / 1000000).toFixed(1)}M`,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="p-6">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-white mb-2">{vendor.storeName}</h1>
            <p className="text-blue-100">{vendor.storeDescription}</p>
          </div>
          <div className="flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-lg">
            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            <span>{vendor.rating.toFixed(1)}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div>
            <p className="text-blue-100 text-sm mb-1">Status</p>
            <p className="text-white">
              {vendor.status === 'active' ? '✓ Faol' : vendor.status === 'pending' ? '⏳ Kutilmoqda' : '⛔ To\'xtatilgan'}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Savdolar</p>
            <p className="text-white">{vendor.totalSales}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm mb-1">Komissiya</p>
            <p className="text-white">{vendor.commission}%</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <h3 className={`${stat.textColor} mb-1`}>{stat.value}</h3>
              <p className="text-gray-600 text-sm">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900">Tez harakatlar</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={onAddProduct}
            className="bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Mahsulot qo'shish</span>
          </button>
          <button
            onClick={onViewOrders}
            className="bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Buyurtmalar</span>
          </button>
          <button 
            onClick={onViewRevenue}
            className="bg-emerald-600 text-white py-4 rounded-xl hover:bg-emerald-700 transition flex items-center justify-center gap-2"
          >
            <DollarSign className="w-5 h-5" />
            <span>Moliyaviy hisobot</span>
          </button>
          <button className="bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-700 transition flex items-center justify-center gap-2">
            <Edit className="w-5 h-5" />
            <span>Do'konni tahrirlash</span>
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-gray-900">Mening mahsulotlarim</h2>
            <button
              onClick={onAddProduct}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Qo'shish
            </button>
          </div>
        </div>

        <div className="p-6">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-500 transition">
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-gray-900 mb-2 line-clamp-1">{product.name}</h3>
                    
                    {/* Price with Discount */}
                    <div className="mb-3">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 line-through text-sm">
                            {product.originalPrice.toLocaleString()} so'm
                          </span>
                          <span className="text-blue-600 font-bold">
                            {product.price.toLocaleString()} so'm
                          </span>
                          {product.discount && (
                            <span className="bg-red-500 text-white px-2 py-0.5 rounded text-xs font-bold">
                              -{product.discount}%
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-blue-600 font-bold">
                          {product.price.toLocaleString()} so'm
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditProduct(product.id)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm flex items-center justify-center gap-1"
                      >
                        <Edit className="w-4 h-4" />
                        Tahrirlash
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">Hali mahsulot qo'shilmagan</p>
              <button
                onClick={onAddProduct}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Birinchi mahsulotni qo'shish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm mt-6">
        <div className="p-6 border-b">
          <h2 className="text-gray-900">So'nggi buyurtmalar</h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-gray-900 mb-1">Buyurtma #{1000 + i}</p>
                  <p className="text-gray-500 text-sm">2 ta mahsulot • 850,000 so'm</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                  Yangi
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}