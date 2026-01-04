import { useState } from 'react';
import { motion } from 'motion/react';
import { Clock, Sunrise, Sun, Moon, Calendar, AlertCircle } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export interface TimeSlot {
  id: string;
  label: string;
  startTime: string; // HH:mm format
  endTime: string;
  icon: typeof Sunrise;
  isAvailable: boolean;
  price?: number; // Additional cost (optional)
}

export interface DeliveryDate {
  date: Date;
  label: string;
  isAvailable: boolean;
}

interface DeliveryTimeSlotsProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onDateChange: (date: Date) => void;
  onSlotChange: (slot: TimeSlot) => void;
  minDate?: Date; // Minimum allowed date
  maxDaysAhead?: number; // Maximum days into the future
}

export function DeliveryTimeSlots({
  selectedDate,
  selectedSlot,
  onDateChange,
  onSlotChange,
  minDate = new Date(),
  maxDaysAhead = 7
}: DeliveryTimeSlotsProps) {
  const [selectedDateState, setSelectedDateState] = useState<Date | null>(selectedDate);

  // Generate available dates
  const getAvailableDates = (): DeliveryDate[] => {
    const dates: DeliveryDate[] = [];
    const today = new Date();
    const currentHour = today.getHours();

    for (let i = 0; i < maxDaysAhead; i++) {
      const date = new Date(minDate);
      date.setDate(minDate.getDate() + i);
      
      // Disable today if it's after 20:00
      const isAvailable = !(i === 0 && currentHour >= 20);

      let label = '';
      if (i === 0) {
        label = 'Bugun';
      } else if (i === 1) {
        label = 'Ertaga';
      } else {
        label = date.toLocaleDateString('uz-UZ', { weekday: 'short', day: '2-digit', month: 'short' });
      }

      dates.push({
        date,
        label,
        isAvailable
      });
    }

    return dates;
  };

  // Define time slots
  const getTimeSlots = (date: Date): TimeSlot[] => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const currentHour = now.getHours();

    const slots: TimeSlot[] = [
      {
        id: 'morning',
        label: 'Ertalab',
        startTime: '09:00',
        endTime: '12:00',
        icon: Sunrise,
        isAvailable: !isToday || currentHour < 9,
        price: 0
      },
      {
        id: 'afternoon',
        label: 'Tushdan keyin',
        startTime: '12:00',
        endTime: '17:00',
        icon: Sun,
        isAvailable: !isToday || currentHour < 12,
        price: 0
      },
      {
        id: 'evening',
        label: 'Kechqurun',
        startTime: '17:00',
        endTime: '21:00',
        icon: Moon,
        isAvailable: !isToday || currentHour < 17,
        price: 5000 // Evening delivery has extra cost
      }
    ];

    return slots;
  };

  const availableDates = getAvailableDates();
  const timeSlots = selectedDateState ? getTimeSlots(selectedDateState) : [];

  const handleDateSelect = (date: Date) => {
    setSelectedDateState(date);
    onDateChange(date);
  };

  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.isAvailable) {
      onSlotChange(slot);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-gray-900 dark:text-white font-semibold">
          Yetkazib berish vaqti
        </h3>
      </div>

      {/* Date Selection */}
      <div>
        <label className="block text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          Kunni tanlang:
        </label>
        
        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
          {availableDates.map((dateOption) => {
            const isSelected = selectedDateState?.toDateString() === dateOption.date.toDateString();
            
            return (
              <motion.button
                key={dateOption.date.toISOString()}
                whileTap={{ scale: dateOption.isAvailable ? 0.95 : 1 }}
                onClick={() => dateOption.isAvailable && handleDateSelect(dateOption.date)}
                disabled={!dateOption.isAvailable}
                className={`
                  p-3 rounded-xl border-2 transition-all text-center
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : dateOption.isAvailable
                    ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    : 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                  }
                `}
              >
                <div className={`font-medium text-sm mb-1 ${
                  isSelected 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : dateOption.isAvailable 
                    ? 'text-gray-900 dark:text-white' 
                    : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {dateOption.label}
                </div>
                <div className={`text-xs ${
                  isSelected 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : dateOption.isAvailable 
                    ? 'text-gray-500 dark:text-gray-400' 
                    : 'text-gray-400 dark:text-gray-600'
                }`}>
                  {formatDate(dateOption.date)}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Slot Selection */}
      {selectedDateState && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <label className="block text-sm text-gray-600 dark:text-gray-400 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Vaqt oralig'ini tanlang:
          </label>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {timeSlots.map((slot) => {
              const Icon = slot.icon;
              const isSelected = selectedSlot?.id === slot.id;
              
              return (
                <motion.button
                  key={slot.id}
                  whileTap={{ scale: slot.isAvailable ? 0.98 : 1 }}
                  onClick={() => handleSlotSelect(slot)}
                  disabled={!slot.isAvailable}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-left relative overflow-hidden
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : slot.isAvailable
                      ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      : 'border-gray-100 dark:border-gray-800 opacity-50 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Icon */}
                  <div className="flex items-start gap-3 mb-2">
                    <div className={`p-2 rounded-lg ${
                      isSelected 
                        ? 'bg-blue-100 dark:bg-blue-800/50' 
                        : slot.isAvailable 
                        ? 'bg-gray-100 dark:bg-gray-700' 
                        : 'bg-gray-50 dark:bg-gray-800'
                    }`}>
                      <Icon className={`w-5 h-5 ${
                        isSelected 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : slot.isAvailable 
                          ? 'text-gray-600 dark:text-gray-400' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1">
                      <div className={`font-medium mb-1 ${
                        isSelected 
                          ? 'text-blue-900 dark:text-blue-100' 
                          : slot.isAvailable 
                          ? 'text-gray-900 dark:text-white' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {slot.label}
                      </div>
                      <div className={`text-sm ${
                        isSelected 
                          ? 'text-blue-600 dark:text-blue-400' 
                          : slot.isAvailable 
                          ? 'text-gray-500 dark:text-gray-400' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {slot.startTime} - {slot.endTime}
                      </div>
                    </div>
                  </div>

                  {/* Price Badge */}
                  {slot.price && slot.price > 0 && (
                    <div className={`text-xs font-medium ${
                      isSelected 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      +{formatPrice(slot.price)}
                    </div>
                  )}

                  {/* Unavailable Overlay */}
                  {!slot.isAvailable && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-900/50">
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        Mavjud emas
                      </span>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Info Message */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="text-blue-900 dark:text-blue-100 font-medium mb-1">
            ℹ️ Ma'lumot:
          </p>
          <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs list-disc list-inside">
            <li>Soat 20:00 dan keyin bugungi kunni tanlab bo'lmaydi</li>
            <li>Kechqurun yetkazish qo'shimcha {formatPrice(5000)} turadi</li>
            <li>Aniq vaqt tanlangan vaqt oralig'ida belgilanadi</li>
            <li>Kuryer yetishdan oldin qo'ng'iroq qiladi</li>
          </ul>
        </div>
      </div>

      {/* Selected Summary */}
      {selectedDateState && selectedSlot && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border-l-4 border-green-500"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-green-900 dark:text-green-100 font-medium text-sm">
                Tanlangan vaqt:
              </p>
              <p className="text-green-700 dark:text-green-300 text-sm">
                {formatDate(selectedDateState)} • {selectedSlot.label} ({selectedSlot.startTime} - {selectedSlot.endTime})
              </p>
              {selectedSlot.price && selectedSlot.price > 0 && (
                <p className="text-green-600 dark:text-green-400 text-xs mt-1">
                  Qo'shimcha: {formatPrice(selectedSlot.price)}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// Compact version for mobile checkout
interface DeliveryTimeSlotsCompactProps {
  selectedDate: Date | null;
  selectedSlot: TimeSlot | null;
  onChange: (date: Date, slot: TimeSlot) => void;
}

export function DeliveryTimeSlotsCompact({
  selectedDate,
  selectedSlot,
  onChange
}: DeliveryTimeSlotsCompactProps) {
  const [tempDate, setTempDate] = useState<Date | null>(selectedDate);
  const [tempSlot, setTempSlot] = useState<TimeSlot | null>(selectedSlot);

  const handleApply = () => {
    if (tempDate && tempSlot) {
      onChange(tempDate, tempSlot);
    }
  };

  return (
    <div className="space-y-4">
      <DeliveryTimeSlots
        selectedDate={tempDate}
        selectedSlot={tempSlot}
        onDateChange={setTempDate}
        onSlotChange={setTempSlot}
      />
      
      {tempDate && tempSlot && (
        <button
          onClick={handleApply}
          className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition font-medium"
        >
          Tasdiqlash
        </button>
      )}
    </div>
  );
}
