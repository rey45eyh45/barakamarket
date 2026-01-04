// Telegram WebApp SDK utilities

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      photo_url?: string;
    };
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  onEvent: (eventType: string, callback: () => void) => void;
  offEvent: (eventType: string, callback: () => void) => void;
  sendData: (data: string) => void;
  openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
  openTelegramLink: (url: string) => void;
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  showScanQrPopup: (params: { text?: string }, callback?: (data: string) => void) => boolean;
  closeScanQrPopup: () => void;
  readTextFromClipboard: (callback?: (text: string) => void) => void;
  requestWriteAccess: (callback?: (granted: boolean) => void) => void;
  requestContact: (callback?: (granted: boolean, contact?: any) => void) => void;
  switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

// Check if running in Telegram
export const isTelegramWebApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp;
};

// Get Telegram WebApp instance
export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (isTelegramWebApp()) {
    return window.Telegram!.WebApp;
  }
  return null;
};

// Initialize Telegram WebApp
export const initTelegramWebApp = (): TelegramWebApp | null => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.ready();
    tg.expand();
    console.log('✅ Telegram WebApp initialized');
    console.log('📱 Platform:', tg.platform);
    console.log('📌 Version:', tg.version);
    console.log('🎨 Theme:', tg.colorScheme);
    console.log('👤 User:', tg.initDataUnsafe.user);
    
    // Check haptic support
    const version = parseFloat(tg.version);
    if (version < 6.1) {
      console.log('⚠️ HapticFeedback not supported (requires 6.1+, current:', tg.version + ')');
    } else {
      console.log('✅ HapticFeedback supported');
    }
    
    return tg;
  }
  console.log('⚠️ Not running in Telegram WebApp');
  return null;
};

// Get Telegram user
export const getTelegramUser = () => {
  const tg = getTelegramWebApp();
  return tg?.initDataUnsafe.user || null;
};

// Check if HapticFeedback is supported (requires version 6.1+)
const isHapticSupported = (): boolean => {
  const tg = getTelegramWebApp();
  if (!tg) return false;
  
  // HapticFeedback requires version 6.1 or higher
  const version = parseFloat(tg.version);
  return version >= 6.1 && !!tg.HapticFeedback;
};

// Haptic feedback helpers with version check
export const hapticFeedback = {
  light: () => {
    if (!isHapticSupported()) return;
    getTelegramWebApp()?.HapticFeedback.impactOccurred('light');
  },
  medium: () => {
    if (!isHapticSupported()) return;
    getTelegramWebApp()?.HapticFeedback.impactOccurred('medium');
  },
  heavy: () => {
    if (!isHapticSupported()) return;
    getTelegramWebApp()?.HapticFeedback.impactOccurred('heavy');
  },
  success: () => {
    if (!isHapticSupported()) return;
    getTelegramWebApp()?.HapticFeedback.notificationOccurred('success');
  },
  error: () => {
    if (!isHapticSupported()) return;
    getTelegramWebApp()?.HapticFeedback.notificationOccurred('error');
  },
  warning: () => {
    if (!isHapticSupported()) return;
    getTelegramWebApp()?.HapticFeedback.notificationOccurred('warning');
  },
  selection: () => {
    if (!isHapticSupported()) return;
    getTelegramWebApp()?.HapticFeedback.selectionChanged();
  },
};

// Theme helpers
export const getTelegramTheme = () => {
  const tg = getTelegramWebApp();
  if (!tg) return null;
  
  return {
    colorScheme: tg.colorScheme,
    themeParams: tg.themeParams,
    headerColor: tg.headerColor,
    backgroundColor: tg.backgroundColor,
  };
};

// Apply Telegram theme to app
export const applyTelegramTheme = () => {
  const tg = getTelegramWebApp();
  if (!tg) return;

  const root = document.documentElement;
  
  // Apply theme
  if (tg.colorScheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Apply custom colors if available
  if (tg.themeParams.bg_color) {
    root.style.setProperty('--tg-bg-color', tg.themeParams.bg_color);
  }
  if (tg.themeParams.text_color) {
    root.style.setProperty('--tg-text-color', tg.themeParams.text_color);
  }
  if (tg.themeParams.button_color) {
    root.style.setProperty('--tg-button-color', tg.themeParams.button_color);
  }
  if (tg.themeParams.button_text_color) {
    root.style.setProperty('--tg-button-text-color', tg.themeParams.button_text_color);
  }
  if (tg.themeParams.link_color) {
    root.style.setProperty('--tg-link-color', tg.themeParams.link_color);
  }
};

// Main Button helpers
export const mainButton = {
  show: (text: string, onClick: () => void) => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
  },
  hide: () => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.MainButton.hide();
  },
  setText: (text: string) => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.MainButton.setText(text);
  },
  showProgress: () => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.MainButton.showProgress();
  },
  hideProgress: () => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.MainButton.hideProgress();
  },
  enable: () => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.MainButton.enable();
  },
  disable: () => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.MainButton.disable();
  },
};

// Back Button helpers
export const backButton = {
  show: (onClick: () => void) => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.BackButton.show();
    tg.BackButton.onClick(onClick);
  },
  hide: () => {
    const tg = getTelegramWebApp();
    if (!tg) return;
    
    tg.BackButton.hide();
  },
};

// Show alert
export const showAlert = (message: string, callback?: () => void) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showAlert(message, callback);
  } else {
    alert(message);
    callback?.();
  }
};

// Show confirm
export const showConfirm = (message: string, callback?: (confirmed: boolean) => void) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showConfirm(message, callback);
  } else {
    const confirmed = confirm(message);
    callback?.(confirmed);
  }
};

// Show popup
export const showPopup = (
  params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  },
  callback?: (buttonId: string) => void
) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.showPopup(params, callback);
  } else {
    alert(params.message);
    callback?.('ok');
  }
};

// Open link
export const openLink = (url: string) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.openLink(url);
  } else {
    window.open(url, '_blank');
  }
};

// Open Telegram link
export const openTelegramLink = (url: string) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }
};

// Share to Telegram
export const shareToTelegram = (text: string, url?: string) => {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url || window.location.href)}&text=${encodeURIComponent(text)}`;
  openTelegramLink(shareUrl);
};

// Close app
export const closeApp = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.close();
  }
};

// Enable closing confirmation
export const enableClosingConfirmation = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.enableClosingConfirmation();
  }
};

// Disable closing confirmation
export const disableClosingConfirmation = () => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.disableClosingConfirmation();
  }
};

// Request contact
export const requestContact = (callback?: (granted: boolean, contact?: any) => void) => {
  const tg = getTelegramWebApp();
  if (tg) {
    tg.requestContact(callback);
  } else {
    callback?.(false);
  }
};

// Mock user for development
export const getMockTelegramUser = () => {
  return {
    id: 123456789,
    first_name: 'Ibrohim',
    last_name: 'Komilov',
    username: 'ibrohimkomilov',
    language_code: 'uz',
    is_premium: false,
  };
};

// Get user (real or mock for development)
export const getUser = () => {
  const tgUser = getTelegramUser();
  if (tgUser) return tgUser;
  
  // Development mode - return mock user
  const isDev = typeof window !== 'undefined' && 
                (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  if (isDev) {
    return getMockTelegramUser();
  }
  
  return null;
};

export default {
  isTelegramWebApp,
  getTelegramWebApp,
  initTelegramWebApp,
  getTelegramUser,
  hapticFeedback,
  getTelegramTheme,
  applyTelegramTheme,
  mainButton,
  backButton,
  showAlert,
  showConfirm,
  showPopup,
  openLink,
  openTelegramLink,
  shareToTelegram,
  closeApp,
  enableClosingConfirmation,
  disableClosingConfirmation,
  requestContact,
  getUser,
};