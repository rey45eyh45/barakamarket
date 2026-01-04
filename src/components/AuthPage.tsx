import { Mail, ArrowRight, Phone, User as UserIcon, Sparkles, Info, LogIn, Shield, Send } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { OTPModal } from './OTPModal';
import { sendOTPCode, verifyOTP } from '../utils/smsService';
import { CustomTelegramLoginButton } from './TelegramLoginButton';

interface AuthPageProps {
  onLogin: () => void;
}

export function AuthPage({ onLogin }: AuthPageProps) {
  const { t } = useLanguage();
  const auth = useAuth();
  const [loginType, setLoginType] = useState<'email' | 'phone'>('phone');
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  // OTP states
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpTestCode, setOtpTestCode] = useState<string | undefined>();
  const [otpLoading, setOTPLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // +998 ni doim saqlab qolish
    if (!value.startsWith('+998')) {
      value = '+998 ';
    }
    
    // Faqat raqamlar, + va bo'sh joy
    value = value.replace(/[^\d+\s]/g, '');
    
    // Format: +998 XX XXX XX XX
    if (value.length > 5) {
      const numbers = value.slice(5).replace(/\s/g, '');
      let formatted = '+998 ';
      
      if (numbers.length > 0) formatted += numbers.slice(0, 2);
      if (numbers.length > 2) formatted += ' ' + numbers.slice(2, 5);
      if (numbers.length > 5) formatted += ' ' + numbers.slice(5, 7);
      if (numbers.length > 7) formatted += ' ' + numbers.slice(7, 9);
      
      value = formatted;
    }
    
    setPhone(value);
  };

  // Send OTP SMS
  const handleSendOTP = async () => {
    setError('');
    setOTPLoading(true);

    try {
      const result = await sendOTPCode(phone, isSignup ? 'signup' : 'login');
      
      if (!result.success) {
        setError(result.message);
        setOTPLoading(false);
        return;
      }

      // Store test code for modal display
      setOtpTestCode(result.code);
      
      // Show OTP modal
      setShowOTPModal(true);
      
      // Also log to console in dev mode
      if (result.code) {
        console.log('🔐 TEST MODE - OTP Code:', result.code);
      }
    } catch (err: any) {
      console.error('SMS yuborishda xatolik:', err);
      setError(err?.message || 'SMS yuborishda xatolik. Qaytadan urinib ko\'ring.');
    } finally {
      setOTPLoading(false);
    }
  };

  // Verify OTP - called from modal
  const handleVerifyOTP = async (code: string) => {
    if (!code || code.length !== 6) {
      throw new Error('6 raqamli kodni kiriting');
    }

    setOTPLoading(true);

    const result = verifyOTP(phone, code);
    
    if (!result.success) {
      setOTPLoading(false);
      throw new Error(result.message);
    }

    // OTP verified, now proceed with signup/login
    try {
      const identifier = loginType === 'email' ? email : phone;
      
      if (isSignup) {
        if (!name.trim()) {
          setOTPLoading(false);
          throw new Error('Ismingizni kiriting');
        }
        await auth.signUp(identifier, 'otp-verified', name);
      } else {
        await auth.signIn(identifier, 'otp-verified');
      }
      
      // Close modal and login
      setShowOTPModal(false);
      onLogin();
    } catch (err: any) {
      console.error('Auth error:', err);
      setOTPLoading(false);
      throw new Error(err.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setOTPLoading(false);
    }
  };

  // Telegram orqali login
  const handleTelegramLogin = async (telegramUser: any) => {
    setLoading(true);
    setError('');
    
    try {
      // Telegram user ma'lumotlari bilan login/signup
      const telegramId = `tg_${telegramUser.id}`;
      const userName = telegramUser.first_name + (telegramUser.last_name ? ' ' + telegramUser.last_name : '');
      
      // Try to sign in first, if fails - sign up
      try {
        await auth.signIn(telegramId, 'telegram-auth');
      } catch {
        // User doesn't exist, create new account
        await auth.signUp(telegramId, 'telegram-auth', userName);
      }
      
      console.log('✅ Telegram login successful:', telegramUser);
      onLogin();
    } catch (err: any) {
      console.error('Telegram auth error:', err);
      setError('Telegram orqali kirishda xatolik. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (isSignup && !name.trim()) {
      setError('Ismingizni kiriting');
      return;
    }

    if (loginType === 'phone') {
      // Validate phone
      if (phone.replace(/\s/g, '').length < 13) {
        setError('To\'liq telefon raqamini kiriting');
        return;
      }
      
      // Send OTP for phone login/signup
      await handleSendOTP();
      return;
    }

    // Email login (without OTP)
    setLoading(true);

    try {
      if (isSignup) {
        await auth.signUp(email, password, name);
      } else {
        await auth.signIn(email, password);
      }
      
      onLogin();
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 bg-amber-300/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-24 h-24 bg-rose-300/10 rounded-full blur-2xl"
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <motion.div
          className="text-center mb-8 flex flex-col items-center"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo size="lg" showText={false} />
          </motion.div>
          <motion.h1
            className="text-white mb-2 mt-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Baraka Market
          </motion.h1>
          <motion.p
            className="text-white/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Platformamizga xush kelibsiz
          </motion.p>
        </motion.div>

        {/* Auth Form */}
        <motion.div
          className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <motion.div
            className="text-center mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div
              className="w-16 h-16 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 180 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {loginType === 'phone' ? (
                  <motion.div
                    key="phone"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Phone className="w-8 h-8 text-orange-600" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="email"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Mail className="w-8 h-8 text-rose-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            <h2 className="text-gray-900 mb-2">
              {isSignup ? 'Ro\'yxatdan o\'tish' : 'Tizimga kirish'}
            </h2>
            <p className="text-gray-500">
              {isSignup ? 'Yangi akkaunt yarating' : 'Ma\'lumotlaringizni kiriting'}
            </p>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Type Switcher */}
            <div className="flex gap-2 mb-4 bg-gray-100 p-1 rounded-xl">
              <motion.button
                type="button"
                onClick={() => setLoginType('phone')}
                className={`flex-1 py-2 rounded-lg transition text-sm relative ${
                  loginType === 'phone'
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loginType === 'phone' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefon
                </span>
              </motion.button>
              <motion.button
                type="button"
                onClick={() => setLoginType('email')}
                className={`flex-1 py-2 rounded-lg transition text-sm relative ${
                  loginType === 'email'
                    ? 'text-white'
                    : 'text-gray-600'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loginType === 'email' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </span>
              </motion.button>
            </div>

            <AnimatePresence mode="wait">
              {isSignup && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <label className="block text-gray-700 mb-2">Ismingiz</label>
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 transition-all"
                      placeholder="Ismingizni kiriting"
                      required={isSignup}
                      whileFocus={{ scale: 1.01, borderColor: '#3b82f6' }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {loginType === 'phone' ? (
                <motion.div
                  key="phone-input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <label className="block text-gray-700 mb-2">Telefon raqam</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 transition-all"
                      placeholder="+998 90 123 45 67"
                      required
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="email-input"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="mb-4"
                >
                  <label className="block text-gray-700 mb-2">Email manzil</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <motion.input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-gray-900 transition-all"
                      placeholder="example@mail.com"
                      required
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className="mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <label className="block text-gray-700 mb-2">Parol</label>
              <div className="relative">
                <motion.input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 transition-all"
                  placeholder="Parolni kiriting"
                  minLength={6}
                  required
                  whileFocus={{ scale: 1.01 }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-500 text-xs">Kamida 6 ta belgi</p>
                {!isSignup && (
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-blue-600 hover:text-blue-700 text-xs transition"
                  >
                    Parolni unutdingizmi?
                  </button>
                )}
              </div>
            </motion.div>



            <motion.button
              type="submit"
              disabled={loading || otpLoading}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white py-3 rounded-xl hover:shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2 overflow-hidden relative"
              whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Animated background */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400"
                animate={{ x: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{ opacity: 0.3 }}
              />
              
              {loading ? (
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Kuting...
                </span>
              ) : (
                <span className="relative z-10 flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {isSignup ? 'Ro\'yxatdan o\'tish' : 'Kirish'}
                </span>
              )}
            </motion.button>
          </form>

          {/* Info about demo mode */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h4 className="text-blue-800 dark:text-blue-200 font-medium text-sm mb-1">Demo rejim</h4>
                <p className="text-blue-600 dark:text-blue-400 text-xs">
                  Telefon raqamingizni kiriting va "Kirish" tugmasini bosing. OTP kod ekranda ko'rsatiladi.
                </p>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <motion.button
              onClick={() => setIsSignup(!isSignup)}
              className="text-purple-600 hover:text-purple-700 transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isSignup 
                ? 'Akkauntingiz bormi? Kiring'
                : 'Akkauntingiz yo\'qmi? Ro\'yxatdan o\'ting'
              }
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Info */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-white text-sm opacity-90">
            Telegram Mini App uchun Baraka Market
          </p>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => setShowForgotPassword(false)}
        />
      )}

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        phone={phone}
        onVerify={handleVerifyOTP}
        onResend={handleSendOTP}
        isSignup={isSignup}
        loading={otpLoading}
        testCode={otpTestCode}
      />
    </div>
  );
}