import { Phone, Mail, MessageCircle, MapPin, Clock, Save, RotateCcw, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SupportSettings {
  phone: string;
  email: string;
  telegram: string;
  office_address: string;
  office_city: string;
  working_hours_weekday: string;
  working_hours_weekend: string;
}

const DEFAULT_SETTINGS: SupportSettings = {
  phone: '+998 90 123 45 67',
  email: 'support@dreammarket.uz',
  telegram: '@dreammarket_support',
  office_address: 'Amir Temur ko\'chasi, 129-uy',
  office_city: 'Toshkent sh., Yunusobod tumani',
  working_hours_weekday: '9:00 - 21:00',
  working_hours_weekend: '10:00 - 18:00'
};

export function SupportManagement() {
  const [settings, setSettings] = useState<SupportSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<SupportSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = () => {
    try {
      const saved = localStorage.getItem('support_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        setOriginalSettings(parsed);
      } else {
        // Save default settings if not exists
        localStorage.setItem('support_settings', JSON.stringify(DEFAULT_SETTINGS));
        setSettings(DEFAULT_SETTINGS);
        setOriginalSettings(DEFAULT_SETTINGS);
      }
    } catch (error) {
      console.error('Error loading support settings:', error);
    }
  };

  const handleSave = () => {
    try {
      localStorage.setItem('support_settings', JSON.stringify(settings));
      setOriginalSettings(settings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'support_settings',
        newValue: JSON.stringify(settings)
      }));
    } catch (error) {
      console.error('Error saving support settings:', error);
      alert('Xatolik yuz berdi!');
    }
  };

  const handleReset = () => {
    if (confirm('O\'zgarishlarni bekor qilmoqchimisiz?')) {
      setSettings(originalSettings);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Standart sozlamalarga qaytarmoqchimisiz?')) {
      setSettings(DEFAULT_SETTINGS);
    }
  };

  const updateField = (field: keyof SupportSettings, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 mb-2">Qo'llab-quvvatlash sozlamalari</h1>
          <p className="text-gray-600">
            Kontakt ma'lumotlari va ish vaqtini boshqaring
          </p>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Bekor qilish
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4" />
            Saqlash
          </button>
        </div>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">Sozlamalar muvaffaqiyatli saqlandi!</p>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-blue-600" />
          Kontakt ma'lumotlari
        </h2>

        <div className="space-y-4">
          {/* Phone */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              <Phone className="w-4 h-4 inline mr-1" />
              Telefon raqami
            </label>
            <input
              type="tel"
              value={settings.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+998 90 123 45 67"
            />
            <p className="text-gray-500 text-xs mt-1">
              To'liq formatda kiriting: +998 XX XXX XX XX
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              <Mail className="w-4 h-4 inline mr-1" />
              Email manzil
            </label>
            <input
              type="email"
              value={settings.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="support@dreammarket.uz"
            />
          </div>

          {/* Telegram */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              <MessageCircle className="w-4 h-4 inline mr-1" />
              Telegram username
            </label>
            <input
              type="text"
              value={settings.telegram}
              onChange={(e) => updateField('telegram', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="@dreammarket_support"
            />
            <p className="text-gray-500 text-xs mt-1">
              @ belgisi bilan birga kiriting
            </p>
          </div>
        </div>
      </div>

      {/* Office Address */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-red-600" />
          Ofis manzili
        </h2>

        <div className="space-y-4">
          {/* City/Region */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Shahar va tuman
            </label>
            <input
              type="text"
              value={settings.office_city}
              onChange={(e) => updateField('office_city', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Toshkent sh., Yunusobod tumani"
            />
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Ko'cha va uy raqami
            </label>
            <textarea
              value={settings.office_address}
              onChange={(e) => updateField('office_address', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Amir Temur ko'chasi, 129-uy"
            />
          </div>
        </div>
      </div>

      {/* Working Hours */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          Ish vaqti
        </h2>

        <div className="space-y-4">
          {/* Weekdays */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Dushanba - Juma
            </label>
            <input
              type="text"
              value={settings.working_hours_weekday}
              onChange={(e) => updateField('working_hours_weekday', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="9:00 - 21:00"
            />
          </div>

          {/* Weekends */}
          <div>
            <label className="block text-gray-700 mb-2 text-sm">
              Shanba - Yakshanba
            </label>
            <input
              type="text"
              value={settings.working_hours_weekend}
              onChange={(e) => updateField('working_hours_weekend', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10:00 - 18:00"
            />
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 p-6">
        <h2 className="text-gray-900 mb-4">Namoyish</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-gray-700 text-sm">Telefon</p>
              <p className="text-gray-900">{settings.phone}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-gray-700 text-sm">Email</p>
              <p className="text-gray-900">{settings.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5 text-sky-600" />
            <div>
              <p className="text-gray-700 text-sm">Telegram</p>
              <p className="text-gray-900">{settings.telegram}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="text-gray-700 text-sm">Ofis manzili</p>
              <p className="text-gray-900">{settings.office_city}</p>
              <p className="text-gray-900">{settings.office_address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-gray-700 text-sm">Ish vaqti</p>
              <p className="text-gray-900 text-sm">
                Dushanba - Juma: {settings.working_hours_weekday}
              </p>
              <p className="text-gray-900 text-sm">
                Shanba - Yakshanba: {settings.working_hours_weekend}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset to Default */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-900 mb-1">Standart sozlamalarga qaytarish</p>
            <p className="text-gray-600 text-sm">
              Barcha o'zgarishlar bekor qilinadi va dastlabki sozlamalar tiklanadi
            </p>
          </div>
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition"
          >
            Tiklash
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 mb-1">💡 Eslatma</p>
        <p className="text-blue-700 text-sm">
          O'zgarishlar saqlangandan so'ng barcha foydalanuvchilar "Yordam" sahifasida yangi ma'lumotlarni ko'rishadi.
        </p>
      </div>
    </div>
  );
}
