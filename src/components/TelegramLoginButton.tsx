import { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send } from 'lucide-react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  botName: string; // Telegram bot username (without @)
  onAuth: (user: TelegramUser) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: 'write' | boolean;
  usePic?: boolean;
  lang?: string;
}

/**
 * Telegram Login Widget
 * 
 * Bu Telegram'ning rasmiy login tizimi.
 * Foydalanuvchi Telegram orqali login qiladi va
 * biz uning ma'lumotlarini olamiz.
 * 
 * SOZLASH:
 * 1. @BotFather dan yangi bot yarating
 * 2. /setdomain buyrug'i bilan domeningizni qo'shing
 * 3. Bot username'ini botName prop'iga bering
 */
export function TelegramLoginButton({
  botName,
  onAuth,
  buttonSize = 'large',
  cornerRadius = 12,
  requestAccess = 'write',
  usePic = true,
  lang = 'uz'
}: TelegramLoginButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Global callback function for Telegram
    (window as any).onTelegramAuth = (user: TelegramUser) => {
      console.log('✅ Telegram login success:', user);
      onAuth(user);
    };

    // Create and load Telegram script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', cornerRadius.toString());
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', requestAccess.toString());
    script.setAttribute('data-userpic', usePic.toString());
    script.setAttribute('data-lang', lang);
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      delete (window as any).onTelegramAuth;
    };
  }, [botName, buttonSize, cornerRadius, requestAccess, usePic, lang, onAuth]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Telegram widget container */}
      <div ref={containerRef} className="telegram-login-container" />
      
      {/* Fallback button (ko'rinadi agar widget yuklanmasa) */}
      <noscript>
        <motion.a
          href={`https://t.me/${botName}?start=auth`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-6 py-3 bg-[#0088cc] text-white rounded-xl hover:bg-[#006699] transition font-medium"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Send className="w-5 h-5" />
          Telegram orqali kirish
        </motion.a>
      </noscript>
    </div>
  );
}

/**
 * Custom Telegram Login Button (Widget o'rniga)
 * 
 * Bu widget ishlamasa yoki custom dizayn kerak bo'lsa ishlatiladi.
 * Foydalanuvchini bot'ga yo'naltiradi.
 */
interface CustomTelegramButtonProps {
  botName: string;
  authParam?: string;
  className?: string;
}

export function CustomTelegramLoginButton({ 
  botName, 
  authParam = 'auth',
  className = ''
}: CustomTelegramButtonProps) {
  const handleClick = () => {
    // Generate unique auth token
    const authToken = `auth_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Save to localStorage for later verification
    localStorage.setItem('telegram_auth_token', authToken);
    localStorage.setItem('telegram_auth_timestamp', Date.now().toString());
    
    // Open Telegram bot with auth parameter
    const telegramUrl = `https://t.me/${botName}?start=${authParam}_${authToken}`;
    window.open(telegramUrl, '_blank');
  };

  return (
    <motion.button
      onClick={handleClick}
      className={`flex items-center justify-center gap-3 w-full px-6 py-3.5 bg-white border-2 border-[#0088cc] rounded-xl hover:shadow-lg hover:bg-blue-50 transition font-medium ${className}`}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.98 }}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-6 h-6 fill-[#0088cc]"
      >
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.084-1.362 5.42-.168.56-.498 1.066-.498 1.066s-.078.15-.228.232c-.15.082-.348.05-.348.05l-2.94-1.89s-.12-.078-.24-.186c-.12-.108-.192-.246-.192-.246l-1.62-1.482s-.15-.12-.15-.312c0-.192.12-.288.12-.288l5.82-3.66s.168-.108.276-.066c.108.042.138.162.138.162s.03.126-.03.318z"/>
      </svg>
      <span className="text-gray-900 font-semibold">Telegram orqali kirish</span>
    </motion.button>
  );
}
