import { motion, HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'outlined' | 'ghost';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  hoverable?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      interactive = false,
      hoverable = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Variant styles
    const variantClasses = {
      default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
      elevated: 'bg-white dark:bg-gray-800 shadow-card hover:shadow-card-lg',
      outlined: 'bg-transparent border-2 border-gray-300 dark:border-gray-600',
      ghost: 'bg-gray-50 dark:bg-gray-800/50'
    };

    // Padding styles
    const paddingClasses = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6'
    };

    const baseClasses = `
      rounded-xl
      transition-all duration-300
      ${variantClasses[variant]}
      ${paddingClasses[padding]}
      ${interactive ? 'cursor-pointer' : ''}
      ${className}
    `;

    const motionProps = {
      ...(interactive || hoverable
        ? {
            whileHover: { scale: 1.02, y: -4 },
            whileTap: interactive ? { scale: 0.98 } : undefined,
            transition: {
              type: 'spring',
              stiffness: 400,
              damping: 17
            }
          }
        : {})
    };

    return (
      <motion.div
        ref={ref}
        className={baseClasses}
        {...motionProps}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';

// Card Header
interface CardHeaderProps extends HTMLMotionProps<'div'> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  (
    {
      title,
      subtitle,
      action,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={`pb-3 border-b border-gray-200 ${className}`}
        {...props}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-0.5">
                {subtitle}
              </p>
            )}
            {children}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      </motion.div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

// Card Content
interface CardContentProps extends HTMLMotionProps<'div'> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  (
    {
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={`py-3 ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

CardContent.displayName = 'CardContent';

// Card Footer
interface CardFooterProps extends HTMLMotionProps<'div'> {
  align?: 'left' | 'center' | 'right' | 'between';
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  (
    {
      align = 'right',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const alignClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      between: 'justify-between'
    };

    return (
      <motion.div
        ref={ref}
        className={`pt-3 border-t border-gray-200 flex items-center gap-2 ${alignClasses[align]} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

// Product Card variant
interface ProductCardProps {
  image: string;
  title: string;
  price: number;
  originalPrice?: number; // NEW
  discount?: number; // NEW
  onClick?: () => void;
  onFavorite?: () => void;
  onAddToCart?: () => void;
  isFavorite?: boolean;
  badge?: React.ReactNode;
  className?: string;
}

export const ProductCard = forwardRef<HTMLDivElement, ProductCardProps>(
  (
    {
      image,
      title,
      price,
      originalPrice,
      discount,
      onClick,
      onFavorite,
      onAddToCart,
      isFavorite = false,
      badge,
      className = ''
    },
    ref
  ) => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
    };

    return (
      <Card
        ref={ref}
        variant="elevated"
        padding="none"
        hoverable
        className={className}
      >
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-xl">
          <motion.img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
            onClick={onClick}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Badge */}
          {badge && (
            <div className="absolute top-2 left-2">
              {badge}
            </div>
          )}
          
          {/* Favorite Button */}
          {onFavorite && (
            <motion.button
              onClick={onFavorite}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.svg
                className="w-5 h-5"
                fill={isFavorite ? '#ef4444' : 'none'}
                stroke={isFavorite ? '#ef4444' : 'currentColor'}
                viewBox="0 0 24 24"
                animate={isFavorite ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </motion.svg>
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3
            className="text-gray-900 dark:text-white mb-1 line-clamp-2 min-h-[2.5rem] cursor-pointer"
            onClick={onClick}
          >
            {title}
          </h3>
          
          {/* Price with Discount */}
          {originalPrice && originalPrice > price ? (
            <div className="mb-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400 dark:text-gray-500 line-through text-sm">
                  {formatPrice(originalPrice)}
                </span>
                {discount && (
                  <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs font-bold">
                    -{discount}%
                  </span>
                )}
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-bold">
                {formatPrice(price)}
              </p>
            </div>
          ) : (
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
              {formatPrice(price)}
            </p>
          )}
          
          {/* Add to Cart Button */}
          {onAddToCart && (
            <motion.button
              onClick={onAddToCart}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Savatga</span>
            </motion.button>
          )}
        </div>
      </Card>
    );
  }
);

ProductCard.displayName = 'ProductCard';