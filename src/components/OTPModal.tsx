import { useState, useRef, useEffect } from 'react';
import { X, Phone, ArrowLeft, RefreshCw, Shield, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  phone: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  isSignup?: boolean;
  loading?: boolean;
  testCode?: string; // For development mode
}

export function OTPModal({
  isOpen,
  onClose,
  phone,
  onVerify,
  onResend,
  isSignup = false,
  loading = false,
  testCode
}: OTPModalProps) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Start countdown when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      setError('');
      // Focus first input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all filled
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(['', '', '', '', '', '']).slice(0, 6);
    setOtp(newOtp);
    
    // Focus last filled input or first empty
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (code: string) => {
    setError('');
    try {
      await onVerify(code);
    } catch (err: any) {
      setError(err.message || 'Tasdiqlash kodida xatolik');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setResendLoading(true);
    setError('');
    
    try {
      await onResend();
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'SMS yuborishda xatolik');
    } finally {
      setResendLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-white relative overflow-hidden">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>

            {/* Title */}
            <h2 className="text-center mb-2">SMS Tasdiqlash</h2>
            <p className="text-blue-100 text-center text-sm">
              Quyidagi raqamga kod yuborildi
            </p>
            
            {/* Phone number */}
            <div className="mt-4 flex items-center justify-center gap-2 bg-white/10 rounded-lg px-4 py-2">
              <Phone className="w-4 h-4" />
              <span className="font-medium">{phone}</span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Instructions */}
            <p className="text-gray-600 dark:text-gray-400 text-sm text-center mb-4">
              6 raqamli kodni kiriting
            </p>

            {/* Demo mode - show test code */}
            {testCode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-200 dark:border-green-700 rounded-xl p-4"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Info className="w-4 h-4 text-green-600" />
                  <span className="text-green-700 dark:text-green-300 text-sm font-medium">Demo rejim - Tasdiqlash kodi:</span>
                </div>
                <div className="flex justify-center gap-2">
                  {testCode.split('').map((digit, i) => (
                    <span 
                      key={i}
                      className="w-10 h-12 flex items-center justify-center bg-white dark:bg-gray-800 border-2 border-green-400 rounded-lg text-xl font-bold text-green-600"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
                <p className="text-green-600 dark:text-green-400 text-xs text-center mt-2">
                  Yuqoridagi kodni quyiga kiriting
                </p>
              </motion.div>
            )}

            {/* OTP Input */}
            <div className="flex gap-2 justify-center mb-4" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el: HTMLInputElement | null) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`
                    w-12 h-14 text-center text-2xl font-bold
                    border-2 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    transition-all
                    ${digit ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
                    ${error ? 'border-red-500 shake' : ''}
                    text-gray-900 dark:text-white
                    dark:bg-gray-700
                  `}
                  whileFocus={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>

            {/* Error message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
                >
                  <p className="text-red-700 dark:text-red-300 text-sm text-center">
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Resend button */}
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Qayta yuborish: <span className="font-medium">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${resendLoading ? 'animate-spin' : ''}`} />
                  {resendLoading ? 'Yuborilmoqda...' : 'Kodni qayta yuborish'}
                </button>
              )}
            </div>

            {/* Verify button */}
            <button
              onClick={() => handleVerify(otp.join(''))}
              disabled={otp.some(d => !d) || loading}
              className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Tekshirilmoqda...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Tasdiqlash
                </>
              )}
            </button>

            {/* Help text */}
            <p className="text-gray-500 dark:text-gray-400 text-xs text-center mt-4">
              Kod kelmadimi? Telefon raqamingizni tekshiring
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}