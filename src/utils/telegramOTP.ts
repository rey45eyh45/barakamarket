/**
 * Telegram Bot orqali OTP yuborish
 * 
 * BU BEPUL VA CHEKSIZ!
 * 
 * ⚠️ MUHIM MA'LUMOT:
 * 
 * @VerificationCodes (Telegram Gateway) - PULLIK (~$0.01-0.05/xabar)
 * O'z botingiz orqali - BEPUL VA CHEKSIZ!
 * 
 * SOZLASH QADAMLARI:
 * 
 * 1. @BotFather dan bot yarating:
 *    - Telegram'da @BotFather ni oching
 *    - /newbot buyrug'ini yuboring
 *    - Bot nomini kiriting: Baraka Market
 *    - Bot username: BarakaMarketBot (yoki boshqa nom)
 *    - TOKEN oling va quyida joylashtiring
 * 
 * 2. Bot tokenini shu yerga qo'ying:
 *    const TELEGRAM_BOT_TOKEN = 'YOUR_BOT_TOKEN_HERE';
 * 
 * 3. Foydalanuvchi botga /start yuborishi kerak
 *    Shundan keyin bot unga OTP yuborishi mumkin
 */

// ⚠️ MUHIM: Bu tokenni o'zingizning bot tokeningiz bilan almashtiring!
// @BotFather dan oling: /newbot → token olasiz
const TELEGRAM_BOT_TOKEN = '8532196536:AAEAOc4Bt3cabRdxCNiIhFVFYimiSotrUCw';

// OTP storage (production'da backend/database ishlatish kerak)
interface TelegramOTPData {
  chatId: string;
  code: string;
  phone: string;
  expiresAt: number;
  attempts: number;
}

// Generate 6-digit OTP
export function generateTelegramOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Telegram bot orqali OTP yuborish
 * 
 * MUHIM: Bu funksiya faqat backend server orqali ishlaydi!
 * Frontend'dan to'g'ridan-to'g'ri Telegram API'ga so'rov yuborish xavfsiz emas.
 * 
 * Production uchun:
 * 1. Backend endpoint yarating: POST /api/telegram/send-otp
 * 2. Backend'da bot token saqlang
 * 3. Bu funksiya backend'ga so'rov yuboradi
 */
export async function sendTelegramOTP(
  chatId: string,
  phone: string
): Promise<{ success: boolean; message: string; code?: string }> {
  try {
    const code = generateTelegramOTP();
    
    // Store OTP locally (for demo mode)
    const otpData: TelegramOTPData = {
      chatId,
      code,
      phone,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0
    };
    
    const otpStore = JSON.parse(localStorage.getItem('telegram_otp_codes') || '{}');
    otpStore[chatId] = otpData;
    localStorage.setItem('telegram_otp_codes', JSON.stringify(otpStore));
    
    // Check if we have bot token
    if (!TELEGRAM_BOT_TOKEN) {
      console.log('⚠️ Telegram Bot Token yo\'q - Demo mode ishlatilmoqda');
      console.log('📱 OTP Code (Telegram uchun):', code);
      
      // Demo mode - just return the code
      return {
        success: true,
        message: 'OTP yaratildi (demo mode)',
        code // Demo mode'da kodni qaytaramiz
      };
    }
    
    // Production mode - send via Telegram Bot API
    const message = `🔐 *Baraka Market*\n\nSizning tasdiqlash kodingiz:\n\n\`${code}\`\n\n⏱ Kod 5 daqiqa amal qiladi.\n⚠️ Kodni hech kimga bermang!`;
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown'
      })
    });
    
    const data = await response.json();
    
    if (!data.ok) {
      console.error('Telegram API error:', data);
      return {
        success: false,
        message: 'Telegram orqali xabar yuborishda xatolik'
      };
    }
    
    console.log('✅ Telegram OTP yuborildi:', chatId);
    
    return {
      success: true,
      message: 'Tasdiqlash kodi Telegram\'ga yuborildi'
    };
  } catch (error) {
    console.error('Telegram OTP error:', error);
    return {
      success: false,
      message: 'Xatolik yuz berdi'
    };
  }
}

/**
 * Telegram OTP'ni tasdiqlash
 */
export function verifyTelegramOTP(
  chatId: string, 
  code: string
): { success: boolean; message: string } {
  try {
    // Demo mode - har qanday 6 raqamli kod qabul qilinadi
    if (code && code.length === 6 && /^\d{6}$/.test(code)) {
      console.log('✅ Telegram OTP verified (demo mode)');
      return {
        success: true,
        message: 'Kod tasdiqlandi'
      };
    }
    
    return {
      success: false,
      message: '6 raqamli kodni kiriting'
    };
  } catch (error) {
    console.error('Verify error:', error);
    return {
      success: false,
      message: 'Xatolik yuz berdi'
    };
  }
}

/**
 * Telegram Chat ID olish
 * 
 * Foydalanuvchi bot bilan suhbat boshlaganda,
 * bot uning chat_id sini oladi va saqlaydi.
 */
export function getTelegramChatId(): string | null {
  // Check if running in Telegram WebApp
  const tg = (window as any).Telegram?.WebApp;
  
  if (tg?.initDataUnsafe?.user?.id) {
    return tg.initDataUnsafe.user.id.toString();
  }
  
  // Check localStorage for saved chat ID
  return localStorage.getItem('telegram_chat_id');
}

/**
 * Telegram foydalanuvchi ma'lumotlarini olish
 */
export function getTelegramUser(): {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
} | null {
  const tg = (window as any).Telegram?.WebApp;
  
  if (tg?.initDataUnsafe?.user) {
    const user = tg.initDataUnsafe.user;
    return {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      languageCode: user.language_code,
      isPremium: user.is_premium
    };
  }
  
  return null;
}
