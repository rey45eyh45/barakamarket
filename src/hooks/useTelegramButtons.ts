import { useEffect, useCallback } from 'react';
import { useTelegram } from '../contexts/TelegramContext';

interface MainButtonOptions {
  text: string;
  onClick: () => void;
  enabled?: boolean;
  color?: string;
  textColor?: string;
  isVisible?: boolean;
  isProgressVisible?: boolean;
}

interface BackButtonOptions {
  onClick: () => void;
  isVisible?: boolean;
}

export function useMainButton(options: MainButtonOptions) {
  const { webApp } = useTelegram();

  const {
    text,
    onClick,
    enabled = true,
    color,
    textColor,
    isVisible = true,
    isProgressVisible = false
  } = options;

  useEffect(() => {
    if (!webApp) return;

    const mainButton = webApp.MainButton;

    // Set button text
    mainButton.setText(text);

    // Set colors if provided
    if (color) mainButton.setParams({ color });
    if (textColor) mainButton.setParams({ text_color: textColor });

    // Set enabled/disabled state
    if (enabled) {
      mainButton.enable();
    } else {
      mainButton.disable();
    }

    // Show/hide button
    if (isVisible) {
      mainButton.show();
    } else {
      mainButton.hide();
    }

    // Show/hide progress
    if (isProgressVisible) {
      mainButton.showProgress();
    } else {
      mainButton.hideProgress();
    }

    // Cleanup on unmount
    return () => {
      mainButton.hide();
      mainButton.hideProgress();
    };
  }, [webApp, text, enabled, color, textColor, isVisible, isProgressVisible]);

  useEffect(() => {
    if (!webApp) return;

    const mainButton = webApp.MainButton;
    mainButton.onClick(onClick);

    return () => {
      mainButton.offClick(onClick);
    };
  }, [webApp, onClick]);

  const showProgress = useCallback(() => {
    if (!webApp) return;
    webApp.MainButton.showProgress();
  }, [webApp]);

  const hideProgress = useCallback(() => {
    if (!webApp) return;
    webApp.MainButton.hideProgress();
  }, [webApp]);

  const setText = useCallback((newText: string) => {
    if (!webApp) return;
    webApp.MainButton.setText(newText);
  }, [webApp]);

  const enable = useCallback(() => {
    if (!webApp) return;
    webApp.MainButton.enable();
  }, [webApp]);

  const disable = useCallback(() => {
    if (!webApp) return;
    webApp.MainButton.disable();
  }, [webApp]);

  const show = useCallback(() => {
    if (!webApp) return;
    webApp.MainButton.show();
  }, [webApp]);

  const hide = useCallback(() => {
    if (!webApp) return;
    webApp.MainButton.hide();
  }, [webApp]);

  return {
    showProgress,
    hideProgress,
    setText,
    enable,
    disable,
    show,
    hide
  };
}

export function useBackButton(options: BackButtonOptions) {
  const { webApp } = useTelegram();
  const { onClick, isVisible = true } = options;

  useEffect(() => {
    if (!webApp) return;

    const backButton = webApp.BackButton;

    // Show/hide button
    if (isVisible) {
      backButton.show();
    } else {
      backButton.hide();
    }

    // Cleanup on unmount
    return () => {
      backButton.hide();
    };
  }, [webApp, isVisible]);

  useEffect(() => {
    if (!webApp) return;

    const backButton = webApp.BackButton;
    backButton.onClick(onClick);

    return () => {
      backButton.offClick(onClick);
    };
  }, [webApp, onClick]);

  const show = useCallback(() => {
    if (!webApp) return;
    webApp.BackButton.show();
  }, [webApp]);

  const hide = useCallback(() => {
    if (!webApp) return;
    webApp.BackButton.hide();
  }, [webApp]);

  return {
    show,
    hide
  };
}

// Convenience hooks for common use cases

export function useCheckoutMainButton(options: {
  totalAmount: number;
  onCheckout: () => void | Promise<void>;
  enabled?: boolean;
  isProcessing?: boolean;
}) {
  const { totalAmount, onCheckout, enabled = true, isProcessing = false } = options;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ').format(price) + " so'm";
  };

  const handleClick = async () => {
    await onCheckout();
  };

  return useMainButton({
    text: `To'lash - ${formatPrice(totalAmount)}`,
    onClick: handleClick,
    enabled: enabled && !isProcessing,
    isVisible: true,
    isProgressVisible: isProcessing,
    color: '#10B981', // Green
    textColor: '#FFFFFF'
  });
}

export function useCartMainButton(options: {
  itemsCount: number;
  onProceed: () => void;
  enabled?: boolean;
}) {
  const { itemsCount, onProceed, enabled = true } = options;

  return useMainButton({
    text: itemsCount > 0 ? `To'lovga o'tish (${itemsCount})` : 'Savat bo\'sh',
    onClick: onProceed,
    enabled: enabled && itemsCount > 0,
    isVisible: true,
    color: '#3B82F6', // Blue
    textColor: '#FFFFFF'
  });
}

export function useOrderMainButton(options: {
  onPlaceOrder: () => void | Promise<void>;
  enabled?: boolean;
  isProcessing?: boolean;
}) {
  const { onPlaceOrder, enabled = true, isProcessing = false } = options;

  const handleClick = async () => {
    await onPlaceOrder();
  };

  return useMainButton({
    text: isProcessing ? 'Buyurtma berilmoqda...' : 'Buyurtma berish',
    onClick: handleClick,
    enabled: enabled && !isProcessing,
    isVisible: true,
    isProgressVisible: isProcessing,
    color: '#8B5CF6', // Purple
    textColor: '#FFFFFF'
  });
}

export function useConfirmMainButton(options: {
  text?: string;
  onConfirm: () => void | Promise<void>;
  enabled?: boolean;
  isProcessing?: boolean;
}) {
  const { 
    text = 'Tasdiqlash', 
    onConfirm, 
    enabled = true, 
    isProcessing = false 
  } = options;

  const handleClick = async () => {
    await onConfirm();
  };

  return useMainButton({
    text: isProcessing ? 'Kuting...' : text,
    onClick: handleClick,
    enabled: enabled && !isProcessing,
    isVisible: true,
    isProgressVisible: isProcessing
  });
}

// Navigation back button
export function useNavigationBackButton(onBack?: () => void) {
  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  }, [onBack]);

  return useBackButton({
    onClick: handleBack,
    isVisible: true
  });
}

// Combined hook for pages with both buttons
export function useTelegramNavigation(options: {
  mainButton?: MainButtonOptions;
  backButton?: BackButtonOptions;
}) {
  const mainButtonHook = options.mainButton ? useMainButton(options.mainButton) : null;
  const backButtonHook = options.backButton ? useBackButton(options.backButton) : null;

  return {
    mainButton: mainButtonHook,
    backButton: backButtonHook
  };
}
