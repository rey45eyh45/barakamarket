import { ArrowLeft, Settings, User, Lock, Eye, EyeOff, Shield, Trash2, Download, Upload, CheckCircle, Mail, KeyRound, AlertCircle, Database, HardDrive } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  createBackup, 
  exportBackupToFile, 
  importBackupFromFile, 
  restoreBackup, 
  getStorageStats, 
  formatBytes,
  validateDataIntegrity,
  clearAllAppData
} from '../utils/dataBackup';

interface SettingsPageProps {
  onBack: () => void;
  userEmail: string;
}

export function SettingsPage({ onBack, userEmail }: SettingsPageProps) {
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Email change states
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Password reset states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [showResetCodeInput, setShowResetCodeInput] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [generatedResetCode, setGeneratedResetCode] = useState('');

  const handleChangePassword = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Barcha maydonlarni to\'ldiring!');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      alert('Yangi parollar mos kelmaydi!');
      return;
    }
    
    if (newPassword.length < 6) {
      alert('Parol kamida 6 belgidan iborat bo\'lishi kerak!');
      return;
    }

    // Get users from localStorage
    const usersData = localStorage.getItem('users');
    if (usersData) {
      const users = JSON.parse(usersData);
      
      if (users[userEmail]) {
        // Check old password
        if (users[userEmail].password !== oldPassword) {
          alert('Eski parol noto\'g\'ri!');
          return;
        }
        
        // Update password
        users[userEmail].password = newPassword;
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('Parol muvaffaqiyatli o\'zgartirildi!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    }
  };

  const handleChangeEmail = () => {
    if (!newEmail || !emailPassword) {
      alert('Barcha maydonlarni to\'ldiring!');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      alert('Email formati noto\'g\'ri!');
      return;
    }

    // Get users from localStorage
    const usersData = localStorage.getItem('users');
    if (!usersData) return;

    const users = JSON.parse(usersData);

    // Check if current user exists
    if (!users[userEmail]) {
      alert('Foydalanuvchi topilmadi!');
      return;
    }

    // Verify password
    if (users[userEmail].password !== emailPassword) {
      alert('Parol noto\'g\'ri!');
      return;
    }

    // Check if new email already exists
    if (users[newEmail]) {
      alert('Bu email allaqachon ro\'yxatdan o\'tgan!');
      return;
    }

    // Update email
    const userData = users[userEmail];
    delete users[userEmail];
    users[newEmail] = userData;
    users[newEmail].email = newEmail;
    
    localStorage.setItem('users', JSON.stringify(users));
    
    alert('Email muvaffaqiyatli o\'zgartirildi! Qaytadan kirish uchun yangi emaildan foydalaning.');
    
    // Logout user
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleSendResetCode = () => {
    if (!resetEmail) {
      alert('Emailni kiriting!');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      alert('Email formati noto\'g\'ri!');
      return;
    }

    // Check if user exists
    const usersData = localStorage.getItem('users');
    if (!usersData) {
      alert('Foydalanuvchi topilmadi!');
      return;
    }

    const users = JSON.parse(usersData);
    if (!users[resetEmail]) {
      alert('Bu email ro\'yxatdan o\'tmagan!');
      return;
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedResetCode(code);
    setShowResetCodeInput(true);

    // In real app, this would be sent via email
    alert(`Tasdiqlash kodi: ${code}\n\n(Bu demo rejim. Real ilovada kod emailga yuboriladi)`);
  };

  const handleVerifyResetCode = () => {
    if (resetCode !== generatedResetCode) {
      alert('Kod noto\'g\'ri!');
      return;
    }

    if (!resetNewPassword || !resetConfirmPassword) {
      alert('Parollarni kiriting!');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      alert('Parollar mos kelmaydi!');
      return;
    }

    if (resetNewPassword.length < 6) {
      alert('Parol kamida 6 belgidan iborat bo\'lishi kerak!');
      return;
    }

    // Update password
    const usersData = localStorage.getItem('users');
    if (!usersData) return;

    const users = JSON.parse(usersData);
    if (users[resetEmail]) {
      users[resetEmail].password = resetNewPassword;
      localStorage.setItem('users', JSON.stringify(users));

      alert('Parol muvaffaqiyatli tiklandi! Yangi parol bilan kiring.');
      
      // Reset states and close modal
      setShowResetModal(false);
      setResetEmail('');
      setResetCode('');
      setResetNewPassword('');
      setResetConfirmPassword('');
      setShowResetCodeInput(false);
      setGeneratedResetCode('');
    }
  };

  const handleExportData = () => {
    try {
      // Collect all user data
      const data = {
        favorites: localStorage.getItem('favorites'),
        cart: localStorage.getItem('cart'),
        orders: localStorage.getItem('orders'),
        notification_settings: localStorage.getItem('notification_settings'),
        exportDate: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `dreammarket_data_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      alert('Ma\'lumotlar muvaffaqiyatli eksport qilindi!');
    } catch (error) {
      alert('Xatolik yuz berdi!');
    }
  };

  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target?.result as string);
            
            // Restore data
            if (data.favorites) localStorage.setItem('favorites', data.favorites);
            if (data.cart) localStorage.setItem('cart', data.cart);
            if (data.orders) localStorage.setItem('orders', data.orders);
            if (data.notification_settings) localStorage.setItem('notification_settings', data.notification_settings);
            
            alert('Ma\'lumotlar muvaffaqiyatli import qilindi! Sahifani yangilang.');
          } catch (error) {
            alert('Fayl noto\'g\'ri formatda!');
          }
        };
        reader.readAsText(file);
      }
    };
    
    input.click();
  };

  const handleClearCache = () => {
    if (confirm('Keshni tozalashni xohlaysizmi? Bu harakatni bekor qilib bo\'lmaydi.')) {
      // Clear only cache, not user data
      const keysToKeep = ['users', 'favorites', 'cart', 'orders', 'all_products'];
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.some(k => key.includes(k))) {
          localStorage.removeItem(key);
        }
      });
      
      alert('Kesh tozalandi!');
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('Haqiqatan ham akkauntni o\'chirmoqchimisiz? Bu harakatni bekor qilib bo\'lmaydi!')) {
      const finalConfirm = prompt('O\'chirish uchun "DELETE" so\'zini kiriting:');
      if (finalConfirm === 'DELETE') {
        // Remove user from users list
        const usersData = localStorage.getItem('users');
        if (usersData) {
          const users = JSON.parse(usersData);
          delete users[userEmail];
          localStorage.setItem('users', JSON.stringify(users));
        }
        
        // Clear user data
        localStorage.removeItem('favorites');
        localStorage.removeItem('cart');
        localStorage.removeItem('orders');
        
        alert('Akkount o\'chirildi. Tizimdan chiqayapsiz...');
        window.location.reload();
      }
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
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-gray-900">Sozlamalar</h1>
              <p className="text-gray-500 text-sm">Hisob va xavfsizlik sozlamalari</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Account Info */}
        <div>
          <h2 className="text-gray-900 mb-3 px-2">Hisob ma'lumotlari</h2>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-blue-600" />
              <p className="text-gray-900">Email</p>
            </div>
            <p className="text-gray-600 ml-8">{userEmail}</p>
          </div>
        </div>

        {/* Change Password */}
        <div>
          <div className="flex items-center justify-between mb-3 px-2">
            <h2 className="text-gray-900">Parolni o'zgartirish</h2>
            <button
              onClick={() => setShowResetModal(true)}
              className="text-blue-600 text-sm hover:text-blue-700 transition flex items-center gap-1"
            >
              <KeyRound className="w-4 h-4" />
              Parolni unutdingizmi?
            </button>
          </div>
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Eski parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Eski parolni kiriting"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Yangi parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yangi parolni kiriting"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Yangi parolni tasdiqlash</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yangi parolni qayta kiriting"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Parolni o'zgartirish
            </button>
          </div>
        </div>

        {/* Change Email */}
        <div>
          <h2 className="text-gray-900 mb-3 px-2">Emailni o'zgartirish</h2>
          <div className="bg-white rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-gray-700 mb-2 text-sm">Yangi email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Yangi emailni kiriting"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 text-sm">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Parolni kiriting"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleChangeEmail}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Emailni o'zgartirish
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div>
          <h2 className="text-gray-900 mb-3 px-2">Ma'lumotlarni boshqarish</h2>
          <div className="bg-white rounded-lg divide-y">
            <button
              onClick={handleExportData}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 mb-1">Ma'lumotlarni eksport qilish</p>
                <p className="text-gray-500 text-sm">Barcha ma'lumotlarni yuklab olish</p>
              </div>
            </button>

            <button
              onClick={handleImportData}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 mb-1">Ma'lumotlarni import qilish</p>
                <p className="text-gray-500 text-sm">Avval saqlangan ma'lumotlarni yuklash</p>
              </div>
            </button>

            <button
              onClick={handleClearCache}
              className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition"
            >
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-gray-900 mb-1">Keshni tozalash</p>
                <p className="text-gray-500 text-sm">Vaqtinchalik fayllarni o'chirish</p>
              </div>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div>
          <h2 className="text-red-600 mb-3 px-2">Xavfli zona</h2>
          <div className="bg-white rounded-lg border-2 border-red-200">
            <button
              onClick={handleDeleteAccount}
              className="w-full p-4 flex items-center gap-4 hover:bg-red-50 transition"
            >
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-red-600 mb-1">Akkauntni o'chirish</p>
                <p className="text-gray-500 text-sm">Bu harakatni bekor qilib bo'lmaydi!</p>
              </div>
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-900 mb-1">Xavfsizlik</p>
              <p className="text-blue-700 text-sm">
                Biz sizning ma'lumotlaringizni himoya qilamiz. Parolingiz shifrlangan holda saqlanadi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowResetModal(false);
            setResetEmail('');
            setResetCode('');
            setResetNewPassword('');
            setResetConfirmPassword('');
            setShowResetCodeInput(false);
            setGeneratedResetCode('');
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-gray-900">Parolni tiklash</h2>
                <p className="text-gray-500 text-sm">Emailga tasdiqlash kodi yuboriladi</p>
              </div>
            </div>

            {!showResetCodeInput ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Email manzil</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email kiriting"
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-800 text-sm">
                      Bu demo rejim. Real ilovada tasdiqlash kodi emailga yuboriladi.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleSendResetCode}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Tasdiqlash kodi yuborish
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Tasdiqlash kodi</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="6 raqamli kodni kiriting"
                      maxLength={6}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Yangi parol</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Yangi parolni kiriting"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Parolni tasdiqlash</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Parolni qayta kiriting"
                    />
                  </div>
                </div>

                <button
                  onClick={handleVerifyResetCode}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Parolni tiklash
                </button>

                <button
                  onClick={() => {
                    setShowResetCodeInput(false);
                    setResetCode('');
                    setResetNewPassword('');
                    setResetConfirmPassword('');
                    setGeneratedResetCode('');
                  }}
                  className="w-full text-gray-600 py-2 text-sm hover:text-gray-900 transition"
                >
                  ← Orqaga qaytish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}