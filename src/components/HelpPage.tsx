import { ArrowLeft, HelpCircle, Phone, Mail, MessageCircle, MapPin, Clock, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface HelpPageProps {
  onBack: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
}

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

export function HelpPage({ onBack }: HelpPageProps) {
  const { t } = useLanguage();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [settings, setSettings] = useState<SupportSettings>(DEFAULT_SETTINGS);

  // Load support settings from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const saved = localStorage.getItem('support_settings');
        if (saved) {
          setSettings(JSON.parse(saved));
        } else {
          // First load - create default settings
          localStorage.setItem('support_settings', JSON.stringify(DEFAULT_SETTINGS));
        }
      } catch (error) {
        console.error('Error loading support settings:', error);
      }
    };

    loadSettings();

    // Listen for storage changes (when admin updates settings)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'support_settings' && e.newValue) {
        try {
          setSettings(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Error parsing updated settings:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const faqs: FAQItem[] = [
    {
      question: 'Qanday qilib buyurtma beraman?',
      answer: 'Mahsulotni tanlang, "Savatga qo\'shish" tugmasini bosing, keyin savat sahifasida "Rasmiylashtirish" tugmasini bosing. Yetkazib berish manzili va to\'lov usulini tanlang.'
    },
    {
      question: 'Yetkazib berish qancha vaqt oladi?',
      answer: 'Odatda 1-3 ish kuni ichida yetkazib beramiz. Toshkent shahrida 1 kun, boshqa viloyatlarda 2-3 kun davom etadi.'
    },
    {
      question: 'To\'lov usullari qanday?',
      answer: 'Naqd pul (yetkazib berish paytida), Payme, Click, Uzum Bank orqali to\'lashingiz mumkin.'
    },
    {
      question: 'Mahsulotni qaytarish mumkinmi?',
      answer: 'Ha, 14 kun ichida mahsulotni qaytarishingiz mumkin. Mahsulot ishlatilmagan va asl qadoqda bo\'lishi kerak.'
    },
    {
      question: 'Qanday qilib buyurtma holatini kuzataman?',
      answer: 'Profil → Buyurtmalarim bo\'limida barcha buyurtmalaringizni ko\'rishingiz va holatini kuzatishingiz mumkin.'
    },
    {
      question: 'Chegirma promokodlarini qanday ishlataman?',
      answer: 'Buyurtmani rasmiylashtirish paytida "Promokod" maydoniga kodni kiriting va "Qo\'llash" tugmasini bosing.'
    },
    {
      question: 'Mahsulot kafolati bormi?',
      answer: 'Ha, barcha elektronika mahsulotlari 12 oy, kiyim va poyabzallar 3 oy kafolatga ega.'
    },
    {
      question: 'Ommaviy to\'lovni qo\'llab-quvvatlaydimi?',
      answer: 'Ha, bir necha mahsulotni bitta buyurtmada to\'lashingiz mumkin.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
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
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-gray-900">Yordam va Qo'llab-quvvatlash</h1>
              <p className="text-gray-500 text-sm">Biz sizga yordam berishga tayyormiz</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* Contact Methods */}
        <div>
          <h2 className="text-gray-900 mb-3 px-2">Biz bilan bog'laning</h2>
          <div className="space-y-2">
            <a
              href={`tel:${settings.phone}`}
              className="block bg-white rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Phone className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">Telefon</p>
                  <p className="text-blue-600">{settings.phone}</p>
                </div>
              </div>
            </a>

            <a
              href={`mailto:${settings.email}`}
              className="block bg-white rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">Email</p>
                  <p className="text-green-600">{settings.email}</p>
                </div>
              </div>
            </a>

            <a
              href={`https://t.me/${settings.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white rounded-lg p-4 hover:bg-gray-50 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-sky-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">Telegram</p>
                  <p className="text-sky-600">{settings.telegram}</p>
                </div>
              </div>
            </a>
          </div>
        </div>

        {/* Working Hours */}
        <div>
          <h2 className="text-gray-900 mb-3 px-2">Ish vaqti</h2>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-900 mb-2">Qo'llab-quvvatlash xizmati</p>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Dushanba - Juma: {settings.working_hours_weekday}</p>
                  <p className="text-gray-600">Shanba - Yakshanba: {settings.working_hours_weekend}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Address */}
        <div>
          <h2 className="text-gray-900 mb-3 px-2">Ofis manzili</h2>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-gray-900 mb-2">Baraka Market ofisi</p>
                <p className="text-gray-600 text-sm">
                  {settings.office_city},<br />
                  {settings.office_address}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-gray-900 mb-3 px-2">Tez-tez so'raladigan savollar</h2>
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
                >
                  <p className="text-gray-900 text-left pr-4">{faq.question}</p>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                {expandedFAQ === index && (
                  <div className="px-4 pb-4 pt-0">
                    <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div>
          <h2 className="text-gray-900 mb-3 px-2">Ilova haqida</h2>
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <p className="text-gray-500 text-sm">Ilova nomi</p>
                  <p className="text-gray-900">Baraka Market</p>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <p className="text-gray-500 text-sm">Versiya</p>
                  <p className="text-gray-900">1.0.0</p>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <p className="text-gray-500 text-sm">Ishlab chiquvchi</p>
                  <p className="text-gray-900">Baraka Market LLC</p>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <p className="text-gray-500 text-sm">Copyright</p>
                  <p className="text-gray-900">© 2024 Baraka Market. Barcha huquqlar himoyalangan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
          <HelpCircle className="w-12 h-12 mb-4 opacity-80" />
          <h3 className="text-white mb-2">Yordam kerakmi?</h3>
          <p className="text-white/90 text-sm mb-4">
            Bizning qo'llab-quvvatlash jamoamiz sizga yordam berishga doim tayyor!
          </p>
          <a
            href={`tel:${settings.phone}`}
            className="inline-block bg-white text-purple-600 px-6 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Hozir qo'ng'iroq qiling
          </a>
        </div>
      </div>
    </div>
  );
}