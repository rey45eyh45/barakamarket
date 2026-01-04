import { CheckCircle2, Mail, ArrowRight, Clock, Phone } from 'lucide-react';
import { motion } from 'motion/react';

interface VendorRegistrationSuccessProps {
  storeName: string;
  onContinue: () => void;
}

export function VendorRegistrationSuccess({ storeName, onContinue }: VendorRegistrationSuccessProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="w-32 h-32 bg-white rounded-full mx-auto mb-6 flex items-center justify-center shadow-2xl">
            <CheckCircle2 className="w-20 h-20 text-green-600" />
          </div>
          <h1 className="text-white mb-3">Muvaffaqiyatli yuborildi!</h1>
          <p className="text-green-100 text-lg">
            Arizangiz administratorga yuborildi
          </p>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            
            <h1 className="text-gray-900 mb-3">Ariza yuborildi!</h1>
            <p className="text-gray-600 mb-6">
              Arizangiz muvaffaqiyatli yuborildi va ko'rib chiqilmoqda
            </p>

            <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-6 h-6 text-amber-600" />
                <h3 className="text-gray-900 font-semibold">Email orqali xabardor bo'ling</h3>
              </div>
              <p className="text-gray-700 text-sm text-left">
                Arizangiz tasdiqlanganda yoki rad etilganda <span className="font-semibold text-amber-600">sizning email manzilingizga xabar yuboriladi</span>. 
                Iltimos, emailingizni tekshirib turing!
              </p>
            </div>
          </div>

          {/* Store Name */}
          <div className="text-center mb-6 pb-6 border-b border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Do'kon nomi</p>
            <h2 className="text-gray-900">{storeName}</h2>
          </div>

          {/* Status */}
          <div className="bg-yellow-50 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">Kutish rejimida</h3>
                <p className="text-gray-600 text-sm">Status: Ko'rib chiqilmoqda</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">
              Arizangiz 24 soat ichida ko'rib chiqiladi. Admin tasdiqlagandan so'ng sizga 
              bildirishnoma keladi va mahsulot qo'sha boshlashingiz mumkin.
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-4 mb-6">
            <h3 className="text-gray-900">Keyingi qadamlar:</h3>
            
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="text-gray-900 mb-1">Bildirishnomani kuting</p>
                <p className="text-gray-600 text-sm">
                  Admin tasdiqlashi haqida sizga bildirishnoma keladi
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">2</span>
              </div>
              <div>
                <p className="text-gray-900 mb-1">Mahsulotlaringizni qo'shing</p>
                <p className="text-gray-600 text-sm">
                  Tasdiqdan keyin vendor panelingiz ochiladi
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 font-bold">3</span>
              </div>
              <div>
                <p className="text-gray-900 mb-1">Savdo qilishni boshlang</p>
                <p className="text-gray-600 text-sm">
                  Mahsulotlaringiz bozorda ko'rinadi va mijozlar xarid qilishi mumkin
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-6">
            <h3 className="text-gray-900 mb-4">Savol bormi?</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm">support@dreammarket.uz</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-blue-600" />
                <span className="text-sm">+998 90 123 45 67</span>
              </div>
            </div>
          </div>

          {/* Continue Button */}
          <button
            onClick={onContinue}
            className="w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Profilga qaytish</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center"
        >
          <p className="text-white/90 text-sm">
            💡 Maslahat: Tasdiqlangan bo'lganingizdan so'ng mahsulotlaringizni qo'shishni boshlang!
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}