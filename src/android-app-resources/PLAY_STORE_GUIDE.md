# 📋 Play Store'ga Yuklash Bo'yicha To'liq Yo'riqnoma

## 🎯 Play Store'da Nashr Qilish Jarayoni

Google Play Store'ga ilova yuklash uchun quyidagi qadamlarni bajaring.

---

## 1️⃣ Google Play Developer Account

### Account Yaratish:
1. https://play.google.com/console saytiga kiring
2. Google akkauntingiz bilan login qiling
3. **Create Developer Account** bosing
4. **$25 to'lov** (bir martalik, PayPal yoki Credit Card)
5. Shaxsiy ma'lumotlar va manzilni kiriting
6. Shartlarni qabul qiling

⏱️ **Vaqt**: 15-30 daqiqa  
💰 **Narx**: $25 (bir martalik)

---

## 2️⃣ Talab Qilinadigan Materiallar

Play Store'ga yuklash uchun:

### A) App Bundle (AAB) - MAJBURIY
Google Play Store faqat **AAB** formatini qabul qiladi (APK emas!).

**AAB yaratish:**
```bash
# Web app build
npm run build

# Capacitor sync
npm run cap:sync

# Android Studio'ni ochish
npm run cap:open:android
```

Android Studio'da:
1. **Build** > **Generate Signed Bundle / APK**
2. **Android App Bundle** tanlang
3. Keystore ma'lumotlarini kiriting
4. **release** variant
5. **Finish**

AAB fayl: `android/app/release/app-release.aab`

### B) Screenshots (MAJBURIY)

**Telefon screenshot** - kamida 2 ta:
- O'lchami: 320px - 3840px (width yoki height)
- Format: PNG yoki JPG
- Tavsiya: 1080x1920px (portrait) yoki 1920x1080px (landscape)
- Minimal: 2 ta, maksimal: 8 ta

**Tablet screenshot** (ixtiyoriy):
- O'lchami: 1200px - 3840px
- 7" va 10" tablet uchun alohida

**Qayerdan olish:**
- Android emulatordan screenshot oling
- Yoki real deviceda ilova ochib screenshot oling
- Photoshop/Figma'da mockup yarating

### C) App Icon - 512x512px (MAJBURIY)
- Format: PNG (32-bit)
- O'lchami: 512x512px
- Fon: Transparent emas, to'liq rang
- Safe zone: chetlardan 10% bo'sh

### D) Feature Graphic - 1024x500px (MAJBURIY)
- O'lchami: aniq 1024x500px
- Format: PNG yoki JPG
- Dizayn: Ilova nomi, logo, qisqa tavsif

**Template:**
```
[Baraka Market Logo]  |  Multi-vendor Marketplace
    O'zbekistondagi #1 Online Bozor
```

### E) Privacy Policy URL (MAJBURIY)
Ilovada shaxsiy ma'lumotlar ishlatilsa (login, profile, etc.), Privacy Policy kerak.

**Tezkor yo'l:**
1. https://www.privacypolicygenerator.info/ saytidan foydalaning
2. Yoki oddiy HTML sahifa yarating va hosting'ga yuklang
3. URL: `https://yourwebsite.com/privacy-policy.html`

**Namuna Privacy Policy:**
```markdown
# Privacy Policy for Baraka Market

Last updated: January 2, 2026

Baraka Market ("us", "we", or "our") operates the Baraka Market mobile application.

This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.

## Information Collection And Use
We collect several types of information:
- Account Information (name, phone, email)
- Order History
- Device Information

## Data Storage
All data is stored locally on your device. We do not transmit personal data to external servers.

## Contact Us
If you have any questions about this Privacy Policy, contact us at: support@barakamarket.com
```

### F) App Description

**Short Description** (80 characters):
```
Multi-vendor marketplace - minglab mahsulotlar, tez yetkazish, xavfsiz to'lov
```

**Full Description** (4000 characters max):
```
🛍️ Baraka Market - O'zbekistondagi Eng Yaxshi Online Bozor

Baraka Market - bu multi-vendor marketplace, bu yerda minglab do'konlar va mahsulotlarni topasiz. Qulay qidiruv, tez yetkazib berish va xavfsiz to'lov tizimlari bilan xaridlarni yanada oson qiling!

✨ Asosiy Imkoniyatlar:
• 📦 Minglab mahsulotlar - har qanday kategoriyada
• 🏪 Ko'plab do'konlar - vendor registration
• 🔍 Kuchli qidiruv va filtr tizimi
• 💳 Xavfsiz to'lov - Payme va Click
• 🚚 Tez yetkazib berish - shahardagi barcha hududlarga
• ⭐ Mahsulot reytinglari va sharhlar
• 💰 Chegirmalar va aksiyalar
• 🎁 Bonus dasturi va cashback
• 📱 Qulay mobil interfeys
• 🌙 Dark mode qo'llab-quvvatlash
• 🌍 3 til: O'zbek, Rus, English

👤 Foydalanuvchilar uchun:
- Tezkor ro'yxatdan o'tish
- Sevimlilar ro'yxati
- Buyurtmalarni kuzatish
- Manzillarni saqlash
- Promo kodlar

🏪 Sotuvchilar uchun:
- Vendor registration
- Mahsulotlarni boshqarish
- Buyurtmalarni kuzatish
- Statistika va hisobotlar
- Daromadni ko'rish

📊 Admin Panel:
- To'liq boshqaruv paneli
- Foydalanuvchilar va vendorlar boshqaruvi
- Mahsulotlar moderatsiyasi
- Statistika va analytics

💡 Nima uchun Baraka Market?
✅ O'zbekistondagi mahsulotlar
✅ Ishonchli sotuvchilar
✅ Tez yetkazib berish
✅ 24/7 qo'llab-quvvatlash
✅ Xavfsiz to'lovlar

📞 Qo'llab-quvvatlash:
Email: support@barakamarket.com
Telegram: @barakamarket

Baraka Market bilan xarid qilish - oson va xavfsiz! 🎉
```

---

## 3️⃣ Play Console'da Ilova Yaratish

### 1. Yangi Ilova Yaratish
1. Play Console'ga kiring: https://play.google.com/console
2. **All apps** > **Create app**
3. Ma'lumotlarni to'ldiring:
   - **App name**: Baraka Market
   - **Default language**: Uzbek (yoki English)
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Barcha checkbox'larni belgilang

### 2. Dashboard
Ilova yaratilgandan keyin Dashboard ko'rinadi. Bu yerda to'ldirish kerak bo'lgan bo'limlar:

---

## 4️⃣ Store Listing (Asosiy Sahifa)

**Main store listing** > **Manage**

### App details:
- **App name**: Baraka Market
- **Short description**: (80 chars)
- **Full description**: (yuqoridagi Full Description)

### Graphics:
- **App icon**: 512x512px PNG yuklang
- **Feature graphic**: 1024x500px PNG yuklang
- **Phone screenshots**: Kamida 2 ta (max 8 ta)
- **Tablet screenshots**: Ixtiyoriy

### Categorization:
- **App category**: Shopping
- **Tags**: shopping, marketplace, vendor, uzbekistan

### Contact details:
- **Email**: support@barakamarket.com
- **Phone**: +998 XX XXX XX XX (ixtiyoriy)
- **Website**: https://barakamarket.uz (agar bo'lsa)

### Privacy Policy:
- **Privacy policy URL**: https://yourwebsite.com/privacy-policy

**SAVE** bosing

---

## 5️⃣ App Content (Ma'lumot va Sertifikatsiyalar)

### A) Privacy Policy
- Privacy Policy URL'ni qayta kiriting

### B) Ads (Reklamalar)
- **Does your app contain ads?**: No (agar reklama bo'lmasa)

### C) App access (Foydalanish)
- **Is your app restricted?**: No
- Agar login talab qilsa, test account bering:
  - **Username**: test@barakamarket.com
  - **Password**: Test123456

### D) Content ratings
1. **Start questionnaire**
2. **Category**: Shopping, E-commerce
3. Savollarni to'ldiring:
   - Violence: No
   - Sexuality: No
   - Language: No
   - Drugs: No
   - Gambling: No
   - etc.
4. **Save questionnaire**
5. **Calculate rating**

Rating: PEGI 3, ESRB Everyone

### E) Target audience
- **Target age group**: 13+

### F) News apps (Agar yangiliklar bo'lsa)
- Skip

### G) COVID-19 contact tracing and status apps
- Skip

### H) Data safety
Bu **eng muhim** qism!

1. **Start** bosing
2. **Does your app collect or share user data?**: Yes
3. **Data types**:
   - Personal info: ✅ Name, Email, Phone
   - Financial info: ❌
   - Location: ✅ Approximate location
   - Photos: ✅
4. **Data usage**:
   - App functionality: ✅
   - Analytics: ✅
   - Account management: ✅
5. **Data sharing**: No (agar 3rd party'ga yubormasangiz)
6. **Data security**:
   - Data encrypted in transit: ✅
   - Users can request data deletion: ✅
   - Committed to Play Families Policy: ❌
7. **Save** va **Submit**

---

## 6️⃣ App Bundle Upload

### 1. Production'ga Tayyorlash
**Production** > **Create new release**

### 2. Upload App Bundle
- **Upload** tugmasini bosing
- `app-release.aab` faylini tanlang
- Yuklash tugamaguncha kuting (1-5 daqiqa)

### 3. Release notes
Release notes kiriting (har bir release uchun):

**Uzbek:**
```
Baraka Market - Birinchi Versiya!

✨ Yangi imkoniyatlar:
• Multi-vendor marketplace
• Minglab mahsulotlar
• Tez yetkazib berish
• Xavfsiz to'lov (Payme, Click)
• Mahsulot reytinglari va sharhlar
• Dark mode
• 3 til: O'zbek, Rus, English

Baraka Market bilan xarid qilish oson va xavfsiz! 🎉
```

**English:**
```
Baraka Market - First Release!

✨ New Features:
• Multi-vendor marketplace
• Thousands of products
• Fast delivery
• Secure payments (Payme, Click)
• Product ratings and reviews
• Dark mode support
• 3 languages: Uzbek, Russian, English

Shopping made easy and secure with Baraka Market! 🎉
```

### 4. Release name
- Version: 1.0.0 (avtomatik olinadi)

### 5. Review va Release
- **Save** > **Review release**
- Barcha ma'lumotlar to'g'ri ekanini tekshiring
- **Start rollout to Production** bosing

---

## 7️⃣ Review Jarayoni

### Review vaqti:
- ⏱️ **Birinchi release**: 2-7 kun
- ⏱️ **Keyingi updatelar**: 1-3 kun

### Review status:
- **In review**: Google tekshiryapti
- **Approved**: Tasdiqlandi, Play Store'da ko'rinadi
- **Rejected**: Rad etildi (sababi ko'rsatiladi)

### Reject qilinsa:
1. Reject sababini o'qing (email orqali keladi)
2. Muammoni hal qiling
3. Yangi AAB yuklang
4. Qayta submit qiling

---

## 8️⃣ Release Qilingandan Keyin

### A) Play Store'da Ko'rish
1-2 soat ichida ilovangiz Play Store'da ko'rinadi:
```
https://play.google.com/store/apps/details?id=com.barakamarket.app
```

### B) Monitoring
- **Statistics**: Yuklab olishlar, o'rnatishlar
- **Ratings**: Foydalanuvchi reytinglari
- **Reviews**: Sharhlar
- **Crashes**: Xatolar va crash reportlar

### C) Updates Yuklash
Yangi versiya yuklash:
1. `versionCode` va `versionName` oshiring (`build.gradle`)
2. Yangi AAB build qiling
3. **Production** > **Create new release**
4. Yangi AAB yuklang
5. Release notes yozing
6. **Rollout**

---

## 9️⃣ Checklist - Play Store'ga Tayyormi?

- [ ] Developer Account to'langan ($25)
- [ ] App Bundle (AAB) yaratildi va imzolandi
- [ ] 512x512 App Icon tayyor
- [ ] 1024x500 Feature Graphic tayyor
- [ ] Kamida 2 ta screenshot tayyor
- [ ] Privacy Policy URL mavjud
- [ ] Short va Full description yozildi
- [ ] Content rating to'ldirildi
- [ ] Data safety to'ldirildi
- [ ] Store listing to'liq to'ldirildi
- [ ] Test account ma'lumotlari berildi (agar kerak bo'lsa)
- [ ] AAB yuklandi va release yaratildi

---

## 🎯 Qo'shimcha Maslahatlar

### SEO (Search Optimization):
- **Keywords**: shopping, marketplace, uzbekistan, online bozor
- **Description**'da muhim so'zlarni ishlating
- Screenshots'da matn va explanation qo'shing

### Marketing:
- App launch uchun promo banner tayyorlang
- Social media'da e'lon qiling
- Birinchi foydalanuvchilarga chegirma bering
- Review so'rang (5 star uchun)

### Updates:
- Har 2-4 haftada update chiqarish tavsiya etiladi
- Bug fixlar va yangi features
- Release notes har doim to'ldiring

### Support:
- Play Console'da **Pre-launch report** tekshiring (avtomatik test)
- Crashes'ni monitoring qiling
- Reviews'ga javob bering (24-48 soat ichida)

---

## 📞 Qo'llab-quvvatlash

**Google Play Support:**
- https://support.google.com/googleplay/android-developer

**Play Console:**
- https://play.google.com/console

---

**Omad tilaymiz! 🚀 Play Store'da ko'rishguncha!**
