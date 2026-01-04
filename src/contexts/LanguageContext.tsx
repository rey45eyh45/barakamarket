// Language Context - Manage app language state

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import all translations statically
import uzTranslations from '../translations/uz';
import ruTranslations from '../translations/ru';
import enTranslations from '../translations/en';

export type Language = 'uz' | 'ru' | 'en';

// Translations map
const TRANSLATIONS: Record<Language, Record<string, any>> = {
  uz: uzTranslations,
  ru: ruTranslations,
  en: enTranslations
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatDate: (date: Date | string, format?: 'short' | 'long' | 'full') => string;
  formatTime: (date: Date | string) => string;
  formatDateTime: (date: Date | string) => string;
  formatPrice: (price: number, currency?: 'UZS' | 'USD') => string;
  formatNumber: (num: number) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({ children, defaultLanguage = 'uz' }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or use default
    const stored = localStorage.getItem('app_language') as Language;
    return stored || defaultLanguage;
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
    document.documentElement.lang = lang;
    
    // Update customer preference if logged in
    const customerId = localStorage.getItem('current_customer_id');
    if (customerId) {
      try {
        // Dynamic import to avoid circular dependencies
        import('../types/customer').then(({ updateCustomerPreferences }) => {
          updateCustomerPreferences(customerId, { language: lang });
        }).catch(error => {
          console.error('Failed to update customer language preference:', error);
        });
      } catch (error) {
        console.error('Failed to update customer language preference:', error);
      }
    }
    
    window.dispatchEvent(new Event('language-changed'));
  };

  // Set initial language on mount
  useEffect(() => {
    document.documentElement.lang = language;
  }, []);

  // Translation function
  const t = (key: string, params?: Record<string, string | number>): string => {
    const translations = TRANSLATIONS[language];
    let text = getNestedValue(translations, key) || key;
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        text = text.replace(`{{${key}}}`, String(value));
      });
    }
    
    return text;
  };

  // Date formatting
  const formatDate = (date: Date | string, format: 'short' | 'long' | 'full' = 'short'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const locales: Record<Language, string> = {
      uz: 'uz-UZ',
      ru: 'ru-RU',
      en: 'en-US'
    };
    
    const options: Record<string, Intl.DateTimeFormatOptions> = {
      short: { day: '2-digit', month: '2-digit', year: 'numeric' },
      long: { day: '2-digit', month: 'long', year: 'numeric' },
      full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
    };
    
    return d.toLocaleDateString(locales[language], options[format]);
  };

  // Time formatting
  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const locales: Record<Language, string> = {
      uz: 'uz-UZ',
      ru: 'ru-RU',
      en: 'en-US'
    };
    
    return d.toLocaleTimeString(locales[language], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // DateTime formatting
  const formatDateTime = (date: Date | string): string => {
    return `${formatDate(date, 'short')} ${formatTime(date)}`;
  };

  // Price formatting
  const formatPrice = (price: number, currency: 'UZS' | 'USD' = 'UZS'): string => {
    if (currency === 'UZS') {
      const formatted = new Intl.NumberFormat('uz-UZ').format(price);
      
      const currencyNames: Record<Language, string> = {
        uz: 'so\'m',
        ru: 'сум',
        en: 'UZS'
      };
      
      return `${formatted} ${currencyNames[language]}`;
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(price);
    }
  };

  // Number formatting
  const formatNumber = (num: number): string => {
    const locales: Record<Language, string> = {
      uz: 'uz-UZ',
      ru: 'ru-RU',
      en: 'en-US'
    };
    
    return new Intl.NumberFormat(locales[language]).format(num);
  };

  // RTL support (for future Arabic/Hebrew support)
  const isRTL = false; // Currently no RTL languages

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    formatDate,
    formatTime,
    formatDateTime,
    formatPrice,
    formatNumber,
    isRTL
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// Helper function to get nested value from object
function getNestedValue(obj: any, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
}

// Export hook for easy use
export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};