import { ArrowLeft, MapPin, Plus, Edit2, Trash2, Home, Building2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface AddressesPageProps {
  onBack: () => void;
}

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  address: string;
  city: string;
  region: string;
  phone: string;
  isDefault: boolean;
}

export function AddressesPage({ onBack }: AddressesPageProps) {
  const { t } = useLanguage();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    label: '',
    address: '',
    city: 'Toshkent',
    region: 'Toshkent shahri',
    phone: '',
    isDefault: false
  });

  // Load addresses from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('delivery_addresses');
    if (saved) {
      setAddresses(JSON.parse(saved));
    }
  }, []);

  // Save addresses to localStorage
  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    localStorage.setItem('delivery_addresses', JSON.stringify(newAddresses));
  };

  const handleAddAddress = () => {
    if (!formData.label || !formData.address || !formData.phone) {
      alert('Barcha majburiy maydonlarni to\'ldiring!');
      return;
    }

    const newAddress: Address = {
      id: `addr_${Date.now()}`,
      ...formData
    };

    // If this is the first address or marked as default, make it default
    const updatedAddresses = formData.isDefault || addresses.length === 0
      ? addresses.map(a => ({ ...a, isDefault: false })).concat(newAddress)
      : [...addresses, newAddress];

    saveAddresses(updatedAddresses);
    resetForm();
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    const updatedAddresses = addresses.map(a =>
      a.id === editingAddress.id
        ? { ...formData, id: editingAddress.id }
        : formData.isDefault
        ? { ...a, isDefault: false }
        : a
    );

    saveAddresses(updatedAddresses);
    resetForm();
  };

  const handleDeleteAddress = (id: string) => {
    if (confirm('Manzilni o\'chirmoqchimisiz?')) {
      const updatedAddresses = addresses.filter(a => a.id !== id);
      
      // If deleted address was default, make first address default
      if (updatedAddresses.length > 0 && !updatedAddresses.some(a => a.isDefault)) {
        updatedAddresses[0].isDefault = true;
      }
      
      saveAddresses(updatedAddresses);
    }
  };

  const handleSetDefault = (id: string) => {
    const updatedAddresses = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    saveAddresses(updatedAddresses);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      label: address.label,
      address: address.address,
      city: address.city,
      region: address.region,
      phone: address.phone,
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      label: '',
      address: '',
      city: 'Toshkent',
      region: 'Toshkent shahri',
      phone: '',
      isDefault: false
    });
    setShowAddForm(false);
    setEditingAddress(null);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="w-5 h-5" />;
      case 'work':
        return <Building2 className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'home':
        return { text: 'text-blue-600', bg: 'bg-blue-100' };
      case 'work':
        return { text: 'text-orange-600', bg: 'bg-orange-100' };
      default:
        return { text: 'text-green-600', bg: 'bg-green-100' };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 px-4 py-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-gray-900">Manzillar</h1>
              <p className="text-gray-500 text-sm">Yetkazib berish manzillari</p>
            </div>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {showAddForm ? (
          /* Add/Edit Form */
          <div className="bg-white rounded-lg p-4 space-y-4">
            <h2 className="text-gray-900">
              {editingAddress ? 'Manzilni tahrirlash' : 'Yangi manzil qo\'shish'}
            </h2>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Manzil turi</label>
              <div className="grid grid-cols-3 gap-2">
                {['home', 'work', 'other'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, type: type as any })}
                    className={`p-3 rounded-lg border-2 transition ${
                      formData.type === type
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-1">
                      {getTypeIcon(type)}
                      <span className="text-xs">
                        {type === 'home' ? 'Uy' : type === 'work' ? 'Ish' : 'Boshqa'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Nomi *</label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masalan: Uyim, Ofisim"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">To'liq manzil *</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Ko'cha, uy, xonadon raqami"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-700 mb-2 text-sm">Shahar</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 text-sm">Viloyat</label>
                <input
                  type="text"
                  value={formData.region}
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Telefon raqami *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+998 90 123 45 67"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-700">Asosiy manzil qilib belgilash</span>
            </label>

            <div className="flex gap-3 pt-2">
              <button
                onClick={resetForm}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editingAddress ? 'Saqlash' : 'Qo\'shish'}
              </button>
            </div>
          </div>
        ) : addresses.length > 0 ? (
          /* Addresses List */
          <div className="space-y-3">
            {addresses.map((address) => {
              const colors = getTypeColor(address.type);
              return (
                <div key={address.id} className="bg-white rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      {getTypeIcon(address.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-gray-900">{address.label}</p>
                        {address.isDefault && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                            Asosiy
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                      <p className="text-gray-500 text-sm">{address.city}, {address.region}</p>
                      <p className="text-gray-500 text-sm">{address.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Asosiy qilish
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(address)}
                      className="flex-1 px-3 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Tahrirlash
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="flex-1 px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition text-sm flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      O'chirish
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-900 mb-2">Saqlangan manzillar yo'q</p>
            <p className="text-gray-500 text-sm mb-6">
              Yetkazib berish manzilini qo'shing
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              Manzil qo'shish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
