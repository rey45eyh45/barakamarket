import { X, Mail, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ForgotPasswordModalProps {
  onClose: () => void;
}

export function ForgotPasswordModal({ onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<'email' | 'reset' | 'success'>('email');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [userFound, setUserFound] = useState(false);

  const handleCheckEmail = () => {
    setError('');
    
    if (!email.trim()) {
      setError('Email manzilni kiriting!');
      return;
    }

    // Check if email exists in localStorage
    try {
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        
        if (users[email]) {
          setUserFound(true);
          setStep('reset');
        } else {
          setError('Bu email bilan ro\'yxatdan o\'tilmagan!');
        }
      } else {
        setError('Foydalanuvchilar topilmadi!');
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  const handleResetPassword = () => {
    setError('');
    
    if (!newPassword || !confirmPassword) {
      setError('Barcha maydonlarni to\'ldiring!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Parol kamida 6 belgidan iborat bo\'lishi kerak!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Parollar mos kelmaydi!');
      return;
    }

    // Update password in localStorage
    try {
      const usersData = localStorage.getItem('users');
      if (usersData) {
        const users = JSON.parse(usersData);
        
        if (users[email]) {
          users[email].password = newPassword;
          localStorage.setItem('users', JSON.stringify(users));
          setStep('success');
        } else {
          setError('Foydalanuvchi topilmadi!');
        }
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white">Parolni tiklash</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {/* Step 1: Enter Email */}
            {step === 'email' && (
              <motion.div
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-gray-600 text-sm">
                    Ro'yxatdan o'tgan email manzilingizni kiriting
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Email manzil</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="email@example.com"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleCheckEmail}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
                >
                  Davom etish
                </button>

                <div className="text-center">
                  <button
                    onClick={onClose}
                    className="text-gray-600 text-sm hover:text-gray-800 transition"
                  >
                    Bekor qilish
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Reset Password */}
            {step === 'reset' && (
              <motion.div
                key="reset"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-purple-600" />
                </div>
                
                <div className="text-center mb-6">
                  <p className="text-gray-900 mb-1">{email}</p>
                  <p className="text-gray-600 text-sm">
                    Yangi parolni kiriting
                  </p>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Yangi parol</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Kamida 6 belgidan iborat"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 mb-2 text-sm">Parolni tasdiqlash</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Parolni qayta kiriting"
                    />
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleResetPassword}
                  className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                >
                  Parolni o'zgartirish
                </button>

                <div className="text-center">
                  <button
                    onClick={() => setStep('email')}
                    className="text-gray-600 text-sm hover:text-gray-800 transition"
                  >
                    Orqaga
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Success */}
            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </motion.div>
                
                <h3 className="text-gray-900 mb-2">Parol muvaffaqiyatli o'zgartirildi!</h3>
                <p className="text-gray-600 text-sm mb-6">
                  Endi yangi parol bilan tizimga kirishingiz mumkin
                </p>

                <button
                  onClick={onClose}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                >
                  Tizimga kirish
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        {step === 'email' && (
          <div className="bg-gray-50 px-6 py-4 border-t">
            <p className="text-gray-600 text-xs text-center">
              💡 Agar muammo bo'lsa, qo'llab-quvvatlash xizmatiga murojaat qiling:{' '}
              <a href="tel:+998901234567" className="text-blue-600 hover:underline">
                +998 90 123 45 67
              </a>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
