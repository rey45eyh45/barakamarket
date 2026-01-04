import { Settings, Bell, Shield, DollarSign, Palette, Globe, Save, Truck, CreditCard, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export function SettingsManagement() {
  const [settings, setSettings] = useState({
    // General
    siteName: 'Baraka Market',
    siteDescription: 'Multi-vendor marketplace',
    maintenanceMode: false,
    contactEmail: 'support@dreammarket.uz',
    contactPhone: '+998 90 123 45 67',
    
    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    
    // Commission
    defaultCommission: 10,
    minCommission: 5,
    maxCommission: 30,
    
    // Security
    twoFactorAuth: false,
    loginAttempts: 5,
    sessionTimeout: 30,
    
    // Delivery
    freeDeliveryThreshold: 500000,
    standardDeliveryPrice: 25000,
    expressDeliveryPrice: 50000,
    
    // Payment
    cashOnDelivery: true,
    cardPayment: true,
    onlinePayment: false,
    
    // SEO
    metaTitle: 'Baraka Market - Online Do\'kon',
    metaDescription: 'O\'zbekistondagi eng yaxshi online marketplace',
    metaKeywords: 'online shop, marketplace, uzbekistan',
    
    // Appearance
    primaryColor: '#3b82f6',
    darkMode: true
  });

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
    
    // Also sync with theme in localStorage
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setSettings(prev => ({ ...prev, darkMode: true }));
    } else if (theme === 'light') {
      setSettings(prev => ({ ...prev, darkMode: false }));
    }
  }, []);

  // Update theme in localStorage when darkMode changes
  useEffect(() => {
    localStorage.setItem('theme', settings.darkMode ? 'dark' : 'light');
    
    // Dispatch storage event to notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'theme',
      newValue: settings.darkMode ? 'dark' : 'light',
      storageArea: localStorage
    }));
  }, [settings.darkMode]);

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(settings));
    alert('Sozlamalar saqlandi!');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900 dark:text-white mb-2">Tizim sozlamalari</h1>
          <p className="text-gray-600 dark:text-gray-400">Platforma sozlamalarini boshqarish</p>
        </div>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2 font-medium"
        >
          <Save className="w-5 h-5" />
          Saqlash
        </button>
      </div>

      {/* General Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Asosiy sozlamalar</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Platforma asosiy parametrlari</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Sayt nomi
            </label>
            <input
              type="text"
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Sayt tavsifi
            </label>
            <textarea
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Texnik ishlar rejimi</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Saytni vaqtincha yopish</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Kontakt email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Kontakt telefon
            </label>
            <input
              type="text"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Bildirishnomalar</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Xabarnoma sozlamalari</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Email bildirishnomalar</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Pochta orqali xabarlar</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, emailNotifications: !settings.emailNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">SMS bildirishnomalar</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">SMS orqali xabarlar</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, smsNotifications: !settings.smsNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Push bildirishnomalar</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Mobil push xabarlar</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, pushNotifications: !settings.pushNotifications })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.pushNotifications ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Commission Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Komissiya sozlamalari</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Platform komissiyasi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Standart komissiya (%)
            </label>
            <input
              type="number"
              value={settings.defaultCommission}
              onChange={(e) => setSettings({ ...settings, defaultCommission: Number(e.target.value) })}
              min={settings.minCommission}
              max={settings.maxCommission}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Minimal komissiya (%)
            </label>
            <input
              type="number"
              value={settings.minCommission}
              onChange={(e) => setSettings({ ...settings, minCommission: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Maksimal komissiya (%)
            </label>
            <input
              type="number"
              value={settings.maxCommission}
              onChange={(e) => setSettings({ ...settings, maxCommission: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Xavfsizlik</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Himoya sozlamalari</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Ikki faktorli autentifikatsiya</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Qo'shimcha himoya qatlami</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, twoFactorAuth: !settings.twoFactorAuth })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Maksimal kirish urinishlari
              </label>
              <input
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => setSettings({ ...settings, loginAttempts: Number(e.target.value) })}
                min={3}
                max={10}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
                Sessiya vaqti (daqiqa)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: Number(e.target.value) })}
                min={15}
                max={120}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Truck className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Yetkazib berish</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Yetkazib berish sozlamalari</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Beerpul yetkazib berish chegarasi (so'm)
            </label>
            <input
              type="number"
              value={settings.freeDeliveryThreshold}
              onChange={(e) => setSettings({ ...settings, freeDeliveryThreshold: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Standart yetkazib berish narxi (so'm)
            </label>
            <input
              type="number"
              value={settings.standardDeliveryPrice}
              onChange={(e) => setSettings({ ...settings, standardDeliveryPrice: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Tez yetkazib berish narxi (so'm)
            </label>
            <input
              type="number"
              value={settings.expressDeliveryPrice}
              onChange={(e) => setSettings({ ...settings, expressDeliveryPrice: Number(e.target.value) })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Payment Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">To\'lovlar</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">To\'lov sozlamalari</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Yetkazib berishda to\'lov</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Yetkazib berishda to\'lov qilish</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, cashOnDelivery: !settings.cashOnDelivery })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.cashOnDelivery ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.cashOnDelivery ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Plastik kartaga to\'lov</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Plastik kartaga to\'lov qilish</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, cardPayment: !settings.cardPayment })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.cardPayment ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.cardPayment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Onlayn to\'lov</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Onlayn to\'lov qilish</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, onlinePayment: !settings.onlinePayment })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.onlinePayment ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.onlinePayment ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* SEO Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">SEO sozlamalari</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">SEO sozlamalari</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Meta title
            </label>
            <input
              type="text"
              value={settings.metaTitle}
              onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Meta description
            </label>
            <textarea
              value={settings.metaDescription}
              onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Meta keywords
            </label>
            <input
              type="text"
              value={settings.metaKeywords}
              onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Palette className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-gray-900 dark:text-white font-semibold">Ko\'rinish</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Platforma ko\'rinishi</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              Asosiy rang
            </label>
            <input
              type="color"
              value={settings.primaryColor}
              onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-gray-900 dark:text-white font-medium">Qorong\'il rejimi</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Qorong\'il rejimi</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, darkMode: !settings.darkMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                settings.darkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settings.darkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}