import { CheckCircle, Shield, Star, Award, Crown, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export type VendorVerificationLevel = 
  | 'verified'      // ✓ Tekshirilgan
  | 'trusted'       // ⭐ Ishonchli
  | 'premium'       // 👑 Premium
  | 'pro'           // ⚡ Pro
  | 'top'           // 🏆 Top sotuvchi
  | null;

interface VendorBadgeProps {
  level: VendorVerificationLevel;
  vendorName?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function VendorBadge({ 
  level, 
  vendorName, 
  showLabel = true, 
  size = 'md',
  animated = true 
}: VendorBadgeProps) {
  if (!level) return null;

  const configs = {
    verified: {
      icon: CheckCircle,
      label: 'Tekshirilgan',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      description: 'Shaxsi tasdiqlangan sotuvchi'
    },
    trusted: {
      icon: Star,
      label: 'Ishonchli',
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      description: 'Yuqori reytingga ega sotuvchi'
    },
    premium: {
      icon: Crown,
      label: 'Premium',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      borderColor: 'border-purple-200 dark:border-purple-800',
      description: 'Premium obunali sotuvchi'
    },
    pro: {
      icon: Zap,
      label: 'Pro',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-100 dark:bg-orange-900/30',
      borderColor: 'border-orange-200 dark:border-orange-800',
      description: 'Professional sotuvchi'
    },
    top: {
      icon: Award,
      label: 'Top Sotuvchi',
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      description: 'Eng yaxshi sotuvchi'
    }
  };

  const config = configs[level];
  const Icon = config.icon;

  const sizes = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 'w-3 h-3',
      text: 'text-xs'
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-1.5',
      icon: 'w-4 h-4',
      text: 'text-sm'
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 'w-5 h-5',
      text: 'text-base'
    }
  };

  const sizeConfig = sizes[size];

  const badge = (
    <div
      className={`
        inline-flex items-center rounded-full font-medium
        ${config.bgColor} ${config.color} ${sizeConfig.container}
        border ${config.borderColor}
      `}
      title={config.description}
    >
      <Icon className={sizeConfig.icon} />
      {showLabel && <span className={sizeConfig.text}>{config.label}</span>}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          type: 'spring', 
          stiffness: 500, 
          damping: 30 
        }}
        className="inline-block"
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
}

// Vendor Card with Badge
interface VendorCardProps {
  vendor: {
    id: string;
    name: string;
    avatar?: string;
    verificationLevel: VendorVerificationLevel;
    rating?: number;
    reviewsCount?: number;
    productsCount?: number;
  };
  onClick?: () => void;
}

export function VendorCard({ vendor, onClick }: VendorCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
          {vendor.avatar ? (
            <img src={vendor.avatar} alt={vendor.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            vendor.name.charAt(0).toUpperCase()
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-gray-900 dark:text-white font-medium truncate">
              {vendor.name}
            </h3>
            <VendorBadge level={vendor.verificationLevel} showLabel={false} size="sm" />
          </div>
          
          {vendor.rating !== undefined && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{vendor.rating.toFixed(1)}</span>
              </div>
              {vendor.reviewsCount && (
                <span>({vendor.reviewsCount} ta sharh)</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {vendor.productsCount !== undefined && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {vendor.productsCount} ta mahsulot
          </span>
          <VendorBadge level={vendor.verificationLevel} size="sm" />
        </div>
      )}
    </motion.div>
  );
}

// Inline vendor info (for product cards)
interface VendorInfoInlineProps {
  vendorName: string;
  verificationLevel: VendorVerificationLevel;
  size?: 'sm' | 'md';
}

export function VendorInfoInline({ vendorName, verificationLevel, size = 'sm' }: VendorInfoInlineProps) {
  return (
    <div className="flex items-center gap-2">
      <Shield className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
      <span className={`text-gray-600 dark:text-gray-400 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
        {vendorName}
      </span>
      <VendorBadge level={verificationLevel} showLabel={false} size={size} />
    </div>
  );
}

// Get vendor verification requirements
export function getVerificationRequirements(level: VendorVerificationLevel): string[] {
  const requirements: Record<string, string[]> = {
    verified: [
      'Pasport/ID tasdiqlanishi',
      'Telefon raqam tasdiqlash',
      'Email tasdiqlash'
    ],
    trusted: [
      'Verified statusga ega bo\'lish',
      '4.5+ yulduzli reyting',
      'Kamida 50 ta sotilgan mahsulot',
      'Kamida 20 ta ijobiy sharh'
    ],
    premium: [
      'Trusted statusga ega bo\'lish',
      'Oylik obuna to\'lovi',
      'Biznes hujjatlari',
      '100+ sotilgan mahsulot'
    ],
    pro: [
      'Premium statusga ega bo\'lish',
      'Professional biznes hisob',
      '500+ sotilgan mahsulot',
      '4.8+ reyting'
    ],
    top: [
      'Pro statusga ega bo\'lish',
      '1000+ sotilgan mahsulot',
      '4.9+ reyting',
      'Platformaning top 10 sotuvchisi'
    ]
  };

  return level ? requirements[level] || [] : [];
}
