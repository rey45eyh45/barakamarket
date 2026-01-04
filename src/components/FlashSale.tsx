import { motion } from 'motion/react';
import { Zap, Flame, Clock, TrendingUp, ShoppingCart } from 'lucide-react';
import { useFlashSale, useFlashSaleTimer, useFlashSaleProducts } from '../hooks/useFlashSale';
import { formatPrice } from '../utils/formatters';
import { useTelegram } from '../contexts/TelegramContext';
import { toast } from 'sonner@2.0.3';

interface FlashSaleBannerProps {
  onViewAll?: () => void;
}

export function FlashSaleBanner({ onViewAll }: FlashSaleBannerProps) {
  const { activeFlashSale } = useFlashSale();

  if (!activeFlashSale) return null;

  const timer = useFlashSaleTimer(activeFlashSale.endTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 rounded-2xl p-6 text-white overflow-hidden relative"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-400 to-red-600 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
          >
            <Flame className="w-8 h-8 text-yellow-300" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold">{activeFlashSale.title}</h2>
            <p className="text-white/90 text-sm">{activeFlashSale.description}</p>
          </div>
        </div>

        {/* Timer */}
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Tugashiga:</span>
          </div>
          
          <div className="flex gap-2">
            {timer.days > 0 && (
              <TimeUnit value={timer.days} label="kun" />
            )}
            <TimeUnit value={timer.hours} label="soat" />
            <TimeUnit value={timer.minutes} label="daq" />
            <TimeUnit value={timer.seconds} label="son" />
          </div>
        </div>

        {/* CTA */}
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="w-full bg-white text-red-600 font-bold py-3 rounded-xl hover:bg-gray-100 transition flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" />
            Barchasini ko'rish
          </button>
        )}
      </div>
    </motion.div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-3 text-center">
      <motion.div
        key={value}
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-3xl font-bold"
      >
        {String(value).padStart(2, '0')}
      </motion.div>
      <div className="text-xs text-white/80 mt-1">{label}</div>
    </div>
  );
}

// Flash sale product grid
interface FlashSaleProductsProps {
  onProductClick?: (productId: string) => void;
}

export function FlashSaleProducts({ onProductClick }: FlashSaleProductsProps) {
  const products = useFlashSaleProducts();
  const { activeFlashSale } = useFlashSale();
  const { haptic } = useTelegram();

  if (!activeFlashSale || products.length === 0) {
    return null;
  }

  const timer = useFlashSaleTimer(activeFlashSale.endTime);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-6 h-6 text-red-600 dark:text-red-400" />
          <h3 className="text-gray-900 dark:text-white font-bold text-xl">
            Flash Sale
          </h3>
        </div>

        {/* Mini Timer */}
        {!timer.isExpired && (
          <div className="flex items-center gap-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1 rounded-full text-sm font-medium">
            <Clock className="w-4 h-4" />
            {timer.hours}:{String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
          </div>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product, index) => {
          const remaining = product.flashSaleData.stockLimit - product.flashSaleData.soldCount;
          const soldPercentage = (product.flashSaleData.soldCount / product.flashSaleData.stockLimit) * 100;

          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (onProductClick) {
                  onProductClick(product.id);
                  haptic.light();
                }
              }}
              className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-red-200 dark:border-red-800 hover:shadow-lg transition cursor-pointer group relative"
            >
              {/* Flash Badge */}
              <div className="absolute top-2 left-2 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow-lg">
                <Zap className="w-3 h-3" />
                -{product.flashSaleData.discount}%
              </div>

              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Sold out overlay */}
                {remaining <= 0 && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      Tugadi
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3">
                <h4 className="text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 min-h-[2.5rem]">
                  {product.name}
                </h4>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-red-600 dark:text-red-400 font-bold text-lg">
                      {formatPrice(product.flashSaleData.flashPrice)}
                    </span>
                  </div>
                  <div className="text-gray-400 text-xs line-through">
                    {formatPrice(product.flashSaleData.originalPrice)}
                  </div>
                </div>

                {/* Stock Progress */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Sotildi: {product.flashSaleData.soldCount}</span>
                    <span className={remaining <= 5 ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                      Qoldi: {remaining}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${soldPercentage}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// Flash sale countdown compact
interface FlashSaleCountdownCompactProps {
  endTime: string;
  onExpire?: () => void;
}

export function FlashSaleCountdownCompact({ endTime, onExpire }: FlashSaleCountdownCompactProps) {
  const timer = useFlashSaleTimer(endTime);

  React.useEffect(() => {
    if (timer.isExpired && onExpire) {
      onExpire();
    }
  }, [timer.isExpired, onExpire]);

  if (timer.isExpired) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full">
      <Flame className="w-4 h-4 animate-pulse" />
      <span className="text-sm font-bold">
        {timer.hours}:{String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

// Flash sale stats (for admin)
export function FlashSaleStats() {
  const { activeFlashSale } = useFlashSale();
  const products = useFlashSaleProducts();

  if (!activeFlashSale) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center">
        <Flame className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">
          Hozirda faol flash sale yo'q
        </p>
      </div>
    );
  }

  const totalStock = products.reduce((sum, p) => sum + p.flashSaleData.stockLimit, 0);
  const totalSold = products.reduce((sum, p) => sum + p.flashSaleData.soldCount, 0);
  const totalRevenue = products.reduce((sum, p) => 
    sum + (p.flashSaleData.flashPrice * p.flashSaleData.soldCount), 0
  );

  const timer = useFlashSaleTimer(activeFlashSale.endTime);

  return (
    <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-red-200 dark:border-red-800">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
          <Flame className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-gray-900 dark:text-white font-bold text-lg">
            {activeFlashSale.title}
          </h3>
          {!timer.isExpired && (
            <p className="text-red-600 dark:text-red-400 text-sm font-medium">
              {timer.hours} soat {timer.minutes} daqiqa qoldi
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Sotildi"
          value={`${totalSold} / ${totalStock}`}
          color="text-green-600 dark:text-green-400"
        />
        <StatCard
          icon={ShoppingCart}
          label="Mahsulotlar"
          value={products.length.toString()}
          color="text-blue-600 dark:text-blue-400"
        />
        <StatCard
          icon={Zap}
          label="Daromad"
          value={formatPrice(totalRevenue)}
          color="text-purple-600 dark:text-purple-400"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
      <Icon className={`w-6 h-6 ${color} mx-auto mb-2`} />
      <p className="text-gray-600 dark:text-gray-400 text-xs mb-1">{label}</p>
      <p className="text-gray-900 dark:text-white font-bold">{value}</p>
    </div>
  );
}

import React from 'react';
