# 🚀 Baraka Market - APK Build Quick Start

## ⚡ Tezkor Ko'rsatma (5 Daqiqa)

Agar tajribangiz bo'lsa va tez build qilishni xohlasangiz:

```bash
# 1. Dependencies
npm install

# 2. Build web app
npm run build

# 3. Init Capacitor (faqat birinchi marta)
npx cap init "Baraka Market" "com.barakamarket.app" --web-dir=dist

# 4. Add Android
npx cap add android

# 5. Sync
npx cap sync

# 6. Open Android Studio
npx cap open android

# 7. Android Studio'da: Build > Build APK
```

APK: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 📱 Test APK (Tezkor)

Agar shunchaki test qilmoqchi bo'lsangiz:

```bash
# Build va run
npm run android:build

# Android Studio ochiladi, Run tugmasini bosing
```

---

## 🏭 Production APK

### 1. Keystore yaratish
```bash
keytool -genkey -v -keystore baraka-market.keystore -alias baraka-market -keyalg RSA -keysize 2048 -validity 10000
```

**Parolni unutmang!**

### 2. build.gradle sozlash

`android/app/build.gradle` fayliga:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('baraka-market.keystore')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'baraka-market'
            keyPassword 'YOUR_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 3. Release APK build
Android Studio: **Build** > **Generate Signed Bundle / APK** > **APK** > Release

---

## 🎨 Icons (Muhim!)

Icons qo'shmasangiz default icon ko'rsatiladi.

**Tezkor yo'l:**
1. https://www.appicon.co/ oching
2. 512x512px logo yuklang (Baraka Market logosi)
3. Android tanlang va Generate
4. Zip'ni extract qiling
5. Barcha fayllarni `android/app/src/main/res/` ga ko'chiring
6. `npm run cap:sync`

---

## 🔥 Splash Screen

`android/app/src/main/res/drawable/splash.png` - 2732x2732px

Yoki oddiy variant: faqat amber fon (#F59E0B) va markazda logo

---

## 📦 APK Manzili

Build tugagach APK:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 🐛 Xato bo'lsa?

```bash
# Clean va rebuild
cd android
./gradlew clean
cd ..
npm run build
npm run cap:sync
```

---

## ✅ Checklist

- [ ] Node.js o'rnatilgan (v18+)
- [ ] Android Studio o'rnatilgan
- [ ] JDK 17 o'rnatilgan
- [ ] `npm install` bajarildi
- [ ] `npm run build` muvaffaqiyatli
- [ ] `npx cap add android` qilindi
- [ ] Icons qo'shildi (ixtiyoriy, lekin tavsiya)
- [ ] Android Studio'da Build APK bosildi

---

## 📞 Yordam

Batafsil yo'riqnoma: `README.md`
Xatolar: `TROUBLESHOOTING.md`
Icons: `ICONS_GUIDE.md`

**Omad! 🎉**
