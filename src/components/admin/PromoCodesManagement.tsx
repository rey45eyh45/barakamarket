import { useState, useEffect, useMemo } from 'react';
import { PromoCode } from '../../types';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Download, 
  Upload, 
  Percent, 
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Check,
  X,
  AlertCircle,
  Copy,
  CheckCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button, IconButton } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { getPromoCodes, savePromoCodes } from '../../utils/storage';
import { toast } from 'sonner@2.0.3';

export function PromoCodesManagement() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: 0,
    description: '',
    minOrderAmount: 0,
    maxDiscount: 0,
    usageLimit: 100,
    userLimit: 1,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true
  });

  // Load promo codes
  useEffect(() => {
    loadPromoCodes();
  }, []);

  const loadPromoCodes = async () => {
    setLoading(true);
    try {
      const codes = await getPromoCodes();
      setPromoCodes(codes);
    } catch (error) {
      console.error('Error loading promo codes:', error);
      toast.error('Promo kodlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  // Filter promo codes
  const filteredCodes = useMemo(() => {
    return promoCodes.filter(code => 
      code.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      code.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [promoCodes, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const active = promoCodes.filter(c => c.isActive).length;
    const totalUsed = promoCodes.reduce((sum, c) => sum + c.usedCount, 0);
    const avgUsage = promoCodes.length > 0 ? totalUsed / promoCodes.length : 0;
    
    return {
      total: promoCodes.length,
      active,
      inactive: promoCodes.length - active,
      totalUsed,
      avgUsage: Math.round(avgUsage * 10) / 10
    };
  }, [promoCodes]);

  const handleAddNew = () => {
    setEditingCode(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      description: '',
      minOrderAmount: 0,
      maxDiscount: 0,
      usageLimit: 100,
      userLimit: 1,
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      isActive: true
    });
    setShowModal(true);
  };

  const handleEdit = (code: PromoCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      type: code.type,
      value: code.value,
      description: code.description,
      minOrderAmount: code.minOrderAmount,
      maxDiscount: code.maxDiscount || 0,
      usageLimit: code.usageLimit,
      userLimit: code.userLimit,
      validFrom: code.validFrom.split('T')[0],
      validUntil: code.validUntil.split('T')[0],
      isActive: code.isActive
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.code.trim()) {
      toast.error('Promo kod kiritilmagan!');
      return;
    }

    if (formData.value <= 0) {
      toast.error('Chegirma qiymati 0 dan katta bo\'lishi kerak!');
      return;
    }

    if (formData.type === 'percentage' && formData.value > 100) {
      toast.error('Chegirma foizi 100 dan oshmasligi kerak!');
      return;
    }

    // Check if code already exists (when adding new)
    const codeExists = promoCodes.some(
      c => c.code.toUpperCase() === formData.code.toUpperCase() && c.id !== editingCode?.id
    );
    if (codeExists) {
      toast.error('Bu promo kod allaqachon mavjud!');
      return;
    }

    try {
      const now = new Date().toISOString();
      
      if (editingCode) {
        // Update existing code
        const updatedCodes = promoCodes.map(code =>
          code.id === editingCode.id
            ? {
                ...code,
                code: formData.code.toUpperCase(),
                type: formData.type,
                value: formData.value,
                description: formData.description,
                minOrderAmount: formData.minOrderAmount,
                maxDiscount: formData.maxDiscount || undefined,
                usageLimit: formData.usageLimit,
                userLimit: formData.userLimit,
                validFrom: new Date(formData.validFrom).toISOString(),
                validUntil: new Date(formData.validUntil).toISOString(),
                isActive: formData.isActive,
                updatedAt: now
              }
            : code
        );
        setPromoCodes(updatedCodes);
        await savePromoCodes(updatedCodes);
        toast.success('Promo kod yangilandi! 🎉');
      } else {
        // Add new code
        const newCode: PromoCode = {
          id: Date.now().toString(),
          code: formData.code.toUpperCase(),
          type: formData.type,
          value: formData.value,
          description: formData.description,
          minOrderAmount: formData.minOrderAmount,
          maxDiscount: formData.maxDiscount || undefined,
          usageLimit: formData.usageLimit,
          usedCount: 0,
          userLimit: formData.userLimit,
          validFrom: new Date(formData.validFrom).toISOString(),
          validUntil: new Date(formData.validUntil).toISOString(),
          isActive: formData.isActive,
          createdAt: now,
          updatedAt: now
        };
        const updatedCodes = [...promoCodes, newCode];
        setPromoCodes(updatedCodes);
        await savePromoCodes(updatedCodes);
        toast.success('Yangi promo kod qo\'shildi! 🎉');
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving promo code:', error);
      toast.error('Saqlashda xatolik yuz berdi!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu promo kodni o\'chirmoqchimisiz?')) return;

    try {
      const updatedCodes = promoCodes.filter(code => code.id !== id);
      setPromoCodes(updatedCodes);
      await savePromoCodes(updatedCodes);
      toast.success('Promo kod o\'chirildi!');
    } catch (error) {
      console.error('Error deleting promo code:', error);
      toast.error('O\'chirishda xatolik yuz berdi!');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const updatedCodes = promoCodes.map(code =>
        code.id === id
          ? { ...code, isActive: !code.isActive, updatedAt: new Date().toISOString() }
          : code
      );
      setPromoCodes(updatedCodes);
      await savePromoCodes(updatedCodes);
      toast.success('Status o\'zgartirildi!');
    } catch (error) {
      console.error('Error toggling status:', error);
      toast.error('Status o\'zgartirishda xatolik!');
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(promoCodes, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promo-codes-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Promo kodlar eksport qilindi! 📥');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        if (!Array.isArray(imported)) {
          toast.error('Noto\'g\'ri fayl formati!');
          return;
        }
        setPromoCodes(imported);
        await savePromoCodes(imported);
        toast.success(`${imported.length} ta promo kod import qilindi! 📤`);
      } catch (error) {
        console.error('Error importing:', error);
        toast.error('Import qilishda xatolik!');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Kod nusxalandi! 📋');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isExpired = (validUntil: string) => {
    return new Date(validUntil) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Promo Kodlar</h1>
          <p className="text-gray-600 dark:text-gray-400">Chegirma kodlarini boshqaring</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="w-5 h-5 mr-2" />
          Yangi Kod
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Jami</p>
              <p className="text-2xl mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Faol</p>
              <p className="text-2xl text-green-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Faol emas</p>
              <p className="text-2xl text-red-600 mt-1">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ishlatilgan</p>
              <p className="text-2xl mt-1">{stats.totalUsed}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">O'rtacha</p>
              <p className="text-2xl mt-1">{stats.avgUsage}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Promo kod yoki tavsif bo'yicha qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Eksport
            </Button>
            <label>
              <Button variant="outline" as="span">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </Card>

      {/* Promo Codes Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Kod</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Turi</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Chegirma</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Min. Summa</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Amal Qilish</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Foydalanish</th>
                <th className="px-6 py-3 text-left text-xs uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs uppercase tracking-wider">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              <AnimatePresence mode="popLayout">
                {filteredCodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {searchQuery ? 'Qidiruv natijasi topilmadi' : 'Hech qanday promo kod yo\'q'}
                    </td>
                  </tr>
                ) : (
                  filteredCodes.map((code) => (
                    <motion.tr
                      key={code.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded font-mono">
                            {code.code}
                          </code>
                          <button
                            onClick={() => copyCode(code.code)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {copiedCode === code.code ? (
                              <CheckCheck className="w-4 h-4 text-green-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {code.description && (
                          <p className="text-sm text-gray-500 mt-1">{code.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {code.type === 'percentage' ? (
                            <>
                              <Percent className="w-4 h-4 text-purple-600" />
                              <span className="text-sm">Foiz</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4 h-4 text-green-600" />
                              <span className="text-sm">Fix Summa</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          {code.type === 'percentage' ? (
                            <span className="text-purple-600">{code.value}%</span>
                          ) : (
                            <span className="text-green-600">{formatPrice(code.value)}</span>
                          )}
                          {code.maxDiscount && code.maxDiscount > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                              Max: {formatPrice(code.maxDiscount)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm">{formatPrice(code.minOrderAmount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-1 text-green-600">
                            <Calendar className="w-3 h-3" />
                            {formatDate(code.validFrom)}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${
                            isExpired(code.validUntil) ? 'text-red-600' : 'text-orange-600'
                          }`}>
                            <Calendar className="w-3 h-3" />
                            {formatDate(code.validUntil)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div>
                            <span className={code.usedCount >= code.usageLimit ? 'text-red-600' : ''}>
                              {code.usedCount}
                            </span>
                            <span className="text-gray-500"> / {code.usageLimit}</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            User: {code.userLimit}x
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleStatus(code.id)}
                          className={`px-3 py-1 rounded-full text-xs transition-colors ${
                            code.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}
                        >
                          {code.isActive ? 'Faol' : 'Faol emas'}
                        </button>
                        {isExpired(code.validUntil) && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mt-2">
                            <AlertCircle className="w-3 h-3" />
                            Muddati o'tgan
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <IconButton
                            onClick={() => handleEdit(code)}
                            variant="ghost"
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Edit2 className="w-4 h-4" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDelete(code.id)}
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </IconButton>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl">
                  {editingCode ? 'Promo Kodni Tahrirlash' : 'Yangi Promo Kod'}
                </h2>
              </div>

              <div className="p-6 space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm mb-2">
                    Promo Kod <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    className="uppercase"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Faqat harflar va raqamlar. Avtomatik katta harfga o'tkaziladi.
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm mb-2">Tavsif</label>
                  <Input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Yozgi chegirma"
                  />
                </div>

                {/* Type & Value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Turi</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                    >
                      <option value="percentage">Foiz (%)</option>
                      <option value="fixed">Fix Summa (so'm)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">
                      Qiymat <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                      placeholder={formData.type === 'percentage' ? '10' : '50000'}
                      min={0}
                      max={formData.type === 'percentage' ? 100 : undefined}
                    />
                  </div>
                </div>

                {/* Min Order & Max Discount */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Min. Buyurtma Summasi (so'm)</label>
                    <Input
                      type="number"
                      value={formData.minOrderAmount}
                      onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                      placeholder="100000"
                      min={0}
                    />
                  </div>
                  {formData.type === 'percentage' && (
                    <div>
                      <label className="block text-sm mb-2">Max. Chegirma (so'm)</label>
                      <Input
                        type="number"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                        placeholder="50000"
                        min={0}
                      />
                      <p className="text-xs text-gray-500 mt-1">0 = cheklovsiz</p>
                    </div>
                  )}
                </div>

                {/* Usage Limits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Umumiy Foydalanish Limiti</label>
                    <Input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                      placeholder="100"
                      min={1}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Har Bir User Limiti</label>
                    <Input
                      type="number"
                      value={formData.userLimit}
                      onChange={(e) => setFormData({ ...formData, userLimit: Number(e.target.value) })}
                      placeholder="1"
                      min={1}
                    />
                  </div>
                </div>

                {/* Valid Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm mb-2">Boshlanish Sanasi</label>
                    <Input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm mb-2">Tugash Sanasi</label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm">Faol</label>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Bekor qilish
                </Button>
                <Button onClick={handleSave}>
                  {editingCode ? 'Saqlash' : 'Qo\'shish'}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
