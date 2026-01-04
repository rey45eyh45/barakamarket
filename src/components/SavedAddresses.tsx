import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Home, 
  Briefcase, 
  Heart, 
  Star,
  Edit2,
  Trash2,
  Plus,
  Check,
  X
} from 'lucide-react';
import { SavedAddress, useSavedAddresses } from '../hooks/useSavedAddresses';
import { useTelegram } from '../contexts/TelegramContext';
import { toast } from 'sonner@2.0.3';

interface SavedAddressesProps {
  userId: string;
  onSelect?: (address: SavedAddress) => void;
  selectedAddressId?: string;
  showAddButton?: boolean;
}

export function SavedAddresses({ 
  userId, 
  onSelect, 
  selectedAddressId,
  showAddButton = true 
}: SavedAddressesProps) {
  const { addresses, defaultAddress, setAsDefault, deleteAddress } = useSavedAddresses(userId);
  const { haptic } = useTelegram();
  const [showAddForm, setShowAddForm] = useState(false);

  const getLabelIcon = (label: string) => {
    const lower = label.toLowerCase();
    if (lower.includes('uy') || lower.includes('home')) return Home;
    if (lower.includes('ish') || lower.includes('work') || lower.includes('office')) return Briefcase;
    if (lower.includes('ona') || lower.includes('ota') || lower.includes('parent')) return Heart;
    return MapPin;
  };

  const handleSelect = (address: SavedAddress) => {
    if (onSelect) {
      onSelect(address);
      haptic.light();
    }
  };

  const handleSetDefault = async (id: string) => {
    const result = await setAsDefault(id);
    if (result.success) {
      haptic.success();
      toast.success('Standart manzil o\'zgardi');
    } else {
      haptic.error();
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Bu manzilni o\'chirmoqchimisiz?')) return;

    const result = await deleteAddress(id);
    if (result.success) {
      haptic.success();
      toast.success('Manzil o\'chirildi');
    } else {
      haptic.error();
      toast.error(result.error || 'Xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
          <MapPin className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          Saqlangan manzillar
        </h3>
        
        {showAddButton && (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            <Plus className="w-4 h-4" />
            Yangi qo'shish
          </button>
        )}
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Saqlangan manzillar yo'q
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Birinchi manzilni qo'shish
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map((address) => {
            const Icon = getLabelIcon(address.label);
            const isSelected = selectedAddressId === address.id;
            
            return (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleSelect(address)}
                className={`
                  relative bg-white dark:bg-gray-800 rounded-xl p-4 border-2 transition cursor-pointer
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {/* Default Badge */}
                {address.isDefault && (
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">
                      <Star className="w-3 h-3 fill-current" />
                      Standart
                    </div>
                  </div>
                )}

                {/* Selected Check */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0
                    ${isSelected 
                      ? 'bg-blue-100 dark:bg-blue-800/50' 
                      : 'bg-gray-100 dark:bg-gray-700'
                    }
                  `}>
                    <Icon className={`w-6 h-6 ${
                      isSelected 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-semibold ${
                        isSelected 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : 'text-gray-900 dark:text-white'
                      }`}>
                        {address.label}
                      </h4>
                    </div>

                    <p className={`text-sm mb-2 ${
                      isSelected 
                        ? 'text-blue-700 dark:text-blue-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {address.fullName} • {address.phone}
                    </p>

                    <p className={`text-sm ${
                      isSelected 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      {address.address}, {address.city}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                  {!address.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id);
                      }}
                      className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                    >
                      <Star className="w-3 h-3" />
                      Standart qilish
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      // Edit functionality can be added
                    }}
                    className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition ml-auto"
                  >
                    <Edit2 className="w-3 h-3" />
                    Tahrirlash
                  </button>

                  <button
                    onClick={(e) => handleDelete(address.id, e)}
                    className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition"
                  >
                    <Trash2 className="w-3 h-3" />
                    O'chirish
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Address Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <AddressFormModal
            userId={userId}
            onClose={() => setShowAddForm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Add/Edit Address Form Modal
interface AddressFormModalProps {
  userId: string;
  address?: SavedAddress;
  onClose: () => void;
}

function AddressFormModal({ userId, address, onClose }: AddressFormModalProps) {
  const { addAddress, updateAddress } = useSavedAddresses(userId);
  const { haptic } = useTelegram();
  
  const [formData, setFormData] = useState({
    label: address?.label || '',
    fullName: address?.fullName || '',
    phone: address?.phone || '',
    address: address?.address || '',
    city: address?.city || '',
    region: address?.region || '',
    postalCode: address?.postalCode || '',
    isDefault: address?.isDefault || false
  });

  const predefinedLabels = ['Uy', 'Ish', 'Ona-otam', 'Do\'stlar'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (address) {
      // Update existing
      const result = await updateAddress(address.id, formData);
      if (result.success) {
        haptic.success();
        toast.success('Manzil yangilandi');
        onClose();
      } else {
        haptic.error();
        toast.error('Xatolik yuz berdi');
      }
    } else {
      // Add new
      const result = await addAddress(formData);
      if (result.success) {
        haptic.success();
        toast.success('Manzil qo\'shildi');
        onClose();
      } else {
        haptic.error();
        toast.error('Xatolik yuz berdi');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <h3 className="text-gray-900 dark:text-white font-semibold">
            {address ? 'Manzilni tahrirlash' : 'Yangi manzil'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Yorliq
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {predefinedLabels.map(label => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setFormData({ ...formData, label })}
                  className={`
                    px-3 py-2 rounded-lg text-sm font-medium transition
                    ${formData.label === label
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  {label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              placeholder="Yoki boshqa yorliq kiriting"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              To'liq ism
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              placeholder="Ism Familiya"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Telefon raqam
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+998 90 123 45 67"
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              required
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Manzil
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ko'cha, uy, xonadon"
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
              required
            />
          </div>

          {/* City & Region */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Shahar
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Toshkent"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Viloyat
              </label>
              <input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                placeholder="Toshkent sh."
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>

          {/* Default Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Standart manzil sifatida belgilash
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
          >
            {address ? 'Saqlash' : 'Qo\'shish'}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}
