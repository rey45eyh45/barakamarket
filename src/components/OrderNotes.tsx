import { useState } from 'react';
import { MessageSquare, Gift, AlertCircle, Package, Clock, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

interface OrderNotesProps {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showSuggestions?: boolean;
}

export function OrderNotes({ 
  value, 
  onChange, 
  maxLength = 300,
  showSuggestions = true 
}: OrderNotesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    {
      id: 'no-knock',
      icon: AlertCircle,
      label: 'Eshikka taqillatmang',
      text: 'Iltimos, eshikka taqillatmang. Qo\'ng\'iroq bosing yoki telefon qiling.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    },
    {
      id: 'leave-door',
      icon: Package,
      label: 'Eshik oldida qoldiring',
      text: 'Uyda bo\'lmasam, buyurtmani eshik oldida qoldiring.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      id: 'call-arrive',
      icon: Clock,
      label: 'Yetganda qo\'ng\'iroq qiling',
      text: 'Yetib borganingizda avval telefon qiling, men tushaman.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      id: 'specific-address',
      icon: MapPin,
      label: 'Aniq manzil',
      text: 'Qizil binoning 3-eshigi, 2-qavat, 5-xonadon.',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      id: 'gift',
      icon: Gift,
      label: 'Bu sovg\'a',
      text: 'Bu sovg\'a uchun. Iltimos, narxli chekni qo\'ymang.',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20'
    }
  ];

  const handleTemplateClick = (template: typeof templates[0]) => {
    if (selectedTemplate === template.id) {
      // Deselect
      setSelectedTemplate(null);
      onChange('');
    } else {
      // Select
      setSelectedTemplate(template.id);
      onChange(template.text);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <label className="text-gray-900 dark:text-white font-medium">
          Buyurtma uchun izoh
        </label>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          (ixtiyoriy)
        </span>
      </div>

      {/* Quick Templates */}
      {showSuggestions && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tez shablonlar:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {templates.map((template) => {
              const Icon = template.icon;
              const isSelected = selectedTemplate === template.id;

              return (
                <motion.button
                  key={template.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTemplateClick(template)}
                  className={`
                    p-3 rounded-lg text-left transition-all border-2
                    ${isSelected 
                      ? `${template.bgColor} border-current ${template.color}` 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-2">
                    <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isSelected ? template.color : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${isSelected ? template.color : 'text-gray-700 dark:text-gray-300'}`}>
                      {template.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setSelectedTemplate(null);
          }}
          placeholder="Kuryer uchun maxsus ko'rsatmalar yoki izohlar yozing..."
          maxLength={maxLength}
          className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />
        
        {/* Character Count */}
        <div className="absolute bottom-3 right-3 text-xs text-gray-400 dark:text-gray-500">
          {value.length}/{maxLength}
        </div>
      </div>

      {/* Examples */}
      {value.length === 0 && !selectedTemplate && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-sm">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-2">
            💡 Izoh misollari:
          </p>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs list-disc list-inside">
            <li>Ofis binosi, 3-qavat, 305-xona</li>
            <li>Soat 14:00 dan keyin yetkazing</li>
            <li>Qo'ng'iroq qiling, men tushaman</li>
            <li>Kirish yo'lakchasida qizil eshik</li>
          </ul>
        </div>
      )}
    </div>
  );
}

// Compact version for mobile
export function OrderNotesCompact({ value, onChange, maxLength = 300 }: OrderNotesProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        <label className="text-gray-900 dark:text-white text-sm font-medium">
          Izoh (ixtiyoriy)
        </label>
      </div>
      
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Kuryer uchun ko'rsatmalar..."
        maxLength={maxLength}
        className="w-full h-24 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white text-sm resize-none"
      />
      
      <div className="text-xs text-gray-400 dark:text-gray-500 text-right">
        {value.length}/{maxLength}
      </div>
    </div>
  );
}

// Read-only display for order details
interface OrderNotesDisplayProps {
  notes: string;
}

export function OrderNotesDisplay({ notes }: OrderNotesDisplayProps) {
  if (!notes) return null;

  return (
    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border-l-4 border-amber-400 dark:border-amber-600">
      <div className="flex items-start gap-3">
        <MessageSquare className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-900 dark:text-amber-100 font-medium text-sm mb-1">
            Kuryer uchun izoh:
          </p>
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            {notes}
          </p>
        </div>
      </div>
    </div>
  );
}
