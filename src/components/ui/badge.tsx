import { motion, HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';
import { X } from 'lucide-react';

interface BadgeProps extends Omit<HTMLMotionProps<'span'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      dot = false,
      removable = false,
      onRemove,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantClasses = {
      primary: 'bg-blue-100 text-blue-700 border-blue-200',
      secondary: 'bg-gray-100 text-gray-700 border-gray-200',
      success: 'bg-green-100 text-green-700 border-green-200',
      warning: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      error: 'bg-red-100 text-red-700 border-red-200',
      info: 'bg-cyan-100 text-cyan-700 border-cyan-200',
      outline: 'bg-transparent text-gray-700 border-gray-300'
    };

    const dotColors = {
      primary: 'bg-blue-500',
      secondary: 'bg-gray-500',
      success: 'bg-green-500',
      warning: 'bg-yellow-500',
      error: 'bg-red-500',
      info: 'bg-cyan-500',
      outline: 'bg-gray-500'
    };

    // Size styles
    const sizeClasses = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-2.5 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };

    const dotSizes = {
      sm: 'w-1.5 h-1.5',
      md: 'w-2 h-2',
      lg: 'w-2.5 h-2.5'
    };

    const baseClasses = `
      inline-flex items-center gap-1.5
      font-medium
      rounded-full
      border
      transition-all duration-200
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `;

    return (
      <motion.span
        ref={ref}
        className={baseClasses}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17
        }}
        {...props}
      >
        {dot && (
          <span className={`${dotSizes[size]} ${dotColors[variant]} rounded-full`} />
        )}
        
        {children}
        
        {removable && onRemove && (
          <motion.button
            onClick={onRemove}
            className="hover:bg-black/10 rounded-full p-0.5 transition"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-3 h-3" />
          </motion.button>
        )}
      </motion.span>
    );
  }
);

Badge.displayName = 'Badge';

// Status Badge variant
interface StatusBadgeProps extends Omit<HTMLMotionProps<'span'>, 'size'> {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
  (
    {
      status,
      size = 'md',
      className = '',
      ...props
    },
    ref
  ) => {
    const statusConfig = {
      pending: {
        label: 'Kutilmoqda',
        variant: 'warning' as const,
        icon: '⏳'
      },
      processing: {
        label: 'Tayyorlanmoqda',
        variant: 'info' as const,
        icon: '📦'
      },
      shipped: {
        label: 'Yo\'lda',
        variant: 'primary' as const,
        icon: '🚚'
      },
      delivered: {
        label: 'Yetkazildi',
        variant: 'success' as const,
        icon: '✅'
      },
      cancelled: {
        label: 'Bekor qilindi',
        variant: 'error' as const,
        icon: '❌'
      }
    };

    const config = statusConfig[status];

    return (
      <Badge
        ref={ref}
        variant={config.variant}
        size={size}
        className={className}
        {...props}
      >
        <span>{config.icon}</span>
        <span>{config.label}</span>
      </Badge>
    );
  }
);

StatusBadge.displayName = 'StatusBadge';

// Number Badge (for notifications)
interface NumberBadgeProps extends Omit<HTMLMotionProps<'span'>, 'size'> {
  count: number;
  max?: number;
  variant?: 'primary' | 'error';
  size?: 'sm' | 'md';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

export const NumberBadge = forwardRef<HTMLSpanElement, NumberBadgeProps>(
  (
    {
      count,
      max = 99,
      variant = 'error',
      size = 'sm',
      position = 'top-right',
      className = '',
      ...props
    },
    ref
  ) => {
    const displayCount = count > max ? `${max}+` : count;

    const variantClasses = {
      primary: 'bg-blue-500 text-white',
      error: 'bg-red-500 text-white'
    };

    const sizeClasses = {
      sm: 'min-w-[18px] h-[18px] text-xs',
      md: 'min-w-[22px] h-[22px] text-sm'
    };

    const positionClasses = {
      'top-right': 'absolute -top-1 -right-1',
      'top-left': 'absolute -top-1 -left-1',
      'bottom-right': 'absolute -bottom-1 -right-1',
      'bottom-left': 'absolute -bottom-1 -left-1'
    };

    const baseClasses = `
      inline-flex items-center justify-center
      px-1
      rounded-full
      font-bold
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${position ? positionClasses[position] : ''}
      ${className}
    `;

    if (count === 0) return null;

    return (
      <motion.span
        ref={ref}
        className={baseClasses}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 15
        }}
        {...props}
      >
        {displayCount}
      </motion.span>
    );
  }
);

NumberBadge.displayName = 'NumberBadge';

// Chip (interactive badge)
interface ChipProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  icon?: React.ReactNode;
  avatar?: string;
  removable?: boolean;
  onRemove?: () => void;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  (
    {
      variant = 'outline',
      size = 'md',
      selected = false,
      icon,
      avatar,
      removable = false,
      onRemove,
      className = '',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: selected
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200',
      secondary: selected
        ? 'bg-gray-800 text-white border-gray-800'
        : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
      outline: selected
        ? 'bg-blue-600 text-white border-blue-600'
        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:text-blue-600'
    };

    const sizeClasses = {
      sm: 'px-2 py-1 text-xs gap-1',
      md: 'px-3 py-1.5 text-sm gap-1.5',
      lg: 'px-4 py-2 text-base gap-2'
    };

    const iconSizes = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    const avatarSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const baseClasses = `
      inline-flex items-center
      font-medium
      rounded-full
      border
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `;

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled}
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17
        }}
        {...props}
      >
        {avatar && (
          <img
            src={avatar}
            alt=""
            className={`${avatarSizes[size]} rounded-full object-cover`}
          />
        )}
        
        {icon && !avatar && (
          <span className={iconSizes[size]}>
            {icon}
          </span>
        )}
        
        {children}
        
        {removable && onRemove && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="hover:bg-black/10 rounded-full p-0.5 ml-1 transition"
          >
            <X className="w-3 h-3" />
          </span>
        )}
      </motion.button>
    );
  }
);

Chip.displayName = 'Chip';
