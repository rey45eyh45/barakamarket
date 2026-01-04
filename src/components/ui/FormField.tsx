import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  helperText?: string;
  validate?: (value: string) => string | null;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  rows?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  icon?: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  disabled = false,
  helperText,
  validate,
  validateOnChange = false,
  validateOnBlur = true,
  rows = 3,
  maxLength,
  min,
  max,
  icon,
  className = ''
}: FormFieldProps) {
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleValidation = () => {
    if (!validate) return;
    
    const validationError = validate(value);
    setError(validationError);
    setIsValid(!validationError && value.length > 0);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (validateOnChange && touched) {
      handleValidation();
    }
  };

  const handleBlur = () => {
    setTouched(true);
    if (validateOnBlur) {
      handleValidation();
    }
    onBlur?.();
  };

  useEffect(() => {
    if (touched && validateOnChange) {
      handleValidation();
    }
  }, [value]);

  const inputClasses = `
    w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
    ${icon ? 'pl-12' : ''}
    ${type === 'password' ? 'pr-12' : ''}
    ${error && touched ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' : ''}
    ${isValid && touched ? 'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200' : ''}
    ${!error && !isValid ? 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200' : ''}
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}
    focus:outline-none
    dark:bg-gray-800 dark:border-gray-700 dark:text-white
    ${className}
  `.trim();

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="mb-4">
      {/* Label */}
      <label htmlFor={name} className="block text-gray-700 dark:text-gray-300 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input Container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}

        {/* Input/Textarea */}
        <InputComponent
          id={name}
          name={name}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={type === 'textarea' ? rows : undefined}
          maxLength={maxLength}
          min={min}
          max={max}
          className={inputClasses}
        />

        {/* Password Toggle */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}

        {/* Validation Icons */}
        {touched && !error && isValid && type !== 'password' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
          </motion.div>
        )}

        {touched && error && type !== 'password' && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
          </motion.div>
        )}
      </div>

      {/* Helper Text / Error / Character Count */}
      <div className="mt-2 flex items-center justify-between">
        <AnimatePresence mode="wait">
          {touched && error ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.p>
          ) : touched && isValid ? (
            <motion.p
              key="success"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <CheckCircle className="w-4 h-4" />
              To'g'ri
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="helper"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {helperText}
            </motion.p>
          ) : (
            <span />
          )}
        </AnimatePresence>

        {maxLength && (
          <span className={`text-sm ${value.length > maxLength * 0.9 ? 'text-orange-500' : 'text-gray-400'}`}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

// Common Validators
export const Validators = {
  required: (message = 'Bu maydon to\'ldirilishi shart') => (value: string) => {
    return value.trim() ? null : message;
  },

  email: (message = 'Noto\'g\'ri email format') => (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : message;
  },

  minLength: (min: number, message?: string) => (value: string) => {
    return value.length >= min ? null : message || `Kamida ${min} ta belgi kerak`;
  },

  maxLength: (max: number, message?: string) => (value: string) => {
    return value.length <= max ? null : message || `Maksimal ${max} ta belgi`;
  },

  phone: (message = 'Noto\'g\'ri telefon raqami') => (value: string) => {
    const phoneRegex = /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/;
    return phoneRegex.test(value) ? null : message;
  },

  url: (message = 'Noto\'g\'ri URL') => (value: string) => {
    try {
      new URL(value);
      return null;
    } catch {
      return message;
    }
  },

  number: (message = 'Faqat raqam kiriting') => (value: string) => {
    return !isNaN(Number(value)) ? null : message;
  },

  min: (min: number, message?: string) => (value: string) => {
    return Number(value) >= min ? null : message || `Kamida ${min} bo'lishi kerak`;
  },

  max: (max: number, message?: string) => (value: string) => {
    return Number(value) <= max ? null : message || `Maksimal ${max} bo'lishi kerak`;
  },

  password: (message = 'Parol kamida 8 ta belgi, 1 ta harf va 1 ta raqamdan iborat bo\'lishi kerak') => (value: string) => {
    const hasMinLength = value.length >= 8;
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasNumber = /\d/.test(value);
    
    return hasMinLength && hasLetter && hasNumber ? null : message;
  },

  // Combine multiple validators
  combine: (...validators: Array<(value: string) => string | null>) => (value: string) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  }
};
