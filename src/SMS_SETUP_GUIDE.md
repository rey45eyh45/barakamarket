# 📱 SMS API INTEGRATION GUIDE - Eskiz.uz

## ✅ **QO'SHILGAN FUNKSIYALAR**

### 1. SMS Service (`/utils/smsService.ts`)
```typescript
✅ Eskiz.uz API integration
✅ OTP generation (6 raqamli kod)
✅ Phone number validation (+998 format)
✅ SMS templates (O'zbek tilida)
✅ Test mode (localStorage)
✅ Production mode (real API)
```

### 2. Backend SMS Endpoint (`/supabase/functions/server/sms.tsx`)
```typescript
✅ POST /make-server-12d0dab1/sms/send - SMS yuborish
✅ GET /make-server-12d0dab1/sms/balance - Balance tekshirish
✅ Eskiz.uz authentication
✅ Error handling
✅ Test mode support (API key bo'lmasa)
```

### 3. Auth Page OTP UI (`/components/AuthPage.tsx`)
```typescript
✅ OTP input UI (6 raqamli kod)
✅ SMS yuborish tugmasi
✅ Kod tasdiqlash
✅ Auto-focus keyingi input
✅ Backspace navigation
✅ Test mode indicator
```

---

## 🔧 **ESKIZ.UZ API KEY OLISH**

### **Qadam 1: Ro'yxatdan o'tish**
1. **https://eskiz.uz** ga kiring
2. **"Ro'yxatdan o'tish"** tugmasini bosing
3. Ma'lumotlarni to'ldiring:
   - Ism/Familiya
   - Telefon raqam
   - Email
   - Parol
4. SMS orqali tasdiqlang

### **Qadam 2: Balance To'ldirish**
1. Dashboard'ga kiring
2. **"Balance to'ldirish"** bo'limiga o'ting
3. Kamida **50,000 so'm** to'ldiring
4. To'lov usullari:
   - 💳 Payme
   - 💳 Click
   - 💳 Bank kartasi

### **Qadam 3: API Credentials**
1. **API** bo'limiga o'ting
2. **Email** va **Parol** oling
3. Bu ma'lumotlar API uchun ishlatiladi

**Eslatma:** Email va parol - bu sizning Eskiz.uz akkauntingizga kirish ma'lumotlaringiz.

---

## 🔐 **ENVIRONMENT VARIABLE O'RNATISH**

Production'da ishlatish uchun:

1. **Supabase Dashboard** ga kiring
2. **Settings** → **Edge Functions**
3. **Secrets** bo'limini oching
4. Yangi secret qo'shing:
   ```
   Name: ESKIZ_PASSWORD
   Value: <sizning Eskiz.uz parolingiz>
   ```

**Yoki:**

CLI orqali:
```bash
supabase secrets set ESKIZ_PASSWORD=<sizning_parolingiz>
```

---

## 🧪 **TEST MODE**

Hozirda **TEST MODE** yoqilgan - hech qanday API key kerak emas!

### Test Mode Xususiyatlari:
- ✅ SMS console'da ko'rinadi
- ✅ localStorage'da saqlanadi
- ✅ Alert oynasida kod ko'rsatiladi
- ✅ Barcha funksiyalar ishlaydi
- ✅ Hech qanday to'lov kerak emas

### Test Qilish:
1. AuthPage'ni oching
2. **"Telefon"** tabini tanlang
3. Telefon raqamini kiriting: `+998 90 123 45 67`
4. Parol kiriting
5. **"Kirish"** tugmasini bosing
6. OTP UI ko'rinadi
7. **"SMS Kod Yuborish"** tugmasini bosing
8. Alert oynasida kod ko'rinadi: **`123456`**
9. Kodni kiriting va tasdiqlang

---

## 📋 **SMS TEMPLATES**

### 1. Ro'yxatdan o'tish OTP
```
Dream Market: Ro'yxatdan o'tish kodi: 123456

Kodni hech kimga bermang!

Kod 5 daqiqa amal qiladi.
```

### 2. Kirish OTP
```
Dream Market: Kirish kodi: 123456

Kodni hech kimga bermang!
```

### 3. Buyurtma Tasdiqlash
```
Dream Market: Buyurtmangiz #ORD-001 qabul qilindi!

Tez orada yetkazib beriladi.
```

### 4. Vendor Tasdiqlash
```
Dream Market: Tabriklaymiz! "My Store" do'koningiz tasdiqlandi! Endi mahsulot qo'shishingiz mumkin.
```

### 5. Buyurtma Holati
```
Dream Market: Buyurtma #ORD-001 holati: Yo'lda
```

---

## 💰 **NARXLAR (Eskiz.uz)**

| SMS soni | Narx | Umumiy to'lov |
|----------|------|---------------|
| 50,000 SMS | 0.7 tiyin | 35,000 so'm |
| 100,000 SMS | 0.8 tiyin | 80,000 so'm |
| 500,000 SMS | 0.9 tiyin | 450,000 so'm |

**Test mode bepul!** ✨

---

## 🔄 **QANDAY ISHLAYDI**

### Frontend → Backend Flow:

1. **Foydalanuvchi** telefon raqamini kiritadi
2. **Frontend** `sendOTPCode()` funksiyasini chaqiradi
3. **6 raqamli kod** generatsiya qilinadi
4. **SMS Service** backend'ga request yuboradi:
   ```
   POST /make-server-12d0dab1/sms/send
   {
     "phone": "998901234567",
     "message": "Dream Market: Kirish kodi: 123456...",
     "type": "otp"
   }
   ```
5. **Backend** Eskiz.uz API'ga request yuboradi
6. **Eskiz.uz** SMS yuboradi
7. **Kod** localStorage'ga saqlanadi (5 daqiqa muddatli)
8. **Foydalanuvchi** kodni kiritadi
9. **Frontend** `verifyOTP()` funksiyasini chaqiradi
10. **Kod** tekshiriladi (3 urinish)
11. **Success** → Kirish amalga oshiriladi

---

## 🛠️ **API ENDPOINTS**

### 1. SMS Yuborish
```typescript
POST /make-server-12d0dab1/sms/send
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "phone": "998901234567",
  "message": "SMS text",
  "type": "otp" | "notification"
}

Response: {
  "success": true,
  "message": "SMS yuborildi",
  "smsId": "12345"
}
```

### 2. Balance Tekshirish
```typescript
GET /make-server-12d0dab1/sms/balance

Response: {
  "balance": 100000,
  "limit": 500000
}
```

---

## ⚠️ **XAVFSIZLIK**

### OTP Security:
- ✅ **5 daqiqa** muddatli
- ✅ **3 urinish** ruxsat etilgan
- ✅ **6 raqamli** kod
- ✅ Noto'g'ri kiritish - attempts++
- ✅ 3 ta noto'g'ri - bloklash
- ✅ Muddati o'tgan - o'chirish

### Backend Security:
- ✅ ESKIZ_PASSWORD environment variable
- ✅ CORS protection
- ✅ Error handling
- ✅ Rate limiting (kelgusida)

---

## 🐛 **DEBUGGING**

### Console Logs:
```javascript
// Test mode'da console'ga chiqadi:
📱 SMS yuborildi (TEST MODE):
  Phone: 998901234567
  Message: Dream Market: Kirish kodi: 123456...
  Type: otp
```

### localStorage Check:
```javascript
// Browser console'da:
localStorage.getItem('test_sms')        // Barcha SMS'lar
localStorage.getItem('otp_codes')       // Barcha OTP kodlar

// Clear qilish:
localStorage.removeItem('test_sms')
localStorage.removeItem('otp_codes')
```

---

## 📞 **SUPPORT**

### Eskiz.uz Support:
- 📱 Telefon: +998 71 200 00 00
- 📧 Email: support@eskiz.uz
- 🌐 Website: https://eskiz.uz
- 📖 API Docs: https://documenter.getpostman.com/view/663853/RzfmES4z

---

## ✅ **HOZIRGI HOLAT**

| Feature | Status | Description |
|---------|--------|-------------|
| SMS Service | ✅ Tayyor | sendSMS, sendOTPCode, verifyOTP |
| Backend Routes | ✅ Tayyor | /sms/send, /sms/balance |
| Phone Validation | ✅ Tayyor | +998 XX XXX XX XX format |
| OTP System | ✅ Tayyor | 6 raqam, 5 daqiqa, 3 urinish |
| Auth UI | ✅ Tayyor | OTP input, SMS button |
| Test Mode | ✅ Tayyor | localStorage + alert |
| Production | ⏳ API Key Kerak | ESKIZ_PASSWORD o'rnatish kerak |

---

## 🚀 **PRODUCTION'GA O'TISH**

1. **Eskiz.uz** akkauntini yarating
2. **Balance** to'ldiring (min 50,000 so'm)
3. **ESKIZ_PASSWORD** environment variable o'rnating
4. **Test** qiling production'da
5. **Monitor** qiling SMS balance'ni

**TAYYOR!** 🎉

---

**Muallif:** Dream Market Team  
**Sana:** 2024  
**Version:** 1.0.0  
**License:** MIT
