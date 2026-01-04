import React from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  showDetails?: boolean;
}

export function ErrorState({
  title = 'Xatolik yuz berdi',
  message = 'Nimadir noto\'g\'ri ketdi. Iltimos, qaytadan urinib ko\'ring.',
  error,
  onRetry,
  onGoBack,
  onGoHome,
  showDetails = false
}: ErrorStateProps) {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);

  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center min-h-[400px]"
    >
      {/* Error Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6"
      >
        <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-2xl text-gray-900 dark:text-white mb-2"
      >
        {title}
      </motion.h2>

      {/* Message */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 dark:text-gray-400 max-w-md mb-2"
      >
        {message}
      </motion.p>

      {/* Error Message */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-4 py-2 rounded-lg max-w-md">
            {errorMessage}
          </p>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap gap-3 justify-center mb-4"
      >
        {onRetry && (
          <Button onClick={onRetry} variant="primary" size="lg">
            <RefreshCw className="w-4 h-4 mr-2" />
            Qaytadan urinish
          </Button>
        )}
        {onGoBack && (
          <Button onClick={onGoBack} variant="secondary" size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Orqaga
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="secondary" size="lg">
            <Home className="w-4 h-4 mr-2" />
            Bosh sahifa
          </Button>
        )}
      </motion.div>

      {/* Error Details (Development) */}
      {showDetails && errorStack && (
        <div className="mt-6 w-full max-w-2xl">
          <button
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-2"
          >
            {showErrorDetails ? '▼' : '▶'} Texnik ma'lumotlar
          </button>
          {showErrorDetails && (
            <motion.pre
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-left text-xs bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-64"
            >
              {errorStack}
            </motion.pre>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Network Error Component
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="Internet aloqasi yo'q"
      message="Iltimos, internet aloqangizni tekshiring va qaytadan urinib ko'ring."
      error="Network connection failed"
      onRetry={onRetry}
    />
  );
}

// Not Found Error Component
export function NotFoundError({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <ErrorState
      title="Sahifa topilmadi"
      message="Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan."
      error="404 - Page not found"
      onGoHome={onGoHome}
    />
  );
}

// Permission Error Component
export function PermissionError({ onGoBack }: { onGoBack?: () => void }) {
  return (
    <ErrorState
      title="Ruxsat yo'q"
      message="Sizda bu sahifani ko'rish uchun ruxsat yo'q."
      error="403 - Permission denied"
      onGoBack={onGoBack}
    />
  );
}
