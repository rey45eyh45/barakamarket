import { motion, HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  haptic?: 'light' | 'medium' | 'heavy' | 'success' | 'error';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      icon,
      iconPosition = 'left',
      loading = false,
      haptic,
      children,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow-md',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md',
      danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm hover:shadow-md',
      success: 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 shadow-sm hover:shadow-md'
    };

    // Size styles
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm rounded-lg',
      md: 'px-4 py-2 text-base rounded-lg',
      lg: 'px-6 py-3 text-lg rounded-xl'
    };

    // Icon sizes
    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-medium transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${fullWidth ? 'w-full' : ''}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `;

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled || loading}
        whileTap={{ scale: disabled || loading ? 1 : 0.95 }}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17
        }}
        {...props}
      >
        {loading && (
          <motion.div
            className={`border-2 border-white/30 border-t-white rounded-full ${iconSizes[size]}`}
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span className={iconSizes[size]}>{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span className={iconSizes[size]}>{icon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

// Icon Button variant
interface IconButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      icon,
      variant = 'ghost',
      size = 'md',
      rounded = false,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
      ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200',
      destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm'
    };

    const sizeClasses = {
      sm: 'p-1.5',
      md: 'p-2',
      lg: 'p-3'
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    const baseClasses = `
      inline-flex items-center justify-center
      transition-all duration-200
      disabled:opacity-50 disabled:cursor-not-allowed
      ${rounded ? 'rounded-full' : 'rounded-lg'}
      ${variantClasses[variant]}
      ${sizeClasses[size]}
      ${className}
    `;

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.9 }}
        whileHover={{ scale: disabled ? 1 : 1.1 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17
        }}
        {...props}
      >
        <span className={iconSizes[size]}>{icon}</span>
      </motion.button>
    );
  }
);

IconButton.displayName = 'IconButton';

// Floating Action Button
interface FABProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'destructive';
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  size?: 'md' | 'lg';
}

export const FAB = forwardRef<HTMLButtonElement, FABProps>(
  (
    {
      icon,
      variant = 'primary',
      position = 'bottom-right',
      size = 'lg',
      className = '',
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-lg hover:shadow-xl',
      secondary: 'bg-gray-800 text-white hover:bg-gray-900 active:bg-black shadow-lg hover:shadow-xl',
      destructive: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-lg hover:shadow-xl'
    };

    const positionClasses = {
      'bottom-right': 'fixed bottom-20 right-4',
      'bottom-left': 'fixed bottom-20 left-4',
      'top-right': 'fixed top-4 right-4',
      'top-left': 'fixed top-4 left-4'
    };

    const sizeClasses = {
      md: 'w-14 h-14',
      lg: 'w-16 h-16'
    };

    const iconSizes = {
      md: 'w-6 h-6',
      lg: 'w-7 h-7'
    };

    const baseClasses = `
      inline-flex items-center justify-center
      rounded-full
      transition-all duration-200
      z-50
      ${variantClasses[variant]}
      ${positionClasses[position]}
      ${sizeClasses[size]}
      ${className}
    `;

    return (
      <motion.button
        ref={ref}
        className={baseClasses}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17
        }}
        {...props}
      >
        <span className={iconSizes[size]}>{icon}</span>
      </motion.button>
    );
  }
);

FAB.displayName = 'FAB';