// Eskiz.uz SMS Service Integration
// Official API Documentation: https://documenter.getpostman.com/view/663853/RzfmES4z

export interface SMSResponse {
  success: boolean;
  message: string;
  smsId?: string;
}

export interface OTPData {
  phone: string;
  code: string;
  expiresAt: number;
  attempts: number;
}

// SMS Templates
const SMS_TEMPLATES = {
  signup: (code: string) => `Baraka Market: Ro'yxatdan o'tish kodi: ${code}\\\\n\\\\nKodni hech kimga bermang!\\\\n\\\\nKod 5 daqiqa amal qiladi.`,
  login: (code: string) => `Baraka Market: Kirish kodi: ${code}\\\\n\\\\nKodni hech kimga bermang!`,
  orderConfirm: (orderId: string) => `Baraka Market: Buyurtmangiz #${orderId} qabul qilindi!\\\\n\\\\nTez orada yetkazib beriladi.`,
  vendorApproval: (storeName: string) => `Baraka Market: Tabriklaymiz! \\\"${storeName}\\\" do'koningiz tasdiqlandi! Endi mahsulot qo'shishingiz mumkin.`,
  orderStatus: (orderId: string, status: string) => `Baraka Market: Buyurtma #${orderId} holati: ${status}`,
};

// Generate random 6-digit OTP code
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate phone number (Uzbekistan format)
export function validatePhoneNumber(phone: string): boolean {
  // Remove spaces and special characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Check if it matches Uzbekistan phone format
  // +998 XX XXX XX XX or 998XXXXXXXXX
  const regex = /^(\+?998)?[0-9]{9}$/;
  return regex.test(cleaned);
}

// Format phone number for API
export function formatPhoneForAPI(phone: string): string {
  // Remove all non-numeric characters except +
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Ensure it starts with 998
  if (cleaned.startsWith('+998')) {
    cleaned = cleaned.substring(1);
  } else if (!cleaned.startsWith('998')) {
    cleaned = '998' + cleaned;
  }
  
  return cleaned;
}

// Send SMS via backend (calls Eskiz.uz API)
export async function sendSMS(
  phone: string,
  message: string,
  type: 'otp' | 'notification' = 'notification'
): Promise<SMSResponse> {
  try {
    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      return {
        success: false,
        message: 'Telefon raqami noto\'g\'ri formatda!',
      };
    }

    // Format phone for API
    const formattedPhone = formatPhoneForAPI(phone);

    // In development/test mode, just log and return success
    const isDevelopment = typeof import.meta !== 'undefined' && 
                         (import.meta.env?.DEV === true || import.meta.env?.MODE === 'development');
    
    if (isDevelopment) {
      console.log('📱 SMS yuborildi (TEST MODE):');
      console.log('  Phone:', formattedPhone);
      console.log('  Message:', message);
      console.log('  Type:', type);
      
      // Store in localStorage for testing
      const testSMS = JSON.parse(localStorage.getItem('test_sms') || '[]');
      testSMS.push({
        phone: formattedPhone,
        message,
        type,
        sentAt: new Date().toISOString(),
      });
      localStorage.setItem('test_sms', JSON.stringify(testSMS));
      
      return {
        success: true,
        message: 'SMS yuborildi (test mode)',
        smsId: `test_${Date.now()}`,
      };
    }

    // In production, call backend API
    const response = await fetch(`https://bhbcbxptdmwaraaknsfl.supabase.co/functions/v1/make-server-12d0dab1/sms/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoYmNieHB0ZG13YXJhYWtuc2ZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDg5MjQsImV4cCI6MjA3OTI4NDkyNH0.GQ45v9maVqtkSNNoBbReyhoifR55DU7m1VIi_yESlrE',
      },
      body: JSON.stringify({
        phone: formattedPhone,
        message,
        type,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'SMS yuborishda xatolik');
    }

    return {
      success: true,
      message: 'SMS yuborildi',
      smsId: data.smsId,
    };
  } catch (error) {
    console.error('SMS yuborishda xatolik:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'SMS yuborishda xatolik',
    };
  }
}

// Send OTP code
export async function sendOTPCode(
  phone: string,
  type: 'signup' | 'login'
): Promise<{ success: boolean; message: string; code?: string }> {
  try {
    // Generate OTP
    const code = generateOTP();
    
    // Get SMS template
    const message = type === 'signup' 
      ? SMS_TEMPLATES.signup(code)
      : SMS_TEMPLATES.login(code);
    
    // Send SMS
    const result = await sendSMS(phone, message, 'otp');
    
    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    // Store OTP in localStorage (in production, this should be in backend)
    const otpData: OTPData = {
      phone: formatPhoneForAPI(phone),
      code,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
      attempts: 0,
    };
    
    const otpStore = JSON.parse(localStorage.getItem('otp_codes') || '{}');
    otpStore[formatPhoneForAPI(phone)] = otpData;
    localStorage.setItem('otp_codes', JSON.stringify(otpStore));
    
    // Check if in dev mode
    const isDev = typeof import.meta !== 'undefined' && 
                  (import.meta.env?.DEV === true || import.meta.env?.MODE === 'development');
    
    return {
      success: true,
      message: 'Tasdiqlash kodi yuborildi',
      code: isDev ? code : undefined, // Only return code in dev mode
    };
  } catch (error) {
    console.error('OTP yuborishda xatolik:', error);
    return {
      success: false,
      message: 'OTP yuborishda xatolik',
    };
  }
}

// Verify OTP code
export function verifyOTP(phone: string, code: string): { success: boolean; message: string } {
  try {
    // 🎯 DEMO MODE: Istalgan 6 raqamli kod qabul qilinadi
    if (code && code.length === 6 && /^\d{6}$/.test(code)) {
      console.log('✅ Demo Mode: OTP verified automatically');
      console.log('  Phone:', phone);
      console.log('  Code:', code);
      
      return {
        success: true,
        message: 'Tasdiqlash kodi to\'g\'ri (demo mode)',
      };
    }
    
    // Agar 6 raqamli kod bo'lmasa
    return {
      success: false,
      message: '6 raqamli kodni kiriting',
    };
  } catch (error) {
    console.error('OTP tekshirishda xatolik:', error);
    return {
      success: false,
      message: 'Xatolik yuz berdi',
    };
  }
}

// Send order confirmation SMS
export async function sendOrderConfirmationSMS(
  phone: string,
  orderId: string
): Promise<SMSResponse> {
  const message = SMS_TEMPLATES.orderConfirm(orderId);
  return sendSMS(phone, message, 'notification');
}

// Send vendor approval SMS
export async function sendVendorApprovalSMS(
  phone: string,
  storeName: string
): Promise<SMSResponse> {
  const message = SMS_TEMPLATES.vendorApproval(storeName);
  return sendSMS(phone, message, 'notification');
}

// Send order status update SMS
export async function sendOrderStatusSMS(
  phone: string,
  orderId: string,
  status: string
): Promise<SMSResponse> {
  const message = SMS_TEMPLATES.orderStatus(orderId, status);
  return sendSMS(phone, message, 'notification');
}

// Get test SMS (for development)
export function getTestSMS(): any[] {
  try {
    return JSON.parse(localStorage.getItem('test_sms') || '[]');
  } catch {
    return [];
  }
}

// Clear test SMS
export function clearTestSMS(): void {
  localStorage.removeItem('test_sms');
  localStorage.removeItem('otp_codes');
}