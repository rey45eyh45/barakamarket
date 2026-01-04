import { useState } from 'react';
import { X, AlertCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';
import { useLanguage } from '../contexts/LanguageContext';
import { CancellationReason, CancellationRequest, CANCELLATION_REASON_LABELS } from '../types/cancellation';
import { Button } from './ui/button';

interface OrderCancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  orderTotal: number;
  userId: string;
  userName: string;
  onCancelSuccess: () => void;
}

export function OrderCancellationModal({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  orderTotal,
  userId,
  userName,
  onCancelSuccess
}: OrderCancellationModalProps) {
  const { language } = useLanguage();
  const [selectedReason, setSelectedReason] = useState<CancellationReason | ''>('');
  const [reasonText, setReasonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    if (!selectedReason) {
      toast.error(
        language === 'uz' 
          ? "Iltimos, bekor qilish sababini tanlang"
          : language === 'ru'
          ? "Пожалуйста, выберите причину отмены"
          : "Please select a cancellation reason"
      );
      return;
    }

    if (selectedReason === 'other' && !reasonText.trim()) {
      toast.error(
        language === 'uz' 
          ? "Iltimos, sababni kiriting"
          : language === 'ru'
          ? "Пожалуйста, введите причину"
          : "Please enter a reason"
      );
      return;
    }

    setIsSubmitting(true);

    // Create cancellation request
    const cancellationRequest: CancellationRequest = {
      id: `cancel-${Date.now()}`,
      orderId,
      userId,
      userName,
      reason: selectedReason as CancellationReason,
      reasonText: selectedReason === 'other' ? reasonText : CANCELLATION_REASON_LABELS[selectedReason as CancellationReason][language],
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    // Save to localStorage
    try {
      const existingRequests = JSON.parse(localStorage.getItem('cancellation_requests') || '[]');
      existingRequests.push(cancellationRequest);
      localStorage.setItem('cancellation_requests', JSON.stringify(existingRequests));

      // Update order status to 'cancellation_requested'
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = orders.map((order: any) => {
        if (order.id === orderId) {
          return {
            ...order,
            cancellationRequest: cancellationRequest,
            cancellationStatus: 'requested'
          };
        }
        return order;
      });
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      toast.success(
        language === 'uz' 
          ? "Bekor qilish so'rovi yuborildi"
          : language === 'ru'
          ? "Запрос на отмену отправлен"
          : "Cancellation request submitted"
      );

      onCancelSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting cancellation request:', error);
      toast.error(
        language === 'uz' 
          ? "Xatolik yuz berdi"
          : language === 'ru'
          ? "Произошла ошибка"
          : "An error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const reasons: CancellationReason[] = [
    'changed_mind',
    'found_better_price',
    'ordered_by_mistake',
    'shipping_too_slow',
    'product_not_needed',
    'other'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-gray-900 dark:text-white">
                      {language === 'uz' 
                        ? "Buyurtmani bekor qilish"
                        : language === 'ru'
                        ? "Отмена заказа"
                        : "Cancel Order"}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'uz' 
                        ? `Buyurtma #${orderNumber}`
                        : language === 'ru'
                        ? `Заказ #${orderNumber}`
                        : `Order #${orderNumber}`}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Warning */}
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    {language === 'uz' 
                      ? "Buyurtmani bekor qilganingizdan so'ng, uni qaytarib bo'lmaydi. Agar to'lov qilgan bo'lsangiz, pul 3-5 ish kunida qaytariladi."
                      : language === 'ru'
                      ? "После отмены заказа его нельзя будет восстановить. Если вы уже оплатили, деньги вернутся в течение 3-5 рабочих дней."
                      : "Once you cancel the order, it cannot be restored. If you've paid, the refund will be processed in 3-5 business days."}
                  </div>
                </div>

                {/* Order Info */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === 'uz' ? "Buyurtma raqami:" : language === 'ru' ? "Номер заказа:" : "Order number:"}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">#{orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {language === 'uz' ? "Summa:" : language === 'ru' ? "Сумма:" : "Total:"}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {orderTotal.toLocaleString('uz-UZ')} so'm
                    </span>
                  </div>
                </div>

                {/* Reason Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white">
                    {language === 'uz' 
                      ? "Bekor qilish sababini tanlang:"
                      : language === 'ru'
                      ? "Выберите причину отмены:"
                      : "Select cancellation reason:"}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  
                  <div className="space-y-2">
                    {reasons.map((reason) => (
                      <label
                        key={reason}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedReason === reason
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={reason}
                          checked={selectedReason === reason}
                          onChange={(e) => setSelectedReason(e.target.value as CancellationReason)}
                          className="mt-1"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {CANCELLATION_REASON_LABELS[reason][language]}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Custom Reason Text */}
                {selectedReason === 'other' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white">
                      {language === 'uz' 
                        ? "Sababni kiriting:"
                        : language === 'ru'
                        ? "Введите причину:"
                        : "Enter reason:"}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      value={reasonText}
                      onChange={(e) => setReasonText(e.target.value)}
                      placeholder={
                        language === 'uz' 
                          ? "Bekor qilish sababini tafsilot bilan yozing..."
                          : language === 'ru'
                          ? "Опишите причину отмены подробно..."
                          : "Describe the cancellation reason in detail..."
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {language === 'uz' ? "Bekor qilish" : language === 'ru' ? "Отмена" : "Cancel"}
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="danger"
                  className="flex-1"
                  disabled={isSubmitting || !selectedReason}
                >
                  {isSubmitting 
                    ? (language === 'uz' ? "Yuborilmoqda..." : language === 'ru' ? "Отправка..." : "Submitting...")
                    : (language === 'uz' ? "Bekor qilish" : language === 'ru' ? "Отменить заказ" : "Cancel Order")
                  }
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
