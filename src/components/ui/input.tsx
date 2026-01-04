import { motion } from 'motion/react';
import { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      size = 'md',
      fullWidth = true,
      type = 'text',
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = type === 'password';
    const hasError = !!error;
    const hasSuccess = !!success;

    // Size styles
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-4 py-3 text-lg'
    };

    const iconSizes = {
      sm: 'w-4 h-4',
      md: 'w-5 h-5',
      lg: 'w-6 h-6'
    };

    // Status colors
    const statusClasses = hasError
      ? 'border-red-500 focus:ring-red-500/20'
      : hasSuccess
      ? 'border-green-500 focus:ring-green-500/20'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20';

    const baseClasses = `
      w-${fullWidth ? 'full' : 'auto'}
      bg-white
      border-2
      rounded-lg
      transition-all duration-200
      outline-none
      focus:ring-4
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
      ${statusClasses}
      ${sizeClasses[size]}
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon || isPassword ? 'pr-10' : ''}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {/* Label */}
        {label && (
          <motion.label
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </motion.label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 ${iconSizes[size]}`}
            >
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <motion.input
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={baseClasses}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            animate={{
              scale: isFocused ? 1.01 : 1
            }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30
            }}
            {...props}
          />

          {/* Right Icon / Password Toggle / Status Icon */}
          {(rightIcon || isPassword || hasError || hasSuccess) && (
            <div
              className={`absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 ${iconSizes[size]}`}
            >
              {hasError && <AlertCircle className="text-red-500" />}
              {hasSuccess && <CheckCircle className="text-green-500" />}
              
              {isPassword && !hasError && !hasSuccess && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              )}
              
              {rightIcon && !isPassword && !hasError && !hasSuccess && rightIcon}
            </div>
          )}

          {/* Focus Ring Animation */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-lg pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </div>

        {/* Helper Text */}
        {(error || success || hint) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5"
          >
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </p>
            )}
            {success && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{success}</span>
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-sm text-gray-500">{hint}</p>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      success,
      hint,
      fullWidth = true,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasError = !!error;
    const hasSuccess = !!success;

    const statusClasses = hasError
      ? 'border-red-500 focus:ring-red-500/20'
      : hasSuccess
      ? 'border-green-500 focus:ring-green-500/20'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20';

    const baseClasses = `
      w-${fullWidth ? 'full' : 'auto'}
      min-h-[100px]
      bg-white
      border-2
      rounded-lg
      px-4 py-2
      transition-all duration-200
      outline-none
      focus:ring-4
      resize-vertical
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
      ${statusClasses}
      ${className}
    `;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <motion.label
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="block text-sm font-medium text-gray-700 mb-1.5"
          >
            {label}
          </motion.label>
        )}

        <motion.textarea
          ref={ref}
          className={baseClasses}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          animate={{
            scale: isFocused ? 1.01 : 1
          }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30
          }}
          {...props}
        />

        {(error || success || hint) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5"
          >
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </p>
            )}
            {success && (
              <p className="text-sm text-green-500 flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                <span>{success}</span>
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-sm text-gray-500">{hint}</p>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
