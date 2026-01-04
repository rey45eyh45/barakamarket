import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  illustration?: 'search' | 'empty' | 'error' | 'success';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration
}: EmptyStateProps) {
  
  const illustrations = {
    search: (
      <svg className="w-48 h-48 mx-auto mb-6 opacity-50" viewBox="0 0 400 300" fill="none">
        <circle cx="200" cy="120" r="80" fill="#E5E7EB" />
        <path d="M200 80c-22.091 0-40 17.909-40 40s17.909 40 40 40 40-17.909 40-40-17.909-40-40-40zm0 60c-11.046 0-20-8.954-20-20s8.954-20 20-20 20 8.954 20 20-8.954 20-20 20z" fill="#9CA3AF" />
        <path d="M230 150l40 40" stroke="#9CA3AF" strokeWidth="8" strokeLinecap="round" />
      </svg>
    ),
    empty: (
      <svg className="w-48 h-48 mx-auto mb-6 opacity-50" viewBox="0 0 400 300" fill="none">
        <rect x="100" y="80" width="200" height="160" rx="12" fill="#E5E7EB" />
        <path d="M150 130h100M150 160h80M150 190h100" stroke="#9CA3AF" strokeWidth="8" strokeLinecap="round" />
      </svg>
    ),
    error: (
      <svg className="w-48 h-48 mx-auto mb-6 opacity-50" viewBox="0 0 400 300" fill="none">
        <circle cx="200" cy="150" r="80" fill="#FEE2E2" />
        <path d="M180 130l40 40M220 130l-40 40" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
      </svg>
    ),
    success: (
      <svg className="w-48 h-48 mx-auto mb-6 opacity-50" viewBox="0 0 400 300" fill="none">
        <circle cx="200" cy="150" r="80" fill="#D1FAE5" />
        <path d="M170 150l20 20 40-40" stroke="#10B981" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-12 px-4 text-center"
    >
      {/* Illustration */}
      {illustration && illustrations[illustration]}
      
      {/* Icon */}
      {!illustration && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-6"
        >
          <Icon className="w-10 h-10 text-gray-400 dark:text-gray-500" />
        </motion.div>
      )}

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl text-gray-900 dark:text-white mb-2"
      >
        {title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-500 dark:text-gray-400 max-w-md mb-6"
      >
        {description}
      </motion.p>

      {/* Actions */}
      {(actionLabel || secondaryActionLabel) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          {actionLabel && onAction && (
            <Button onClick={onAction} variant="primary" size="lg">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="secondary" size="lg">
              {secondaryActionLabel}
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

// Preset Empty States
export const EmptyStates = {
  NoProducts: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={props.icon || (() => <span>📦</span>) as any}
      title="Mahsulotlar topilmadi"
      description="Hozircha bu kategoriyada mahsulotlar yo'q. Boshqa kategoriyalarni ko'ring yoki keyinroq qaytib keling."
      illustration="empty"
      {...props}
    />
  ),
  
  NoOrders: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={props.icon || (() => <span>🛒</span>) as any}
      title="Buyurtmalar yo'q"
      description="Siz hali birorta buyurtma bermagansiz. Mahsulotlarni ko'rib chiqing va birinchi xaridingizni qiling!"
      illustration="empty"
      {...props}
    />
  ),
  
  NoSearchResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={props.icon || (() => <span>🔍</span>) as any}
      title="Natija topilmadi"
      description="Qidiruv so'rovingiz bo'yicha hech narsa topilmadi. Boshqa kalit so'zlarni sinab ko'ring."
      illustration="search"
      {...props}
    />
  ),
  
  NoFavorites: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={props.icon || (() => <span>❤️</span>) as any}
      title="Sevimlilar ro'yxati bo'sh"
      description="Siz hali birorta mahsulotni sevimlilarga qo'shmagansiz. Yoqqan mahsulotlar yonidagi yurak belgisini bosing!"
      illustration="empty"
      {...props}
    />
  ),
  
  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={props.icon || (() => <span>⚠️</span>) as any}
      title="Xatolik yuz berdi"
      description="Nimadir noto'g'ri ketdi. Iltimos, qaytadan urinib ko'ring."
      illustration="error"
      {...props}
    />
  ),
};
