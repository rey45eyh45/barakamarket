import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as TelegramUtils from '../utils/telegram';
import { storage } from '../utils/storage';

interface TelegramContextType {
  isInitialized: boolean;
  isTelegram: boolean;
  user: any | null;
  theme: {
    colorScheme: 'light' | 'dark';
    themeParams: any;
  } | null;
  platform: string | null;
  version: string | null;
  haptic: typeof TelegramUtils.hapticFeedback;
  mainButton: typeof TelegramUtils.mainButton;
  backButton: typeof TelegramUtils.backButton;
  showAlert: typeof TelegramUtils.showAlert;
  showConfirm: typeof TelegramUtils.showConfirm;
  showPopup: typeof TelegramUtils.showPopup;
  openLink: typeof TelegramUtils.openLink;
  shareToTelegram: typeof TelegramUtils.shareToTelegram;
  closeApp: typeof TelegramUtils.closeApp;
  storage: typeof storage; // ← YANGI: Cloud Storage
}

const TelegramContext = createContext<TelegramContextType | undefined>(undefined);

interface TelegramProviderProps {
  children: ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isTelegram, setIsTelegram] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [theme, setTheme] = useState<any>(null);
  const [platform, setPlatform] = useState<string | null>(null);
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    // Load Telegram WebApp script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Telegram WebApp script loaded');
      initializeTelegram();
    };
    
    script.onerror = () => {
      console.log('⚠️ Failed to load Telegram WebApp script');
      // Initialize anyway with mock data for development
      initializeTelegram();
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const initializeTelegram = () => {
    const tg = TelegramUtils.initTelegramWebApp();
    const isTg = TelegramUtils.isTelegramWebApp();
    
    setIsTelegram(isTg);
    
    if (tg) {
      // Real Telegram environment
      setUser(TelegramUtils.getTelegramUser());
      setTheme(TelegramUtils.getTelegramTheme());
      setPlatform(tg.platform);
      setVersion(tg.version);
      TelegramUtils.applyTelegramTheme();
      
      // Listen for theme changes
      tg.onEvent('themeChanged', () => {
        setTheme(TelegramUtils.getTelegramTheme());
        TelegramUtils.applyTelegramTheme();
      });
      
      // Listen for viewport changes
      tg.onEvent('viewportChanged', () => {
        console.log('📱 Viewport changed:', tg.viewportHeight);
      });
    } else {
      // Development mode - use mock data
      console.log('🔧 Development mode - using mock Telegram user');
      setUser(TelegramUtils.getMockTelegramUser());
      setTheme({
        colorScheme: 'light' as const,
        themeParams: {},
      });
      setPlatform('web');
      setVersion('7.0');
    }
    
    setIsInitialized(true);
  };

  const value: TelegramContextType = {
    isInitialized,
    isTelegram,
    user,
    theme,
    platform,
    version,
    haptic: TelegramUtils.hapticFeedback,
    mainButton: TelegramUtils.mainButton,
    backButton: TelegramUtils.backButton,
    showAlert: TelegramUtils.showAlert,
    showConfirm: TelegramUtils.showConfirm,
    showPopup: TelegramUtils.showPopup,
    openLink: TelegramUtils.openLink,
    shareToTelegram: TelegramUtils.shareToTelegram,
    closeApp: TelegramUtils.closeApp,
    storage: storage, // ← YANGI: Cloud Storage
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  const context = useContext(TelegramContext);
  if (context === undefined) {
    throw new Error('useTelegram must be used within a TelegramProvider');
  }
  return context;
}

// Custom hooks for common use cases
export function useTelegramUser() {
  const { user } = useTelegram();
  return user;
}

export function useTelegramTheme() {
  const { theme } = useTelegram();
  return theme;
}

export function useTelegramHaptic() {
  const { haptic } = useTelegram();
  return haptic;
}

export function useTelegramMainButton() {
  const { mainButton } = useTelegram();
  return mainButton;
}

export function useTelegramBackButton() {
  const { backButton } = useTelegram();
  return backButton;
}

export function useTelegramStorage() {
  const { storage } = useTelegram();
  return storage;
}