import { useState } from 'react';
import { Store, ArrowRight, Check, Mail, Phone, MapPin, User, FileText, Image } from 'lucide-react';

interface VendorRegistrationProps {
  onSubmit: (data: {
    storeName: string;
    storeDescription: string;
    address: string;
    phone: string;
    email: string;
    ownerName: string;
    businessLicense?: string;
    logo?: string;
  }) => void;
  onCancel: () => void;
}

export function VendorRegistration({ onSubmit, onCancel }: VendorRegistrationProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    storeName: '',
    storeDescription: '',
    address: '',
    phone: '',
    email: '',
    ownerName: '',
    category: 'general',
    businessLicense: '',
    logo: '',
    agreeToTerms: false
  });

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    if (formData.agreeToTerms) {
      onSubmit({
        storeName: formData.storeName,
        storeDescription: formData.storeDescription,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        ownerName: formData.ownerName,
        businessLicense: formData.businessLicense,
        logo: formData.logo
      });
    }
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.storeName.trim() && formData.category;
      case 2:
        return formData.storeDescription.trim() && formData.address.trim();
      case 3:
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailValid = emailRegex.test(formData.email);
        const isPhoneValid = formData.phone.trim().length >= 9; // Minimum 9 digits
        const isOwnerNameValid = formData.ownerName.trim().length >= 3;
        
        return isPhoneValid && isEmailValid && isOwnerNameValid && formData.agreeToTerms;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-2xl">
            <Store className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-white mb-2">Hamkor bo'ling!</h1>
          <p className="text-blue-100">O'z do'koningizni oching va mahsulotlaringizni soting</p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
                  step >= num
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 text-white'
                }`}
              >
                {step > num ? <Check className="w-6 h-6" /> : num}
              </div>
              {num < 3 && (
                <div
                  className={`w-12 h-1 rounded transition ${
                    step > num ? 'bg-white' : 'bg-white/20'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          {/* Step 1: Store Info */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-gray-900 mb-2">Do'kon ma'lumotlari</h2>
                <p className="text-gray-600">Do'koningiz haqida asosiy ma'lumotlar</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Do'kon nomi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.storeName}
                  onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="Masalan: Texno Savdo"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Kategoriya <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                >
                  <option value="general">Umumiy</option>
                  <option value="electronics">Elektronika</option>
                  <option value="fashion">Moda va kiyim</option>
                  <option value="food">Oziq-ovqat</option>
                  <option value="books">Kitoblar</option>
                  <option value="home">Uy buyumlari</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-gray-900 mb-2">Qo'shimcha ma'lumotlar</h2>
                <p className="text-gray-600">Do'koningiz haqida batafsil</p>
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Do'kon tavsifi <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.storeDescription}
                  onChange={(e) => setFormData({ ...formData, storeDescription: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900 min-h-[120px]"
                  placeholder="Do'koningiz qanday mahsulotlar sotishini yozing..."
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Manzil <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="Toshkent, Chilonzor tumani"
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact & Agreement */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h2 className="text-gray-900 mb-2">Aloqa va shartnoma</h2>
                <p className="text-gray-600">Oxirgi qadamlar</p>
              </div>

              {/* Email - MOST IMPORTANT */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-semibold mb-1">Email manzil muhim! ✉️</h3>
                    <p className="text-gray-700 text-sm">
                      Arizangiz tasdiqlanganda <span className="font-semibold text-amber-600">bu email'ga xabar yuboriladi</span>
                    </p>
                  </div>
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:outline-none text-gray-900 bg-white"
                  placeholder="example@gmail.com"
                  required
                />
                {formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                  <p className="text-red-500 text-sm mt-2">❌ To'g'ri email manzil kiriting</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Telefon raqam <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <span className="absolute left-12 top-1/2 -translate-y-1/2 text-gray-700 font-medium">
                    +998
                  </span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-24 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                    placeholder="90 123 45 67"
                  />
                </div>
                {formData.phone && formData.phone.trim().length < 9 && (
                  <p className="text-red-500 text-sm mt-2">❌ Kamida 9 ta raqam kiriting</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  <User className="inline w-4 h-4 mr-1" />
                  Do'kon egasi <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="Ism Familiya"
                />
                {formData.ownerName && formData.ownerName.trim().length < 3 && (
                  <p className="text-red-500 text-sm mt-2">❌ Kamida 3 ta harf kiriting</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Business License (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={formData.businessLicense}
                  onChange={(e) => setFormData({ ...formData, businessLicense: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="License raqami yoki URL"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">
                  Do'kon logotipi URL (ixtiyoriy)
                </label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-gray-900"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="text-gray-900 mb-3">Hamkorlik shartlari:</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Har bir savdodan 5% komissiya to'lanadi</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Mahsulotlar sifati va tavsifini to'g'ri ko'rsatish majburiyati</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Buyurtmalarni 24 soat ichida qayta ishlash</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Mijozlar bilan yaxshi munosabatda bo'lish</span>
                  </li>
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeToTerms}
                  onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                  className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 text-sm">
                  Men hamkorlik shartlari va{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    foydalanish shartnomasini
                  </a>{' '}
                  qabul qilaman
                </span>
              </label>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition"
              >
                Orqaga
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!isStepValid()}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span>Keyingisi</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isStepValid()}
                className="flex-1 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Yuborish</span>
              </button>
            )}
          </div>

          {step === 1 && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full mt-4 py-2 text-gray-600 hover:text-gray-900 transition"
            >
              Bekor qilish
            </button>
          )}
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-white text-sm">
            Arizangiz ko'rib chiqiladi va 24 soat ichida javob beriladi
          </p>
        </div>
      </div>
    </div>
  );
}