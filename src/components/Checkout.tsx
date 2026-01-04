import { useState, useEffect } from 'react';
import { CartItem, PromoCode, ShippingZone, ShippingMethod } from '../types';
import { ArrowLeft, CheckCircle2, MapPin, Phone, User, Navigation, CreditCard, Wallet, Banknote, Loader2, ShoppingCart, Tag, X, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTelegram } from '../contexts/TelegramContext';
import { Button, IconButton } from './ui/button';
import { Input } from './ui/Input';
import { Card } from './ui/card';
import { getPromoCodes, getPromoCodeUsage, savePromoCodeUsage, savePromoCodes, getShippingZones, getShippingMethods } from '../utils/storage';
import { toast } from 'sonner@2.0.3';

interface CheckoutProps {
  cartItems: CartItem[];
  totalPrice: number;
  onBack: () => void;
  onComplete: () => void;
}

type PaymentMethod = 'payme' | 'click' | 'cash';

export function Checkout({ cartItems, totalPrice, onBack, onComplete }: CheckoutProps) {
  const { tg } = useTelegram();
  // Get user data from localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  // Format price helper function
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + ' so\'m';
  };
  
  const [formData, setFormData] = useState({
    name: currentUser.name || '',
    phone: currentUser.phone || '',
    address: '',
    comment: ''
  });
  const [isValidLocation, setIsValidLocation] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  
  // Promo Code states
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<PromoCode | null>(null);
  const [promoError, setPromoError] = useState('');
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  
  // Shipping states
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [selectedZone, setSelectedZone] = useState<ShippingZone | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingMethod | null>(null);
  const [shippingCost, setShippingCost] = useState(0);
  
  // Load saved addresses and auto-fill default address
  useEffect(() => {
    try {
      const savedAddresses = localStorage.getItem('delivery_addresses');
      if (savedAddresses) {
        const addresses = JSON.parse(savedAddresses);
        const defaultAddress = addresses.find((addr: any) => addr.isDefault);
        
        if (defaultAddress) {
          // Auto-fill with default address
          setFormData(prev => ({
            ...prev,
            name: defaultAddress.name || prev.name,
            phone: defaultAddress.phone || prev.phone,
            address: `${defaultAddress.street}, ${defaultAddress.city}${defaultAddress.postalCode ? ', ' + defaultAddress.postalCode : ''}`
          }));
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  }, []);
  
  // Calculate discount and final price
  const discountAmount = appliedPromo ? (
    appliedPromo.type === 'percentage' 
      ? Math.floor((totalPrice * appliedPromo.value) / 100)
      : appliedPromo.value
  ) : 0;
  
  const finalPrice = Math.max(0, totalPrice - discountAmount + shippingCost);
  
  // Filter available shipping methods for selected zone
  const availableMethods = selectedZone 
    ? shippingMethods.filter(m => m.zoneId === selectedZone.id && m.isActive)
    : [];
  
  // Load shipping data
  useEffect(() => {
    const loadShipping = async () => {
      const zones = await getShippingZones();
      const methods = await getShippingMethods();
      setShippingZones(zones.filter(z => z.isActive));
      setShippingMethods(methods.filter(m => m.isActive));
      
      // Auto-select first zone and method if available
      if (zones.length > 0) {
        const firstZone = zones[0];
        setSelectedZone(firstZone);
        const zoneMethods = methods.filter(m => m.zoneId === firstZone.id && m.isActive);
        if (zoneMethods.length > 0) {
          setSelectedShipping(zoneMethods[0]);
        }
      }
    };
    loadShipping();
  }, []);
  
  // Calculate shipping cost
  useEffect(() => {
    if (!selectedShipping) {
      setShippingCost(0);
      return;
    }
    
    // Check free shipping threshold
    if (selectedShipping.freeShippingThreshold && selectedShipping.freeShippingThreshold > 0) {
      if (totalPrice >= selectedShipping.freeShippingThreshold) {
        setShippingCost(0);
        return;
      }
    }
    
    // Calculate based on type
    let cost = selectedShipping.baseCost;
    
    if (selectedShipping.type === 'weight') {
      // Weight-based calculation (assuming 1kg per item for demo)
      const totalWeight = cartItems.reduce((sum, item) => sum + item.quantity, 0);
      if (selectedShipping.costPerKg) {
        cost += totalWeight * selectedShipping.costPerKg;
      }
    } else if (selectedShipping.type === 'price') {
      // Price-based calculation
      if (selectedShipping.costPercentage) {
        cost = (totalPrice * selectedShipping.costPercentage) / 100;
        if (selectedShipping.maxCost && cost > selectedShipping.maxCost) {
          cost = selectedShipping.maxCost;
        }
      }
    }
    
    setShippingCost(Math.floor(cost));
  }, [selectedShipping, totalPrice, cartItems]);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          // Use Nominatim (OpenStreetMap) for reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=uz`
            );
            const data = await response.json();
            
            // Check if location is in Uzbekistan
            const countryCode = data.address?.country_code?.toLowerCase();
            const country = data.address?.country?.toLowerCase();
            
            if (countryCode !== 'uz' && !country?.includes('uzbek')) {
              alert('❌ Kechirasiz, biz faqat O\'zbekiston hududida yetkazib beramiz.\n\nIltimos, O\'zbekistondagi manzilni kiriting.');
              setIsGettingLocation(false);
              setIsValidLocation(false);
              return;
            }
            
            // Format address with more details
            const parts = [];
            if (data.address.road) parts.push(data.address.road);
            if (data.address.house_number) parts.push(data.address.house_number);
            if (data.address.suburb || data.address.neighbourhood) {
              parts.push(data.address.suburb || data.address.neighbourhood);
            }
            if (data.address.city || data.address.town) {
              parts.push(data.address.city || data.address.town);
            }
            if (data.address.state) parts.push(data.address.state);
            
            const address = parts.length > 0 
              ? parts.join(', ') 
              : data.display_name || `Koordinatalar: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            
            setFormData({ ...formData, address });
            setIsValidLocation(true);
            setIsGettingLocation(false);
            
            // Success notification - no alert needed
          } catch (error) {
            console.error('Geocoding error:', error);
            // Fallback to coordinates
            setFormData({ 
              ...formData, 
              address: `Koordinatalar: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}` 
            });
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error('Location error:', {
            code: error.code,
            message: error.message,
            error: error
          });
          
          let errorMessage = 'Lokatsiyani aniqlab bo\'lmadi.';
          
          if (error.code === 1) {
            errorMessage = '📍 Lokatsiyaga ruxsat bering!\n\nBrauzer sozlamalarida lokatsiyaga ruxsat bering.';
          } else if (error.code === 2) {
            errorMessage = '❌ Lokatsiya ma\'lumotlari mavjud emas.\n\nGPS yoqilganligini tekshiring.';
          } else if (error.code === 3) {
            errorMessage = '⏱️ Lokatsiyani aniqlash vaqti tugadi.\n\nQaytadan urinib ko\'ring.';
          }
          
          alert(errorMessage);
          setIsGettingLocation(false);
          setIsValidLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Sizning brauzeringiz geolokatsiyani qo\'llab-quvvatlamaydi. Iltimos, manzilni qo\'lda kiriting.');
      setIsGettingLocation(false);
      setIsValidLocation(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError('Iltimos, promo kodni kiriting!');
      return;
    }
    
    setIsCheckingPromo(true);
    setPromoError('');
    
    try {
      // Get all promo codes
      const allPromoCodes = await getPromoCodes();
      const code = allPromoCodes.find(
        (c) => c.code.toUpperCase() === promoCodeInput.toUpperCase()
      );
      
      if (!code) {
        setPromoError('Promo kod topilmadi!');
        setIsCheckingPromo(false);
        return;
      }
      
      // Validation checks
      if (!code.isActive) {
        setPromoError('Bu promo kod faol emas!');
        setIsCheckingPromo(false);
        return;
      }
      
      // Check expiry date
      const now = new Date();
      const validFrom = new Date(code.validFrom);
      const validUntil = new Date(code.validUntil);
      
      if (now < validFrom) {
        setPromoError('Bu promo kod hali faol bo\'lmagan!');
        setIsCheckingPromo(false);
        return;
      }
      
      if (now > validUntil) {
        setPromoError('Bu promo kodning muddati tugagan!');
        setIsCheckingPromo(false);
        return;
      }
      
      // Check minimum order amount
      if (totalPrice < code.minOrderAmount) {
        setPromoError(
          `Minimal buyurtma summasi: ${formatPrice(code.minOrderAmount)}`
        );
        setIsCheckingPromo(false);
        return;
      }
      
      // Check total usage limit
      if (code.usedCount >= code.usageLimit) {
        setPromoError('Bu promo koddan foydalanish limiti tugagan!');
        setIsCheckingPromo(false);
        return;
      }
      
      // Check user usage limit
      const userId = currentUser.id || 'guest';
      const userUsage = await getPromoCodeUsage(userId);
      const userPromoUsage = userUsage.find((u) => u.promoCodeId === code.id);
      
      if (userPromoUsage && userPromoUsage.usedCount >= code.userLimit) {
        setPromoError(
          `Siz bu promo koddan maksimal ${code.userLimit} marta foydalanishingiz mumkin!`
        );
        setIsCheckingPromo(false);
        return;
      }
      
      // All checks passed - apply promo code
      setAppliedPromo(code);
      setPromoError('');
      toast.success(`✨ "${code.code}" promo kodi qo'llandi!`);
      setIsCheckingPromo(false);
    } catch (error) {
      console.error('Error applying promo code:', error);
      setPromoError('Xatolik yuz berdi!');
      setIsCheckingPromo(false);
    }
  };
  
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError('');
    toast.info('Promo kod olib tashlandi');
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Update promo code usage if applied
      if (appliedPromo) {
        const userId = currentUser.id || 'guest';
        
        // Update promo code's used count
        const allPromoCodes = await getPromoCodes();
        const updatedCodes = allPromoCodes.map((c) =>
          c.id === appliedPromo.id
            ? { ...c, usedCount: c.usedCount + 1, updatedAt: new Date().toISOString() }
            : c
        );
        await savePromoCodes(updatedCodes);
        
        // Update user's usage
        const userUsage = await getPromoCodeUsage(userId);
        const existingUsage = userUsage.find((u) => u.promoCodeId === appliedPromo.id);
        
        if (existingUsage) {
          const updated = userUsage.map((u) =>
            u.promoCodeId === appliedPromo.id
              ? { ...u, usedCount: u.usedCount + 1, lastUsed: new Date().toISOString() }
              : u
          );
          await savePromoCodeUsage(userId, updated);
        } else {
          await savePromoCodeUsage(userId, [
            ...userUsage,
            {
              userId,
              promoCodeId: appliedPromo.id,
              usedCount: 1,
              lastUsed: new Date().toISOString(),
            },
          ]);
        }
      }
    } catch (error) {
      console.error('Error updating promo usage:', error);
    }

    // Simulate order processing
    setTimeout(() => {
      setIsSubmitting(false);
      setOrderComplete(true);
      
      // Generate tracking number
      const trackingNumber = 'DM' + Date.now().toString().slice(-8);
      
      // Calculate estimated delivery (3-5 days from now)
      const daysToAdd = 3 + Math.floor(Math.random() * 3); // 3-5 days
      const estimatedDelivery = new Date();
      estimatedDelivery.setDate(estimatedDelivery.getDate() + daysToAdd);
      
      // Store order in localStorage
      const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        items: cartItems,
        total: finalPrice, // Use finalPrice with discount applied
        originalTotal: totalPrice,
        discount: discountAmount,
        promoCode: appliedPromo?.code,
        customerInfo: formData,
        paymentMethod,
        status: 'pending',
        trackingNumber,
        estimatedDelivery: estimatedDelivery.toISOString()
      };
      
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(order);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      setTimeout(() => {
        onComplete();
      }, 2000);
    }, 1500);
  };

  if (orderComplete) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-xl">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </motion.div>
          <h2 className="text-gray-900 mb-2">
            Buyurtma qabul qilindi!
          </h2>
          <p className="text-gray-600 mb-4">
            Buyurtma raqami: #{Date.now().toString().slice(-6)}
          </p>
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              {paymentMethod === 'cash' && '💵 Naqd pul - yetkazib beruvchiga to\'lang'}
              {paymentMethod === 'payme' && '💳 Payme orqali to\'lov - keyinchalik'}
              {paymentMethod === 'click' && '💳 Click orqali to\'lov - keyinchalik'}
            </p>
          </div>
          <p className="text-gray-500 text-sm">
            Tez orada siz bilan bog'lanamiz
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Buyurtma berish</h1>
        </div>
      </div>

      <div className="p-4 max-w-2xl mx-auto pb-24">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
          <h2 className="text-gray-900 mb-3 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Buyurtma tarkibi
          </h2>
          <div className="space-y-2">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.product.name} x {item.quantity}
                </span>
                <span className="text-gray-900">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          
          {/* Discount */}
          {appliedPromo && discountAmount > 0 && (
            <>
              <div className="border-t mt-3 pt-3 flex justify-between text-sm">
                <span className="text-gray-600">Oraliq jami:</span>
                <span className="text-gray-900">{formatPrice(totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-green-600 flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  Chegirma ({appliedPromo.code}):
                </span>
                <span className="text-green-600">-{formatPrice(discountAmount)}</span>
              </div>
            </>
          )
          }
          
          <div className="border-t mt-3 pt-3 flex justify-between">
            <span className="text-gray-900">Jami:</span>
            <span className={appliedPromo ? "text-blue-600" : "text-blue-600"}>
              {formatPrice(appliedPromo ? finalPrice : totalPrice)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Info */}
          <Card>
            <h2 className="text-gray-900 mb-4">Ma'lumotlaringiz</h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Ismingiz</span>
                  </div>
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ism va familiya"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span>Telefon raqam</span>
                  </div>
                </label>
                <Input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>
          </Card>

          {/* Delivery Address */}
          <Card>
            <h2 className="text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Yetkazib berish manzili
            </h2>

            <div className="space-y-3">
              {/* Get Location Button */}
              <Button
                type="button"
                onClick={handleGetLocation}
                disabled={isGettingLocation}
                className="w-full py-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition flex items-center justify-center gap-2 border border-blue-200"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Aniqlanmoqda...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    <span>Manzilni avtomatik aniqlash</span>
                  </>
                )}
              </Button>

              {/* Address Input */}
              <div>
                <textarea
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                  rows={3}
                  placeholder="Shahar, ko'cha, uy raqami, kvartira"
                />
              </div>

              {/* Comment */}
              <div>
                <label className="block text-gray-700 mb-2 text-sm">
                  Izoh (ixtiyoriy)
                </label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition"
                  rows={2}
                  placeholder="Masalan: 2-etaj, qo'ng'iroqni bosing..."
                />
              </div>
            </div>
          </Card>

          {/* Shipping Method */}
          {shippingZones.length > 0 && (
            <Card>
              <h2 className="text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-600" />
                Yetkazib berish usuli
              </h2>

              <div className="space-y-4">
                {/* Zone Selection */}
                {shippingZones.length > 1 && (
                  <div>
                    <label className="block text-gray-700 mb-2 text-sm">
                      Hudud
                    </label>
                    <select
                      value={selectedZone?.id || ''}
                      onChange={(e) => {
                        const zone = shippingZones.find(z => z.id === e.target.value);
                        setSelectedZone(zone || null);
                        // Reset shipping method
                        if (zone) {
                          const zoneMethods = shippingMethods.filter(m => m.zoneId === zone.id);
                          setSelectedShipping(zoneMethods.length > 0 ? zoneMethods[0] : null);
                        }
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    >
                      {shippingZones.map((zone) => (
                        <option key={zone.id} value={zone.id}>
                          {zone.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Shipping Methods */}
                <div className="space-y-3">
                  {availableMethods.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Bu hudud uchun yetkazib berish usuli mavjud emas</p>
                    </div>
                  ) : (
                    availableMethods.map((method) => {
                      const cost = method.freeShippingThreshold && totalPrice >= method.freeShippingThreshold ? 0 : (
                        method.type === 'fixed' ? method.baseCost :
                        method.type === 'weight' ? method.baseCost + (cartItems.reduce((sum, item) => sum + item.quantity, 0) * (method.costPerKg || 0)) :
                        Math.min((totalPrice * (method.costPercentage || 0)) / 100, method.maxCost || Infinity)
                      );

                      return (
                        <label
                          key={method.id}
                          className={`block p-4 border-2 rounded-xl cursor-pointer transition ${
                            selectedShipping?.id === method.id
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="shipping"
                              value={method.id}
                              checked={selectedShipping?.id === method.id}
                              onChange={() => setSelectedShipping(method)}
                              className="w-5 h-5 text-blue-600 mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-gray-900 font-medium">{method.name}</p>
                                <p className="text-gray-900 font-medium">
                                  {cost === 0 ? (
                                    <span className="text-green-600">Bepul</span>
                                  ) : (
                                    formatPrice(Math.floor(cost))
                                  )}
                                </p>
                              </div>
                              {method.description && (
                                <p className="text-sm text-gray-500 mb-1">{method.description}</p>
                              )}
                              {method.deliveryTime && (
                                <p className="text-xs text-gray-400">
                                  ⏱️ {method.deliveryTime}
                                </p>
                              )}
                              {method.freeShippingThreshold && method.freeShippingThreshold > 0 && totalPrice < method.freeShippingThreshold && (
                                <p className="text-xs text-orange-500 mt-1">
                                  💡 {formatPrice(method.freeShippingThreshold - totalPrice)} qo'shsangiz, bepul yetkazamiz!
                                </p>
                              )}
                            </div>
                            {selectedShipping?.id === method.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mt-1"
                              >
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Shipping Cost Summary */}
                {selectedShipping && shippingCost > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-50 border border-blue-200 rounded-xl"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Yetkazib berish:</span>
                      <span className="text-sm text-gray-900 font-medium">{formatPrice(shippingCost)}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </Card>
          )}

          {/* Payment Method */}
          <Card>
            <h2 className="text-gray-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" />
              To'lov usuli
            </h2>

            <div className="space-y-3">
              {/* Cash */}
              <label
                className={`block p-4 border-2 rounded-xl cursor-pointer transition ${
                  paymentMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    className="w-5 h-5 text-blue-600"
                  />
                  <Banknote className="w-6 h-6 text-green-600" />
                  <div className="flex-1">
                    <p className="text-gray-900">Naqd pul</p>
                    <p className="text-sm text-gray-500">Yetkazib beruvchiga to'lov</p>
                  </div>
                  {paymentMethod === 'cash' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </label>

              {/* Payme */}
              <label
                className={`block p-4 border-2 rounded-xl cursor-pointer transition relative ${
                  paymentMethod === 'payme'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="payme"
                    checked={paymentMethod === 'payme'}
                    onChange={() => setPaymentMethod('payme')}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Payme</p>
                    <p className="text-sm text-gray-500">Karta orqali to'lov</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Tez orada
                  </span>
                  {paymentMethod === 'payme' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </label>

              {/* Click */}
              <label
                className={`block p-4 border-2 rounded-xl cursor-pointer transition relative ${
                  paymentMethod === 'click'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="payment"
                    value="click"
                    checked={paymentMethod === 'click'}
                    onChange={() => setPaymentMethod('click')}
                    className="w-5 h-5 text-blue-600"
                  />
                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 rounded flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">Click</p>
                    <p className="text-sm text-gray-500">Karta orqali to'lov</p>
                  </div>
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    Tez orada
                  </span>
                  {paymentMethod === 'click' && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </div>
              </label>
            </div>

            {/* Payment Warning */}
            {(paymentMethod === 'payme' || paymentMethod === 'click') && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-xl"
              >
                <p className="text-sm text-yellow-800">
                  ℹ️ Onlayn to'lov tizimi hozircha ishlamaydi. Iltimos, "Naqd pul" usulini tanlang.
                </p>
              </motion.div>
            )}
          </Card>

          {/* Promo Code */}
          <Card>
            <h2 className="text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
              Promo kod
            </h2>

            <div className="space-y-3">
              {/* Promo Code Input */}
              <div className="relative">
                <Input
                  type="text"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  placeholder="Promo kodni kiriting"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <IconButton
                  type="button"
                  onClick={handleApplyPromo}
                  disabled={isCheckingPromo}
                  className="absolute right-3 top-3"
                >
                  {isCheckingPromo ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-5 h-5" />
                  )}
                </IconButton>
              </div>

              {/* Remove Promo Code */}
              {appliedPromo && (
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-700">
                    Qo'llangan promo kod: <strong>{appliedPromo.code}</strong>
                  </p>
                  <IconButton
                    type="button"
                    onClick={handleRemovePromo}
                    className="text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                </div>
              )}

              {/* Promo Error */}
              {promoError && (
                <p className="text-sm text-red-500">
                  {promoError}
                </p>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || paymentMethod !== 'cash' || !isValidLocation}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Yuborilmoqda...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Buyurtmani tasdiqlash - {formatPrice(finalPrice)}</span>
              </>
            )}
          </Button>

          {paymentMethod !== 'cash' && (
            <p className="text-center text-sm text-gray-500">
              Faqat naqd pul orqali buyurtma berish mumkin
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
