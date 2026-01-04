import { Store, Check, X, Eye, MoreVertical, Star } from 'lucide-react';
import { VendorProfile } from '../../types/roles';
import { useState, useEffect } from 'react';

interface VendorsManagementProps {
  vendors: VendorProfile[];
  onApprove: (vendorId: string) => void;
  onReject: (vendorId: string) => void;
  onSuspend: (vendorId: string) => void;
  onRejectWithReason?: (vendorId: string, reason: string) => void;
}

export function VendorsManagement({ vendors, onApprove, onReject, onSuspend, onRejectWithReason }: VendorsManagementProps) {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingVendorId, setRejectingVendorId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // ✅ TUZATISH: Demo vendors'ni faqat boshlang'ich ma'lumot sifatida yuklaymiz
  // Real vendors ma'lumotlari App.tsx'dan props orqali keladi
  const initializeDemoVendors = () => {
    const existingVendors = localStorage.getItem('vendors_initialized');
    
    // Agar birinchi marta ishga tushayotgan bo'lsa, demo vendors'ni qo'shamiz
    if (!existingVendors) {
      const demoVendors: VendorProfile[] = [
        {
          id: 'vendor_demo_tech',
          userId: 'demo1',
          storeName: 'Tech Galaxy',
          storeDescription: 'Eng yangi elektronika va gadgetlar',
          storeLogo: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200',
          status: 'active',
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 4.8,
          totalSales: 245,
          commission: 10,
          address: 'Toshkent sh., Chilonzor tumani',
          email: 'techgalaxy@example.com',
          phone: '+998901234567'
        },
        {
          id: 'vendor_demo_fashion',
          userId: 'user2',
          storeName: 'Fashion House',
          storeDescription: 'Zamonaviy kiyim va aksessuarlar',
          storeLogo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200',
          status: 'active',
          createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 4.6,
          totalSales: 189,
          commission: 12,
          address: 'Toshkent sh., Mirzo Ulug\'bek tumani',
          email: 'fashionhouse@example.com',
          phone: '+998901234568'
        },
        {
          id: 'vendor_demo_book',
          userId: 'user3',
          storeName: 'Book Paradise',
          storeDescription: 'Kitoblar va o\'quv materiallari',
          storeLogo: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=200',
          status: 'active',
          createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 4.9,
          totalSales: 567,
          commission: 8,
          address: 'Toshkent sh., Yunusobod tumani',
          email: 'bookparadise@example.com',
          phone: '+998901234569'
        },
        {
          id: 'vendor_demo_decor',
          userId: 'user4',
          storeName: 'Home Decor Pro',
          storeDescription: 'Uy uchun bezak va buyumlar',
          storeLogo: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=200',
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 0,
          totalSales: 0,
          commission: 10,
          address: 'Toshkent sh., Yakkasaroy tumani',
          email: 'homedecor@example.com',
          phone: '+998901234570'
        },
        {
          id: 'vendor_demo_sport',
          userId: 'user5',
          storeName: 'Sport Zone',
          storeDescription: 'Sport jihozlari va kiyimlari',
          storeLogo: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=200',
          status: 'active',
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
          rating: 4.7,
          totalSales: 334,
          commission: 11,
          address: 'Toshkent sh., Sergeli tumani',
          email: 'sportzone@example.com',
          phone: '+998901234571'
        }
      ];

      // Har bir demo vendor uchun localStorage'ga saqlash
      demoVendors.forEach(vendor => {
        localStorage.setItem(`vendor_${vendor.id}`, JSON.stringify(vendor));
      });

      // Flag qo'yamiz
      localStorage.setItem('vendors_initialized', 'true');
      
      console.log('✅ Demo vendors initialized successfully!');
    }
  };

  // Komponent yuklanganda demo vendors'ni tekshirish
  useEffect(() => {
    initializeDemoVendors();
  }, []);

  // ✅ TUZATISH: Props'dan kelgan vendors'ni to'g'ridan-to'g'ri ishlatamiz
  const allVendors = vendors;

  // ✅ Vendor action handler - App.tsx'dagi handler'larni chaqiradi
  const handleVendorAction = (vendorId: string, action: 'approve' | 'reject' | 'suspend') => {
    if (action === 'approve') {
      onApprove(vendorId);
    } else if (action === 'reject') {
      if (onRejectWithReason) {
        setRejectingVendorId(vendorId);
        setShowRejectModal(true);
      } else {
        onReject(vendorId);
      }
    } else if (action === 'suspend') {
      onSuspend(vendorId);
    }
  };

  const filteredVendors = allVendors.filter(vendor => {
    if (selectedTab === 'all') return true;
    return vendor.status === selectedTab;
  });

  console.log('🔍 VendorsManagement Debug:', {
    selectedTab,
    totalVendors: allVendors.length,
    filteredCount: filteredVendors.length,
    allVendors: allVendors.map(v => ({ name: v.storeName, status: v.status })),
    filteredVendors: filteredVendors.map(v => ({ name: v.storeName, status: v.status }))
  });

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      active: 'bg-green-100 text-green-700',
      suspended: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: 'Kutilmoqda',
      active: 'Faol',
      suspended: 'To\'xtatilgan'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-6">
        <h1 className="text-gray-900 dark:text-white mb-2">Do'konlarni boshqarish</h1>
        <p className="text-gray-600 dark:text-gray-400">Hamkorlar va ularning do'konlari</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 mb-1">Jami do'konlar</p>
          <p className="text-blue-600">{allVendors.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 mb-1">Faol</p>
          <p className="text-green-600">{allVendors.filter(v => v.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 mb-1">Kutilmoqda</p>
          <p className="text-yellow-600">{allVendors.filter(v => v.status === 'pending').length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-gray-600 mb-1">To'xtatilgan</p>
          <p className="text-red-600">{allVendors.filter(v => v.status === 'suspended').length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b px-6">
          <div className="flex gap-6">
            {[
              { id: 'all', label: 'Barchasi' },
              { id: 'pending', label: 'Kutilmoqda' },
              { id: 'active', label: 'Faol' },
              { id: 'suspended', label: 'To\'xtatilgan' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`py-4 border-b-2 transition ${
                  selectedTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vendors List */}
        <div className="p-6">
          <div className="space-y-4">
            {filteredVendors.map(vendor => (
              <div key={vendor.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    {vendor.storeLogo ? (
                      <img src={vendor.storeLogo} alt={vendor.storeName} className="w-full h-full object-cover rounded-lg" />
                    ) : (
                      <Store className="w-8 h-8 text-white" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-gray-900 mb-1">{vendor.storeName}</h3>
                        <p className="text-gray-600 text-sm line-clamp-1">{vendor.storeDescription}</p>
                      </div>
                      {getStatusBadge(vendor.status)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{vendor.rating.toFixed(1)}</span>
                      </div>
                      <span>•</span>
                      <span>{vendor.totalSales} ta savdo</span>
                      <span>•</span>
                      <span>Komissiya: {vendor.commission}%</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {vendor.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleVendorAction(vendor.id, 'approve')}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Tasdiqlash
                          </button>
                          <button
                            onClick={() => handleVendorAction(vendor.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center gap-2 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Rad etish
                          </button>
                        </>
                      )}
                      {vendor.status === 'active' && (
                        <button
                          onClick={() => handleVendorAction(vendor.id, 'suspend')}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition text-sm"
                        >
                          To'xtatish
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ko'rish
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredVendors.length === 0 && (
              <div className="text-center py-12">
                <Store className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Do'konlar topilmadi</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Vendor Detail Modal */}
      {selectedVendor && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setSelectedVendor(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-gray-900">Do'kon ma'lumotlari</h2>
              <button
                onClick={() => setSelectedVendor(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Banner */}
              {selectedVendor.storeBanner && (
                <div className="h-48 rounded-xl overflow-hidden mb-6">
                  <img
                    src={selectedVendor.storeBanner}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Logo & Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  {selectedVendor.storeLogo ? (
                    <img src={selectedVendor.storeLogo} alt={selectedVendor.storeName} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <Store className="w-10 h-10 text-white" />
                  )}
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">{selectedVendor.storeName}</h3>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(selectedVendor.status)}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <p className="text-gray-600 mb-1">Tavsif:</p>
                  <p className="text-gray-900">{selectedVendor.storeDescription}</p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Manzil:</p>
                  <p className="text-gray-900">{selectedVendor.address}</p>
                </div>
                
                {/* Contact Information */}
                {(selectedVendor.email || selectedVendor.phone || selectedVendor.ownerName) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <h4 className="text-gray-900 font-semibold mb-3">Aloqa ma'lumotlari</h4>
                    <div className="space-y-2">
                      {selectedVendor.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Email:</span>
                          <span className="text-gray-900 font-medium">{selectedVendor.email}</span>
                        </div>
                      )}
                      {selectedVendor.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Telefon:</span>
                          <span className="text-gray-900 font-medium">{selectedVendor.phone}</span>
                        </div>
                      )}
                      {selectedVendor.ownerName && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">Egasi:</span>
                          <span className="text-gray-900 font-medium">{selectedVendor.ownerName}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-600 mb-1">Reyting:</p>
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-gray-900">{selectedVendor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Savdolar:</p>
                    <p className="text-gray-900">{selectedVendor.totalSales}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Komissiya:</p>
                    <p className="text-gray-900">{selectedVendor.commission}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Yaratilgan:</p>
                    <p className="text-gray-900">{new Date(selectedVendor.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-gray-900">Do'konni rad etish</h2>
              <button
                onClick={() => setShowRejectModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-4">Do'konni rad etish uchun sabab bering:</p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full h-24 p-4 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
                placeholder="Sabab..."
              />
              <div className="flex items-center justify-end mt-4">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={() => {
                    if (onRejectWithReason && rejectingVendorId) {
                      onRejectWithReason(rejectingVendorId, rejectionReason);
                      setShowRejectModal(false);
                      setRejectionReason('');
                    }
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
                >
                  Rad etish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}