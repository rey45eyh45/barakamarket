import { motion } from 'motion/react';
import { Tag, Percent, TrendingDown, Zap, Flame } from 'lucide-react';
import { formatPrice } from '../utils/formatters';

interface DiscountBadgeProps {
  discount: number; // Percentage (0-100)
  size?: 'sm' | 'md' | 'lg';
  style?: 'default' | 'flash' | 'hot' | 'premium';
  animated?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function DiscountBadge({ 
  discount, 
  size = 'md',
  style = 'default',
  animated = true,
  position = 'top-right'
}: DiscountBadgeProps) {
  if (!discount || discount <= 0) return null;

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  const styles = {
    default: {
      bg: 'bg-red-600',
      text: 'text-white',
      icon: Percent
    },
    flash: {
      bg: 'bg-gradient-to-r from-yellow-400 to-orange-500',
      text: 'text-white',
      icon: Zap
    },
    hot: {
      bg: 'bg-gradient-to-r from-red-500 to-pink-500',
      text: 'text-white',
      icon: Flame
    },
    premium: {
      bg: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      text: 'text-white',
      icon: TrendingDown
    }
  };

  const positions = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2',
    'bottom-right': 'bottom-2 right-2'
  };

  const config = styles[style];
  const Icon = config.icon;

  const badge = (
    <div
      className={`
        ${config.bg} ${config.text} ${sizes[size]}
        rounded-lg font-bold shadow-md
        flex items-center gap-1
      `}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
      <span>-{discount}%</span>
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 15 
        }}
        className={`absolute ${positions[position]} z-10`}
      >
        {style === 'flash' && (
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ 
              duration: 1, 
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          >
            {badge}
          </motion.div>
        )}
        {style !== 'flash' && badge}
      </motion.div>
    );
  }

  return <div className={`absolute ${positions[position]} z-10`}>{badge}</div>;
}

// Price display with discount
interface DiscountPriceProps {
  originalPrice: number;
  discount: number;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'horizontal' | 'vertical';
  showSavings?: boolean;
}

export function DiscountPrice({ 
  originalPrice, 
  discount,
  size = 'md',
  layout = 'horizontal',
  showSavings = true
}: DiscountPriceProps) {
  const discountedPrice = Math.round(originalPrice * (1 - discount / 100));
  const savings = originalPrice - discountedPrice;

  const sizes = {
    sm: {
      current: 'text-base',
      original: 'text-xs',
      savings: 'text-xs'
    },
    md: {
      current: 'text-xl',
      original: 'text-sm',
      savings: 'text-sm'
    },
    lg: {
      current: 'text-2xl',
      original: 'text-base',
      savings: 'text-base'
    }
  };

  const sizeConfig = sizes[size];

  if (layout === 'vertical') {
    return (
      <div className="space-y-1">
        <div className={`${sizeConfig.current} font-bold text-red-600 dark:text-red-400`}>
          {formatPrice(discountedPrice)}
        </div>
        <div className={`${sizeConfig.original} text-gray-400 line-through`}>
          {formatPrice(originalPrice)}
        </div>
        {showSavings && (
          <div className={`${sizeConfig.savings} text-green-600 dark:text-green-400 font-medium`}>
            {formatPrice(savings)} tejaldi
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`${sizeConfig.current} font-bold text-red-600 dark:text-red-400`}>
        {formatPrice(discountedPrice)}
      </span>
      <span className={`${sizeConfig.original} text-gray-400 line-through`}>
        {formatPrice(originalPrice)}
      </span>
      {showSavings && (
        <span className={`${sizeConfig.savings} text-green-600 dark:text-green-400 font-medium`}>
          ({formatPrice(savings)} tejaldi)
        </span>
      )}
    </div>
  );
}

// Promo code input
interface PromoCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onApply: () => void;
  isApplying?: boolean;
  error?: string;
  success?: string;
}

export function PromoCodeInput({
  value,
  onChange,
  onApply,
  isApplying = false,
  error,
  success
}: PromoCodeInputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Promo kod
      </label>
      
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            placeholder="PROMO2024"
            className={`
              w-full px-4 py-2.5 border rounded-lg
              ${error 
                ? 'border-red-300 dark:border-red-700 focus:ring-red-500' 
                : success
                ? 'border-green-300 dark:border-green-700 focus:ring-green-500'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
              }
              focus:ring-2 focus:border-transparent
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              uppercase
            `}
          />
          <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
        
        <button
          onClick={onApply}
          disabled={isApplying || !value}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
        >
          {isApplying ? 'Tekshirilmoqda...' : 'Qo\'llash'}
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          ❌ {error}
        </motion.p>
      )}

      {success && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
        >
          ✅ {success}
        </motion.p>
      )}
    </div>
  );
}

// Applied promo code display
interface AppliedPromoCodeProps {
  code: string;
  discount: number;
  type: 'percentage' | 'fixed';
  onRemove: () => void;
}

export function AppliedPromoCode({ code, discount, type, onRemove }: AppliedPromoCodeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-800/50 rounded-full flex items-center justify-center">
            <Tag className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-green-900 dark:text-green-100 font-medium text-sm">
              {code}
            </p>
            <p className="text-green-600 dark:text-green-400 text-xs">
              {type === 'percentage' 
                ? `-${discount}% chegirma` 
                : `-${formatPrice(discount)} chegirma`
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={onRemove}
          className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm underline"
        >
          Bekor qilish
        </button>
      </div>
    </motion.div>
  );
}

// Flash sale countdown
interface FlashSaleCountdownProps {
  endTime: string; // ISO date string
  onExpire?: () => void;
}

export function FlashSaleCountdown({ endTime, onExpire }: FlashSaleCountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState<{
    hours: number;
    minutes: number;
    seconds: number;
  }>({ hours: 0, minutes: 0, seconds: 0 });

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const end = new Date(endTime).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        if (onExpire) onExpire();
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [endTime, onExpire]);

  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-5 h-5 animate-pulse" />
        <span className="font-bold">Chegirma tugashiga:</span>
      </div>
      <div className="flex gap-2">
        <div className="bg-white/20 rounded px-3 py-1 text-center min-w-[50px]">
          <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs">soat</div>
        </div>
        <div className="bg-white/20 rounded px-3 py-1 text-center min-w-[50px]">
          <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs">daq</div>
        </div>
        <div className="bg-white/20 rounded px-3 py-1 text-center min-w-[50px]">
          <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs">son</div>
        </div>
      </div>
    </div>
  );
}

// Import React for countdown
import React from 'react';
