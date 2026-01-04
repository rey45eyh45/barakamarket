// Language Switcher Component - Switch between languages

import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage, type Language } from '../contexts/LanguageContext';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'buttons' | 'minimal';
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = 'dropdown', 
  showLabel = true,
  className = '' 
}: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLang = languages.find(l => l.code === language) || languages[0];

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
        >
          <Globe size={20} className="text-gray-600" />
          {showLabel && (
            <span className="text-gray-700 font-medium">
              {currentLang.flag} {currentLang.name}
            </span>
          )}
          {!showLabel && (
            <span className="text-gray-700 font-medium">
              {currentLang.flag}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-all ${
                    language === lang.code ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{lang.flag}</span>
                    <span className={`font-medium ${
                      language === lang.code ? 'text-blue-600' : 'text-gray-700'
                    }`}>
                      {lang.name}
                    </span>
                  </div>
                  {language === lang.code && (
                    <Check size={18} className="text-blue-600" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // Buttons variant
  if (variant === 'buttons') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <div className="flex items-center gap-2 text-gray-600 mr-2">
            <Globe size={20} />
            <span className="text-sm font-medium">{t('settings.language')}:</span>
          </div>
        )}
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              language === lang.code
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {lang.flag} {lang.name}
          </button>
        ))}
      </div>
    );
  }

  // Minimal variant (flags only)
  if (variant === 'minimal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            title={lang.name}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-2xl transition-all ${
              language === lang.code
                ? 'bg-blue-100 ring-2 ring-blue-600'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {lang.flag}
          </button>
        ))}
      </div>
    );
  }

  return null;
}

// Language Badge Component
interface LanguageBadgeProps {
  className?: string;
}

export function LanguageBadge({ className = '' }: LanguageBadgeProps) {
  const { language } = useLanguage();

  const languages: Record<Language, { name: string; flag: string }> = {
    uz: { name: 'UZ', flag: '🇺🇿' },
    ru: { name: 'RU', flag: '🇷🇺' },
    en: { name: 'EN', flag: '🇬🇧' }
  };

  const current = languages[language];

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full ${className}`}>
      <span className="text-sm">{current.flag}</span>
      <span className="text-xs font-semibold text-gray-700">{current.name}</span>
    </div>
  );
}

// Language Select (for forms)
interface LanguageSelectProps {
  value: Language;
  onChange: (lang: Language) => void;
  label?: string;
  className?: string;
}

export function LanguageSelect({ value, onChange, label, className = '' }: LanguageSelectProps) {
  const { t } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'uz', name: 'O\'zbekcha', flag: '🇺🇿' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as Language)}
          className="w-full px-4 py-2.5 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}
