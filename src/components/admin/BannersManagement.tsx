import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Eye, X } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  position: 'main' | 'sidebar' | 'footer';
  order: number;
  isActive: boolean;
  createdAt: string;
}

export function BannersManagement() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    linkUrl: '',
    position: 'main' as 'main' | 'sidebar' | 'footer',
    order: 1,
    isActive: true
  });

  // Load banners from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('admin_banners');
    if (saved) {
      setBanners(JSON.parse(saved));
    } else {
      // Default banners
      const defaultBanners: Banner[] = [
        {
          id: '1',
          title: 'Yozgi chegirma!',
          description: '50% gacha chegirma barcha mahsulotlarga',
          imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
          linkUrl: '/sales',
          position: 'main',
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          title: 'Yangi kolleksiya',
          description: 'Eng yangi mahsulotlar bizda',
          imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
          linkUrl: '/new',
          position: 'main',
          order: 2,
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          title: 'Bepul yetkazib berish',
          description: '100,000 so\'mdan ortiq xaridlarga',
          imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
          linkUrl: '/delivery',
          position: 'sidebar',
          order: 1,
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
      setBanners(defaultBanners);
      localStorage.setItem('admin_banners', JSON.stringify(defaultBanners));
    }
  }, []);

  const saveBanners = (updatedBanners: Banner[]) => {
    setBanners(updatedBanners);
    localStorage.setItem('admin_banners', JSON.stringify(updatedBanners));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBanner) {
      // Update existing banner
      const updated = banners.map(b =>
        b.id === editingBanner.id
          ? { ...b, ...formData }
          : b
      );
      saveBanners(updated);
    } else {
      // Add new banner
      const newBanner: Banner = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      saveBanners([...banners, newBanner]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      linkUrl: '',
      position: 'main',
      order: banners.length + 1,
      isActive: true
    });
    setEditingBanner(null);
    setShowModal(false);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || '',
      position: banner.position,
      order: banner.order,
      isActive: banner.isActive
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Bannerni o\'chirmoqchimisiz?')) {
      saveBanners(banners.filter(b => b.id !== id));
    }
  };

  const toggleActive = (id: string) => {
    const updated = banners.map(b =>
      b.id === id ? { ...b, isActive: !b.isActive } : b
    );
    saveBanners(updated);
  };

  const getPositionLabel = (position: string) => {
    const labels = {
      main: 'Asosiy',
      sidebar: 'Yon panel',
      footer: 'Pastki qism'
    };
    return labels[position as keyof typeof labels];
  };

  const activeBanners = banners.filter(b => b.isActive).length;

  return (
    <div className="p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">Banner boshqaruvi</h1>
          <p className="text-gray-600 dark:text-gray-400">Reklama bannerlarini boshqaring</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Banner qo'shish</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Jami bannerlar</p>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">{banners.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Faol bannerlar</p>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">{activeBanners}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Asosiy bannerlar</p>
              <p className="text-gray-900 dark:text-white text-2xl font-bold">
                {banners.filter(b => b.position === 'main').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Banners List */}
      <div className="space-y-4">
        {banners.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Hozircha bannerlar yo'q</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Birinchi bannerni qo'shish
            </button>
          </div>
        ) : (
          banners.sort((a, b) => a.order - b.order).map((banner) => (
            <div
              key={banner.id}
              className={`bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition hover:shadow-md ${
                !banner.isActive ? 'opacity-50' : ''
              }`}
            >
              <div className="flex gap-4">
                {/* Banner Image */}
                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Banner Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-gray-900 dark:text-white font-semibold mb-1">{banner.title}</h3>
                      {banner.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{banner.description}</p>
                      )}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      banner.isActive
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {banner.isActive ? 'Faol' : 'Nofaol'}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                    <span>📍 {getPositionLabel(banner.position)}</span>
                    <span>🔢 Tartib: {banner.order}</span>
                    {banner.linkUrl && <span>🔗 Link mavjud</span>}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleActive(banner.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition ${
                        banner.isActive
                          ? 'bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                      }`}
                    >
                      {banner.isActive ? 'Nofaol qilish' : 'Faol qilish'}
                    </button>
                    <button
                      onClick={() => handleEdit(banner)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition text-sm"
                    >
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={resetForm}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10 flex items-center justify-between">
              <h2 className="text-gray-900 dark:text-white font-semibold text-xl">
                {editingBanner ? 'Bannerni tahrirlash' : 'Yangi banner qo\'shish'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Sarlavha *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Masalan: Yozgi chegirma!"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Tavsif</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="Qisqacha tavsif"
                  rows={3}
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Rasm URL *</label>
                <input
                  type="url"
                  required
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-2">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3C/svg%3E';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Link URL */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Havola (Link)</label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                  placeholder="/sales yoki https://example.com"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Joylashuv *</label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                >
                  <option value="main">Asosiy</option>
                  <option value="sidebar">Yon panel</option>
                  <option value="footer">Pastki qism</option>
                </select>
              </div>

              {/* Order */}
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2 font-medium">Tartib raqami *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
                />
                <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">Kichik raqam birinchi ko'rinadi</p>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <label htmlFor="isActive" className="text-gray-700 dark:text-gray-300">
                  Bannerni darhol faol qilish
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
                >
                  {editingBanner ? 'Saqlash' : 'Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
