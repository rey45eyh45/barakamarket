import { Search, Plus, Eye, Edit2, Trash2, Filter, Download, Upload, X, Package, AlertTriangle, Star, Check, AlertCircle, Users, Trophy, DollarSign } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { Product } from '../../types/product';
import { toast } from 'sonner@2.0.3';
import { useDebounce, searchInFields } from '../../utils/searchUtils';

// Extend Product type to include admin fields
interface AdminProduct extends Product {
  status?: 'active' | 'pending' | 'rejected';
  rejectionReason?: string;
  isFeatured?: boolean;
}

export function ProductsManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce search
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'pending' | 'rejected'>('all');
  const [selectedProduct, setSelectedProduct] = useState<AdminProduct | null>(null);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Get products from localStorage
  useEffect(() => {
    const getProducts = (): AdminProduct[] => {
      try {
        const allProducts: AdminProduct[] = [];
        
        // 1. Load products from admin_products
        const adminProducts = localStorage.getItem('admin_products');
        if (adminProducts) {
          const parsed = JSON.parse(adminProducts);
          allProducts.push(...parsed);
        }
        
        // 2. Load products from all_products (includes vendor products)
        const allProductsStore = localStorage.getItem('all_products');
        if (allProductsStore) {
          const parsed = JSON.parse(allProductsStore);
          // Add vendor products that are not already in admin_products
          parsed.forEach((product: any) => {
            const exists = allProducts.find(p => p.id === product.id);
            if (!exists) {
              // Add status field if not present
              allProducts.push({
                ...product,
                status: product.status || 'active'
              });
            }
          });
        }
        
        // 3. Load vendor-specific products
        const vendors = ['demo1', 'demo2', 'demo3', 'demo4', 'demo5'];
        vendors.forEach(vendorId => {
          const vendorProducts = localStorage.getItem(`vendor_products_${vendorId}`);
          if (vendorProducts) {
            const parsed = JSON.parse(vendorProducts);
            parsed.forEach((product: any) => {
              const exists = allProducts.find(p => p.id === product.id);
              if (!exists) {
                allProducts.push({
                  ...product,
                  status: product.status || 'active'
                });
              }
            });
          }
        });
        
        // 4. Also check for real user vendors
        const usersData = localStorage.getItem('users');
        if (usersData) {
          const users = JSON.parse(usersData);
          Object.values(users).forEach((entry: any) => {
            if (entry.user.role === 'vendor') {
              const vendorProducts = localStorage.getItem(`vendor_products_${entry.user.id}`);
              if (vendorProducts) {
                const parsed = JSON.parse(vendorProducts);
                parsed.forEach((product: any) => {
                  const exists = allProducts.find(p => p.id === product.id);
                  if (!exists) {
                    allProducts.push({
                      ...product,
                      status: product.status || 'active'
                    });
                  }
                });
              }
            }
          });
        }
        
        console.log('✅ Loaded products:', allProducts.length);
        return allProducts;
      } catch (error) {
        console.error('Error loading products:', error);
        return [];
      }
    };

    const loadedProducts = getProducts();
    setProducts(loadedProducts);
  }, []);

  // Save products to localStorage
  const saveProducts = (updatedProducts: AdminProduct[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('admin_products', JSON.stringify(updatedProducts));
  };

  // Approve product
  const approveProduct = (productId: string) => {
    const updated = products.map(p =>
      p.id === productId ? { ...p, status: 'active' as const, rejectionReason: undefined } : p
    );
    saveProducts(updated);
    setSelectedProduct(null);
    toast.success('Mahsulot tasdiqlandi');
  };

  // Reject product
  const rejectProduct = (productId: string, reason: string) => {
    const updated = products.map(p =>
      p.id === productId ? { ...p, status: 'rejected' as const, rejectionReason: reason } : p
    );
    saveProducts(updated);
    setSelectedProduct(null);
    setRejectionReason('');
    toast.error('Mahsulot rad etildi');
  };

  // Toggle featured status
  const toggleFeatured = (productId: string) => {
    const updated = products.map(p =>
      p.id === productId ? { ...p, isFeatured: !p.isFeatured } : p
    );
    saveProducts(updated);
    
    const product = updated.find(p => p.id === productId);
    if (product?.isFeatured) {
      toast.success('Mahsulot TOP ga qo\'shildi! 🏆');
    } else {
      toast.info('Mahsulot TOP dan olib tashlandi');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = searchInFields(product, ['name', 'description'], debouncedSearchQuery);
      const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [products, debouncedSearchQuery, selectedStatus]);

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'active').length,
    pending: products.filter(p => p.status === 'pending').length,
    rejected: products.filter(p => p.status === 'rejected').length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">Mahsulotlar boshqaruvi</h1>
        <p className="text-gray-600 dark:text-gray-400">Barcha mahsulotlarni moderatsiya qilish</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Jami</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Faol</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.active}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Kutilmoqda</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <X className="w-5 h-5 text-red-600" />
            <p className="text-gray-600 dark:text-gray-400 text-sm">Rad etilgan</p>
          </div>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{stats.rejected}</p>
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
              placeholder="Mahsulot nomi yoki tavsif bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'active', label: 'Faol' },
              { id: 'pending', label: 'Kutilmoqda' },
              { id: 'rejected', label: 'Rad etilgan' }
            ].map(status => (
              <button
                key={status.id}
                onClick={() => setSelectedStatus(status.id as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
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

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition border border-gray-200 dark:border-gray-700 group"
          >
            {/* Image */}
            <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isFeatured && (
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <Trophy className="w-3 h-3" />
                    TOP
                  </span>
                </div>
              )}
              <div className="absolute top-2 right-2">
                <span className="px-2 py-1 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 shadow-lg">
                  {product.category}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-gray-900 dark:text-white font-medium mb-1 line-clamp-1">
                {product.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {product.description}
              </p>

              {/* Vendor Info */}
              {product.vendorId && (
                <div className="mb-3 flex items-center gap-2 px-2 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                    Vendor: {product.vendorId}
                  </span>
                </div>
              )}

              {/* Price & Rating */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-gray-900 dark:text-white font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>{product.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{product.rating}</span>
                </div>
              </div>

              {/* TOP Toggle */}
              <div className="mb-3 flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">TOP mahsulot</span>
                </div>
                <button
                  onClick={() => toggleFeatured(product.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    product.isFeatured ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      product.isFeatured ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ko'rish
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Mahsulotlar topilmadi</p>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-gray-900 dark:text-white font-semibold">Mahsulot ma'lumotlari</h2>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6">
              {/* Image */}
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-6">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-900 dark:text-white text-xl font-semibold mb-2">
                    {selectedProduct.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedProduct.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Narxi</p>
                    <p className="text-gray-900 dark:text-white text-xl font-bold">
                      {selectedProduct.price.toLocaleString()} so'm
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Kategoriya</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedProduct.category}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Reyting</p>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-900 dark:text-white font-medium">
                        {selectedProduct.rating}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">Sotilgan</p>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {selectedProduct.sold} ta
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-medium" onClick={() => approveProduct(selectedProduct.id)}>
                    <Check className="w-5 h-5" />
                    Tasdiqlash
                  </button>
                  <button className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-medium" onClick={() => setShowRejectModal(true)}>
                    <X className="w-5 h-5" />
                    Rad etish
                  </button>
                </div>

                {/* Show rejection reason if already rejected */}
                {selectedProduct.status === 'rejected' && selectedProduct.rejectionReason && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-red-900 dark:text-red-200 font-medium mb-1">Rad etish sababi:</p>
                        <p className="text-red-700 dark:text-red-300 text-sm">{selectedProduct.rejectionReason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedProduct && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
          onClick={() => {
            setShowRejectModal(false);
            setRejectionReason('');
          }}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-gray-900 dark:text-white font-semibold">Mahsulotni rad etish</h2>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition"
              >
                <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-yellow-900 dark:text-yellow-200 font-medium mb-1">Diqqat!</p>
                    <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                      {selectedProduct.name} mahsulotini rad etmoqchimisiz?
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Rad etish sababi *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 dark:text-white resize-none"
                  placeholder="Masalan: Mahsulot tavsifi yetarli emas, rasmlar sifatsiz, narx noto'g'ri..."
                />
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                  Bu sabab vendor'ga yuboriladi
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (rejectionReason.trim()) {
                      rejectProduct(selectedProduct.id, rejectionReason);
                      setShowRejectModal(false);
                    } else {
                      toast.error('Rad etish sababini kiriting');
                    }
                  }}
                  disabled={!rejectionReason.trim()}
                >
                  <X className="w-5 h-5" />
                  Rad etish
                </button>
                <button
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition flex items-center justify-center gap-2 font-medium"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                >
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}