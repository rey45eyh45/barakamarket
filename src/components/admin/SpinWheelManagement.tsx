import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Gift, BarChart3, Settings, Eye, EyeOff, Save, X, AlertCircle, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SpinWheelPrize, SpinWheelConfig } from '../../types/spinWheel';
import {
  getSpinWheelPrizes,
  saveSpinWheelPrizes,
  getSpinWheelConfig,
  saveSpinWheelConfig
} from '../../utils/spinWheelUtils';
import { toast } from 'sonner@2.0.3';

const PRIZE_TYPES = [
  { id: 'discount', name: 'Chegirma', icon: '💰', needsPercent: true },
  { id: 'free_shipping', name: 'Bepul Yetkazib Berish', icon: '🚚', needsPercent: false },
  { id: 'bonus', name: 'Bonus Ball', icon: '⭐', needsPercent: false },
  { id: 'try_again', name: 'Qaytadan Urinish', icon: '🔄', needsPercent: false },
  { id: 'product', name: 'Mahsulot Sovg\'asi', icon: '🎁', needsPercent: false }
] as const;

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFD93D', '#95E1D3', 
  '#F38181', '#AA96DA', '#FCBAD3', '#FFFFD2',
  '#FF8C42', '#A8E6CF', '#FFB6D9', '#C7CEEA'
];

export function SpinWheelManagement() {
  const [prizes, setPrizes] = useState<SpinWheelPrize[]>([]);
  const [config, setConfig] = useState<SpinWheelConfig | null>(null);
  const [showPrizeModal, setShowPrizeModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingPrize, setEditingPrize] = useState<SpinWheelPrize | null>(null);
  const [selectedTab, setSelectedTab] = useState<'prizes' | 'config' | 'stats'>('prizes');

  const [formData, setFormData] = useState({
    name: '',
    type: 'discount' as SpinWheelPrize['type'],
    description: '',
    discountPercent: 10,
    probability: 10,
    color: PRESET_COLORS[0],
    isActive: true,
    isLimited: true,
    maxClaims: 100,
    displayText: '',
    icon: '🎁'
  });

  const [configForm, setConfigForm] = useState({
    isEnabled: true,
    spinsPerDay: 1,
    title: "Omadli G'ildirak!",
    subtitle: 'Aylantirib, sovg\'a yutib oling!',
    buttonText: 'Aylantirish',
    segments: 8,
    spinDuration: 5000,
    minSpins: 5
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedPrizes = getSpinWheelPrizes();
    const loadedConfig = getSpinWheelConfig();
    setPrizes(loadedPrizes);
    setConfig(loadedConfig);
    setConfigForm({
      isEnabled: loadedConfig.isEnabled,
      spinsPerDay: loadedConfig.spinsPerDay,
      title: loadedConfig.title,
      subtitle: loadedConfig.subtitle,
      buttonText: loadedConfig.buttonText,
      segments: loadedConfig.segments,
      spinDuration: loadedConfig.spinDuration,
      minSpins: loadedConfig.minSpins
    });
  };

  const handleAddPrize = () => {
    if (!formData.name || !formData.description) {
      toast.error('Barcha maydonlarni to\'ldiring!');
      return;
    }

    // Check total probability
    const totalProbability = prizes
      .filter(p => p.id !== editingPrize?.id)
      .reduce((sum, p) => sum + p.probability, 0);

    if (totalProbability + formData.probability > 100) {
      toast.error(`Ehtimollik 100% dan oshmasligi kerak! Hozirgi: ${totalProbability}%`);
      return;
    }

    const newPrize: SpinWheelPrize = {
      id: editingPrize?.id || Date.now().toString(),
      name: formData.name,
      type: formData.type,
      description: formData.description,
      discountPercent: formData.type === 'discount' ? formData.discountPercent : undefined,
      probability: formData.probability,
      color: formData.color,
      isActive: formData.isActive,
      createdAt: editingPrize?.createdAt || new Date().toISOString(),
      claimedCount: editingPrize?.claimedCount || 0,
      isLimited: formData.isLimited,
      maxClaims: formData.maxClaims,
      displayText: formData.displayText,
      icon: formData.icon
    };

    let updatedPrizes;
    if (editingPrize) {
      updatedPrizes = prizes.map(p => p.id === editingPrize.id ? newPrize : p);
      toast.success('Sovg\'a yangilandi!');
    } else {
      updatedPrizes = [...prizes, newPrize];
      toast.success('Yangi sovg\'a qo\'shildi!');
    }

    saveSpinWheelPrizes(updatedPrizes);
    setPrizes(updatedPrizes);
    resetForm();
    setShowPrizeModal(false);
  };

  const handleEditPrize = (prize: SpinWheelPrize) => {
    setEditingPrize(prize);
    setFormData({
      name: prize.name,
      type: prize.type,
      description: prize.description,
      discountPercent: prize.discountPercent || 10,
      probability: prize.probability,
      color: prize.color,
      isActive: prize.isActive,
      isLimited: prize.isLimited || true,
      maxClaims: prize.maxClaims || 100,
      displayText: prize.displayText || '',
      icon: prize.icon || '🎁'
    });
    setShowPrizeModal(true);
  };

  const handleDeletePrize = (id: string) => {
    if (!confirm('Sovg\'ani o\'chirmoqchimisiz?')) return;

    const updatedPrizes = prizes.filter(p => p.id !== id);
    saveSpinWheelPrizes(updatedPrizes);
    setPrizes(updatedPrizes);
    toast.success('Sovg\'a o\'chirildi');
  };

  const handleToggleActive = (id: string) => {
    const updatedPrizes = prizes.map(p =>
      p.id === id ? { ...p, isActive: !p.isActive } : p
    );
    saveSpinWheelPrizes(updatedPrizes);
    setPrizes(updatedPrizes);
    toast.success('Status o\'zgartirildi');
  };

  const handleSaveConfig = () => {
    const updatedConfig: SpinWheelConfig = {
      ...configForm,
      createdAt: config?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveSpinWheelConfig(updatedConfig);
    setConfig(updatedConfig);
    setShowConfigModal(false);
    toast.success('Sozlamalar saqlandi!');
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'discount',
      description: '',
      discountPercent: 10,
      probability: 10,
      color: PRESET_COLORS[0],
      isActive: true,
      isLimited: true,
      maxClaims: 100,
      displayText: '',
      icon: '🎁'
    });
    setEditingPrize(null);
  };

  const totalProbability = prizes.reduce((sum, p) => sum + p.probability, 0);
  const activePrizes = prizes.filter(p => p.isActive).length;
  const totalClaimed = prizes.reduce((sum, p) => sum + (p.claimedCount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">Barabanli O'yin</h1>
          <p className="text-gray-600 dark:text-gray-400">Sovg'alar va sozlamalarni boshqarish</p>
        </div>
        <div className="flex gap-2">
          {/* Toggle Spin Wheel */}
          <button
            onClick={() => {
              const newConfig = { ...config!, isEnabled: !config?.isEnabled };
              saveSpinWheelConfig(newConfig);
              setConfig(newConfig);
              toast.success(
                newConfig.isEnabled 
                  ? '✅ Barabanli o\'yin yoqildi!' 
                  : '❌ Barabanli o\'yin o\'chirildi!'
              );
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              config?.isEnabled
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            }`}
          >
            {config?.isEnabled ? (
              <>
                <Eye className="w-5 h-5" />
                Faol
              </>
            ) : (
              <>
                <EyeOff className="w-5 h-5" />
                O'chirilgan
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowConfigModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
          >
            <Settings className="w-5 h-5" />
            Sozlamalar
          </button>
          <button
            onClick={() => {
              resetForm();
              setShowPrizeModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg transition"
          >
            <Plus className="w-5 h-5" />
            Sovg'a Qo'shish
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Jami Sovg'alar</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{prizes.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Faol Sovg'alar</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activePrizes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Ehtimollik</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProbability}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Yutuqlar</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalClaimed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Probability Warning */}
      {totalProbability !== 100 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-amber-900 dark:text-amber-200 font-medium">
                Diqqat: Ehtimolliklar yig'indisi {totalProbability}% 
                {totalProbability < 100 && ` (${100 - totalProbability}% yetishmayapti)`}
                {totalProbability > 100 && ` (${totalProbability - 100}% ortiqcha)`}
              </p>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                Optimal natija uchun ehtimolliklar yig'indisi 100% bo'lishi kerak
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Prizes Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Sovg'a</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Turi</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Ehtimollik</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Yutuqlar</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {prizes.map((prize) => (
                <tr key={prize.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: prize.color }}
                      >
                        {prize.type === 'discount' && `${prize.discountPercent}%`}
                        {prize.type === 'free_shipping' && '🚚'}
                        {prize.type === 'bonus' && '⭐'}
                        {prize.type === 'try_again' && '🔄'}
                        {prize.type === 'product' && '🎁'}
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">{prize.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{prize.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-700 dark:text-gray-300">
                      {PRIZE_TYPES.find(t => t.id === prize.type)?.icon}
                      {PRIZE_TYPES.find(t => t.id === prize.type)?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full transition-all"
                          style={{ width: `${prize.probability}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium min-w-[40px]">
                        {prize.probability}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-900 dark:text-white font-medium">
                      {prize.claimedCount || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(prize.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition ${
                        prize.isActive
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {prize.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {prize.isActive ? 'Faol' : 'O\'chiq'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditPrize(prize)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeletePrize(prize.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {prizes.length === 0 && (
          <div className="text-center py-12">
            <Gift className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Hozircha sovg'alar yo'q</p>
            <button
              onClick={() => setShowPrizeModal(true)}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition"
            >
              Birinchi sovg'ani qo'shish
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Prize Modal */}
      <AnimatePresence>
        {showPrizeModal && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowPrizeModal(false);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingPrize ? 'Sovg\'ani Tahrirlash' : 'Yangi Sovg\'a Qo\'shish'}
                </h2>
                <button
                  onClick={() => {
                    setShowPrizeModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sovg'a nomi *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="Masalan: 10% Chegirma"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sovg'a turi *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIZE_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFormData({ ...formData, type: type.id as any })}
                        className={`flex items-center gap-2 p-3 rounded-lg border-2 transition ${
                          formData.type === type.id
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                            : 'border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700'
                        }`}
                      >
                        <span className="text-2xl">{type.icon}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{type.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount Percent (only for discount type) */}
                {formData.type === 'discount' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Chegirma foizi *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={formData.discountPercent}
                        onChange={(e) => setFormData({ ...formData, discountPercent: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <div className="flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                          {formData.discountPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tavsif *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    rows={3}
                    placeholder="Sovg'a haqida qisqacha ma'lumot"
                  />
                </div>

                {/* Probability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ehtimollik (%) *
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="1"
                      max="50"
                      value={formData.probability}
                      onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg min-w-[80px]">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formData.probability}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Hozirgi: {totalProbability}% | Qolgan: {100 - totalProbability}%
                  </p>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rang *
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-full aspect-square rounded-lg transition ${
                          formData.color === color ? 'ring-4 ring-offset-2 ring-amber-500' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Display Text - barabanda ko'rsatiladigan text */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Text *
                    </label>
                    <input
                      type="text"
                      value={formData.displayText}
                      onChange={(e) => setFormData({ ...formData, displayText: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                      placeholder="10% yoki Bepul"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Barabanda ko'rsatiladigan qisqa text
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon Emoji *
                    </label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500 text-2xl text-center"
                      placeholder="🎁"
                      maxLength={2}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sovg'a belgisi (emoji)
                    </p>
                  </div>
                </div>

                {/* Prize Limitations */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 dark:text-white font-medium">Sovg'ani cheklash</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sovg'a yutib olishni maksimal miqdorga cheklash
                      </p>
                    </div>
                    <button
                      onClick={() => setFormData({ ...formData, isLimited: !formData.isLimited })}
                      className={`relative w-14 h-8 rounded-full transition ${
                        formData.isLimited ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                          formData.isLimited ? 'translate-x-6' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {formData.isLimited && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Maksimal yutuqlar soni
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={formData.maxClaims}
                        onChange={(e) => setFormData({ ...formData, maxClaims: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        placeholder="100"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Masalan: 100 ta foydalanuvchi bu sovg'ani yutib olishi mumkin
                      </p>
                    </div>
                  )}
                </div>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">Faol holat</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Sovg'ani darhol faollashtirish</p>
                  </div>
                  <button
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative w-14 h-8 rounded-full transition ${
                      formData.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        formData.isActive ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPrizeModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleAddPrize}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editingPrize ? 'Saqlash' : 'Qo\'shish'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowConfigModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full"
            >
              <div className="border-b dark:border-gray-700 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">O'yin Sozlamalari</h2>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">O'yinni faollashtirish</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Foydalanuvchilar uchun ko'rinadi</p>
                  </div>
                  <button
                    onClick={() => setConfigForm({ ...configForm, isEnabled: !configForm.isEnabled })}
                    className={`relative w-14 h-8 rounded-full transition ${
                      configForm.isEnabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                        configForm.isEnabled ? 'translate-x-6' : ''
                      }`}
                    />
                  </button>
                </div>

                {/* Spins Per Day */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kunlik aylanishlar soni
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={configForm.spinsPerDay}
                    onChange={(e) => setConfigForm({ ...configForm, spinsPerDay: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sarlavha
                  </label>
                  <input
                    type="text"
                    value={configForm.title}
                    onChange={(e) => setConfigForm({ ...configForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Subtitle */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Kichik sarlavha
                  </label>
                  <input
                    type="text"
                    value={configForm.subtitle}
                    onChange={(e) => setConfigForm({ ...configForm, subtitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Button Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tugma matni
                  </label>
                  <input
                    type="text"
                    value={configForm.buttonText}
                    onChange={(e) => setConfigForm({ ...configForm, buttonText: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSaveConfig}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Saqlash
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}