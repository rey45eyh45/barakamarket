import { useState, useEffect } from 'react';
import { Truck, Plus, Edit2, Trash2, X, Save, MapPin, DollarSign, Clock, Package, AlertCircle, Check, Search, Download, Upload } from 'lucide-react';
import { ShippingZone, ShippingMethod } from '../../types/shipping';
import { getShippingZones, getShippingMethods, saveShippingZones, saveShippingMethods } from '../../utils/storage';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

export function ShippingManagement() {
  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [activeTab, setActiveTab] = useState<'zones' | 'methods'>('zones');
  const [searchQuery, setSearchQuery] = useState('');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [showMethodModal, setShowMethodModal] = useState(false);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(null);

  // Zone Form
  const [zoneForm, setZoneForm] = useState({
    name: '',
    isActive: true
  });

  // Method Form
  const [methodForm, setMethodForm] = useState({
    zoneId: '',
    name: '',
    description: '',
    deliveryTime: '',
    type: 'fixed' as 'fixed' | 'weight' | 'price',
    baseCost: 0,
    costPerKg: 0,
    freeShippingThreshold: 0,
    costPercentage: 0,
    maxCost: 0,
    isActive: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const zonesData = await getShippingZones();
    const methodsData = await getShippingMethods();
    setZones(zonesData);
    setMethods(methodsData);
  };

  // Zone Operations
  const openZoneModal = (zone?: ShippingZone) => {
    if (zone) {
      setEditingZone(zone);
      setZoneForm({
        name: zone.name,
        isActive: zone.isActive
      });
    } else {
      setEditingZone(null);
      setZoneForm({
        name: '',
        isActive: true
      });
    }
    setShowZoneModal(true);
  };

  const handleSaveZone = async () => {
    if (!zoneForm.name.trim()) {
      toast.error('Hudud nomini kiriting!');
      return;
    }

    const now = new Date().toISOString();

    if (editingZone) {
      // Update
      const updated = zones.map(z =>
        z.id === editingZone.id
          ? { ...z, ...zoneForm, updatedAt: now }
          : z
      );
      await saveShippingZones(updated);
      setZones(updated);
      toast.success('Hudud yangilandi!');
    } else {
      // Create
      const newZone: ShippingZone = {
        id: Date.now().toString(),
        ...zoneForm,
        createdAt: now,
        updatedAt: now
      };
      const updated = [...zones, newZone];
      await saveShippingZones(updated);
      setZones(updated);
      toast.success('Yangi hudud qo\'shildi!');
    }

    setShowZoneModal(false);
  };

  const handleDeleteZone = async (id: string) => {
    // Check if zone has methods
    const hasMethodsInZone = methods.some(m => m.zoneId === id);
    if (hasMethodsInZone) {
      toast.error('Bu hududda yetkazish usullari mavjud! Avval ularni o\'chiring.');
      return;
    }

    if (confirm('Hududni o\'chirmoqchimisiz?')) {
      const updated = zones.filter(z => z.id !== id);
      await saveShippingZones(updated);
      setZones(updated);
      toast.success('Hudud o\'chirildi!');
    }
  };

  // Method Operations
  const openMethodModal = (method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method);
      setMethodForm({
        zoneId: method.zoneId,
        name: method.name,
        description: method.description,
        deliveryTime: method.deliveryTime,
        type: method.type,
        baseCost: method.baseCost,
        costPerKg: method.costPerKg || 0,
        freeShippingThreshold: method.freeShippingThreshold || 0,
        costPercentage: method.costPercentage || 0,
        maxCost: method.maxCost || 0,
        isActive: method.isActive
      });
    } else {
      setEditingMethod(null);
      setMethodForm({
        zoneId: zones.length > 0 ? zones[0].id : '',
        name: '',
        description: '',
        deliveryTime: '',
        type: 'fixed',
        baseCost: 0,
        costPerKg: 0,
        freeShippingThreshold: 0,
        costPercentage: 0,
        maxCost: 0,
        isActive: true
      });
    }
    setShowMethodModal(true);
  };

  const handleSaveMethod = async () => {
    if (!methodForm.name.trim()) {
      toast.error('Usul nomini kiriting!');
      return;
    }
    if (!methodForm.zoneId) {
      toast.error('Hududni tanlang!');
      return;
    }
    if (methodForm.baseCost < 0) {
      toast.error('Narx musbat bo\'lishi kerak!');
      return;
    }

    const now = new Date().toISOString();

    if (editingMethod) {
      // Update
      const updated = methods.map(m =>
        m.id === editingMethod.id
          ? { ...m, ...methodForm, updatedAt: now }
          : m
      );
      await saveShippingMethods(updated);
      setMethods(updated);
      toast.success('Usul yangilandi!');
    } else {
      // Create
      const newMethod: ShippingMethod = {
        id: Date.now().toString(),
        ...methodForm,
        createdAt: now,
        updatedAt: now
      };
      const updated = [...methods, newMethod];
      await saveShippingMethods(updated);
      setMethods(updated);
      toast.success('Yangi usul qo\'shildi!');
    }

    setShowMethodModal(false);
  };

  const handleDeleteMethod = async (id: string) => {
    if (confirm('Usulni o\'chirmoqchimisiz?')) {
      const updated = methods.filter(m => m.id !== id);
      await saveShippingMethods(updated);
      setMethods(updated);
      toast.success('Usul o\'chirildi!');
    }
  };

  const handleToggleMethodStatus = async (id: string) => {
    const updated = methods.map(m =>
      m.id === id
        ? { ...m, isActive: !m.isActive, updatedAt: new Date().toISOString() }
        : m
    );
    await saveShippingMethods(updated);
    setMethods(updated);
  };

  const handleToggleZoneStatus = async (id: string) => {
    const updated = zones.map(z =>
      z.id === id
        ? { ...z, isActive: !z.isActive, updatedAt: new Date().toISOString() }
        : z
    );
    await saveShippingZones(updated);
    setZones(updated);
  };

  // Export/Import
  const handleExport = () => {
    const data = {
      zones,
      methods,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shipping-data-${Date.now()}.json`;
    a.click();
    toast.success('Ma\'lumotlar yuklandi!');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.zones) {
          await saveShippingZones(data.zones);
          setZones(data.zones);
        }
        if (data.methods) {
          await saveShippingMethods(data.methods);
          setMethods(data.methods);
        }
        toast.success('Ma\'lumotlar import qilindi!');
      } catch (error) {
        toast.error('Import xatolik!');
      }
    };
    reader.readAsText(file);
  };

  // Filter
  const filteredZones = zones.filter(z =>
    z.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMethods = methods.filter(m => {
    const zone = zones.find(z => z.id === m.zoneId);
    return (
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const getZoneName = (zoneId: string) => {
    return zones.find(z => z.id === zoneId)?.name || 'Noma\'lum';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            Yetkazib berish
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Yetkazib berish hududlari va usullarini boshqaring
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <label className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          {activeTab === 'zones' ? (
            <button
              onClick={() => openZoneModal()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Yangi hudud
            </button>
          ) : (
            <button
              onClick={() => openMethodModal()}
              disabled={zones.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Yangi usul
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab('zones')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'zones'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <MapPin className="w-4 h-4 inline mr-2" />
          Hududlar ({zones.length})
        </button>
        <button
          onClick={() => setActiveTab('methods')}
          className={`px-4 py-2 border-b-2 transition-colors ${
            activeTab === 'methods'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Usullar ({methods.length})
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={activeTab === 'zones' ? 'Hududni qidirish...' : 'Usulni qidirish...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      {activeTab === 'zones' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredZones.map((zone) => (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                    {zone.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {methods.filter(m => m.zoneId === zone.id).length} ta usul
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleZoneStatus(zone.id)}
                    className={`p-1.5 rounded transition-colors ${
                      zone.isActive
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                    title={zone.isActive ? 'Faol' : 'Faol emas'}
                  >
                    {zone.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => openZoneModal(zone)}
                  className="flex-1 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Tahrirlash
                </button>
                <button
                  onClick={() => handleDeleteZone(zone.id)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {filteredZones.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-600 dark:text-gray-400">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Hech qanday hudud topilmadi</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMethods.map((method) => (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {method.name}
                    </h3>
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                      {getZoneName(method.zoneId)}
                    </span>
                    <button
                      onClick={() => handleToggleMethodStatus(method.id)}
                      className={`px-2 py-1 rounded text-xs ${
                        method.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {method.isActive ? 'Faol' : 'Faol emas'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {method.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {method.deliveryTime}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {formatPrice(method.baseCost)}
                      </span>
                    </div>
                    {method.type === 'weight' && method.costPerKg ? (
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {formatPrice(method.costPerKg)}/kg
                        </span>
                      </div>
                    ) : null}
                    {method.freeShippingThreshold && method.freeShippingThreshold > 0 ? (
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Bepul: {formatPrice(method.freeShippingThreshold)}+
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openMethodModal(method)}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMethod(method.id)}
                    className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredMethods.length === 0 && (
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Hech qanday usul topilmadi</p>
            </div>
          )}
        </div>
      )}

      {/* Zone Modal */}
      <AnimatePresence>
        {showZoneModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowZoneModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingZone ? 'Hududni tahrirlash' : 'Yangi hudud qo\'shish'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hudud nomi *
                  </label>
                  <input
                    type="text"
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                    placeholder="Masalan: Toshkent shahri"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="zoneActive"
                    checked={zoneForm.isActive}
                    onChange={(e) => setZoneForm({ ...zoneForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="zoneActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Faol
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowZoneModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSaveZone}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Method Modal */}
      <AnimatePresence>
        {showMethodModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowMethodModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6 max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingMethod ? 'Usulni tahrirlash' : 'Yangi usul qo\'shish'}
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hudud *
                  </label>
                  <select
                    value={methodForm.zoneId}
                    onChange={(e) => setMethodForm({ ...methodForm, zoneId: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Hududni tanlang</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Usul nomi *
                  </label>
                  <input
                    type="text"
                    value={methodForm.name}
                    onChange={(e) => setMethodForm({ ...methodForm, name: e.target.value })}
                    placeholder="Masalan: Standart yetkazish"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tavsif
                  </label>
                  <textarea
                    value={methodForm.description}
                    onChange={(e) => setMethodForm({ ...methodForm, description: e.target.value })}
                    placeholder="Yetkazish haqida qisqacha ma'lumot"
                    rows={2}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Yetkazish vaqti
                  </label>
                  <input
                    type="text"
                    value={methodForm.deliveryTime}
                    onChange={(e) => setMethodForm({ ...methodForm, deliveryTime: e.target.value })}
                    placeholder="Masalan: 1-3 kun"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hisoblash turi *
                  </label>
                  <select
                    value={methodForm.type}
                    onChange={(e) => setMethodForm({ ...methodForm, type: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="fixed">Fix narx</option>
                    <option value="weight">Og'irlikka qarab</option>
                    <option value="price">Buyurtma summasiga qarab (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Asosiy narx (so'm) *
                  </label>
                  <input
                    type="number"
                    value={methodForm.baseCost}
                    onChange={(e) => setMethodForm({ ...methodForm, baseCost: Number(e.target.value) })}
                    min="0"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {methodForm.type === 'weight' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Har kg uchun (so'm)
                    </label>
                    <input
                      type="number"
                      value={methodForm.costPerKg}
                      onChange={(e) => setMethodForm({ ...methodForm, costPerKg: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}

                {methodForm.type === 'price' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Foiz (%)
                      </label>
                      <input
                        type="number"
                        value={methodForm.costPercentage}
                        onChange={(e) => setMethodForm({ ...methodForm, costPercentage: Number(e.target.value) })}
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maksimal narx (so'm)
                      </label>
                      <input
                        type="number"
                        value={methodForm.maxCost}
                        onChange={(e) => setMethodForm({ ...methodForm, maxCost: Number(e.target.value) })}
                        min="0"
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bepul yetkazish chegarasi (so'm)
                  </label>
                  <input
                    type="number"
                    value={methodForm.freeShippingThreshold}
                    onChange={(e) => setMethodForm({ ...methodForm, freeShippingThreshold: Number(e.target.value) })}
                    min="0"
                    placeholder="0 - bepul yetkazish yo'q"
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="methodActive"
                    checked={methodForm.isActive}
                    onChange={(e) => setMethodForm({ ...methodForm, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="methodActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Faol
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowMethodModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSaveMethod}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}