import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Capacitor imports for mobile app
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Keyboard } from '@capacitor/keyboard';

// Initialize app
const initializeApp = async () => {
  // Check if running on native platform
  if (Capacitor.isNativePlatform()) {
    console.log('🚀 Running on native platform:', Capacitor.getPlatform());

    try {
      // Configure Status Bar
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#F59E0B' });
      
      // Configure Keyboard
      await Keyboard.setAccessoryBarVisible({ isVisible: true });
      
      // Hide splash screen after app is ready
      setTimeout(async () => {
        await SplashScreen.hide();
      }, 1000);
      
      console.log('✅ Capacitor plugins initialized');
    } catch (error) {
      console.error('❌ Capacitor initialization error:', error);
    }
  } else {
    console.log('🌐 Running on web platform');
  }

  // Render React app
  const rootElement = document.getElementById('root');
  if (rootElement) {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  }
};

// Start the app
initializeApp().catch(console.error);
