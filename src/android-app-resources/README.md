# 📱 Baraka Market - Android APK Yaratish Bo'yicha To'liq Yo'riqnoma

## 🎯 Umumiy Ma'lumot

Bu yo'riqnoma Baraka Market React ilovasini Android APK formatiga o'girish bo'yicha **step-by-step** ko'rsatma.

---

## 📋 1-QADAM: Talab qilinadigan dasturlar

Kompyuteringizda quyidagilar o'rnatilgan bo'lishi kerak:

### Windows uchun:
- **Node.js** (v18 yoki yangi) - https://nodejs.org/
- **Git** - https://git-scm.com/
- **Android Studio** - https://developer.android.com/studio
- **Java JDK 17** - Android Studio bilan birga keladi

### Mac uchun:
- **Node.js** (v18 yoki yangi)
- **Xcode Command Line Tools**: `xcode-select --install`
- **Android Studio**
- **Java JDK 17**

### Linux (Ubuntu) uchun:
```bash
sudo apt update
sudo apt install nodejs npm git openjdk-17-jdk
```

---

## 🚀 2-QADAM: Loyihani Local Kompyuterga Ko'chirish

### 1. Figma Make'dan kodlarni yuklab oling
Barcha fayllarni zip formatda yuklab oling va ochib qo'ying.

### 2. Terminal ochib, loyiha papkasiga o'ting
```bash
cd path/to/baraka-market
```

### 3. package.json faylini yarating
Loyiha papkasida `package.json` faylini yarating va quyidagi kodni joylashtiring:

```json
{
  "name": "baraka-market",
  "version": "1.0.0",
  "description": "Multi-vendor marketplace mobile app",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "cap:init": "npx cap init",
    "cap:add:android": "npx cap add android",
    "cap:sync": "npx cap sync",
    "cap:open:android": "npx cap open android",
    "android:build": "npm run build && npx cap sync && npx cap open android"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "motion": "^10.18.0",
    "framer-motion": "^11.11.17",
    "lucide-react": "^0.468.0",
    "sonner": "^1.7.1",
    "recharts": "^2.15.0",
    "date-fns": "^4.1.0",
    "@capacitor/core": "^6.0.0",
    "@capacitor/android": "^6.0.0",
    "@capacitor/splash-screen": "^6.0.0",
    "@capacitor/status-bar": "^6.0.0",
    "@capacitor/keyboard": "^6.0.0",
    "@capacitor/app": "^6.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^6.0.0",
    "@types/react": "^18.3.1",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.3",
    "tailwindcss": "^4.0.0",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49"
  }
}
```

### 4. Dependencies o'rnatish
```bash
npm install
```

---

## ⚙️ 3-QADAM: Vite Konfiguratsiyasi

`vite.config.ts` faylini yarating:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['motion', 'framer-motion']
        }
      }
    }
  }
})
```

---

## 🔧 4-QADAM: Capacitor Sozlash

### 1. Capacitor'ni ishga tushirish
```bash
npm run cap:init
```

Bu sizdan so'raydi:
- **App name**: `Baraka Market`
- **App ID**: `com.barakamarket.app`
- **Web directory**: `dist`

### 2. Android platformasini qo'shish
```bash
npm run cap:add:android
```

Bu `/android` papkasini yaratadi.

---

## 🎨 5-QADAM: Icons va Splash Screen

### Icon va Splash Screen o'lchamlari:

#### App Icon (android/app/src/main/res/)
Quyidagi o'lchamlarda PNG fayllar kerak:

- `mipmap-mdpi/ic_launcher.png` - 48x48px
- `mipmap-hdpi/ic_launcher.png` - 72x72px
- `mipmap-xhdpi/ic_launcher.png` - 96x96px
- `mipmap-xxhdpi/ic_launcher.png` - 144x144px
- `mipmap-xxxhdpi/ic_launcher.png` - 192x192px

#### Splash Screen (android/app/src/main/res/)
- `drawable/splash.png` - 2732x2732px (markazda logotip)
- Fon rang: `#F59E0B` (amber-500)

### Icon Generator vositalari:
- https://www.appicon.co/ (tavsiya qilinadi)
- https://easyappicon.com/
- https://icon.kitchen/

---

## 📝 6-QADAM: AndroidManifest.xml O'zgartirishlari

`android/app/src/main/AndroidManifest.xml` faylini quyidagicha yangilang:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Baraka Market"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="Baraka Market"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>
    </application>

    <!-- Permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

</manifest>
```

---

## 🏗️ 7-QADAM: Production Build

### 1. Web ilovani build qilish
```bash
npm run build
```

Bu `dist/` papkasini yaratadi.

### 2. Capacitor'ni sync qilish
```bash
npm run cap:sync
```

### 3. Android Studio'ni ochish
```bash
npm run cap:open:android
```

yoki bitta buyruq bilan:
```bash
npm run android:build
```

---

## 📦 8-QADAM: APK Build (Android Studio)

Android Studio ochilganidan keyin:

### Debug APK (test uchun):
1. **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
2. Build tugagach **Locate** tugmasini bosing
3. APK fayl: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (nashr qilish uchun):

#### 1. Keystore yaratish
```bash
cd android/app
keytool -genkey -v -keystore baraka-market.keystore -alias baraka-market -keyalg RSA -keysize 2048 -validity 10000
```

Parol va ma'lumotlarni saqlang!

#### 2. build.gradle sozlash
`android/app/build.gradle` faylini oching va qo'shing:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('baraka-market.keystore')
            storePassword 'SIZNING_PAROLINGIZ'
            keyAlias 'baraka-market'
            keyPassword 'SIZNING_PAROLINGIZ'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### 3. Release APK build
Android Studio'da:
1. **Build** > **Generate Signed Bundle / APK**
2. **APK** tanlang > **Next**
3. Keystore ma'lumotlarini kiriting
4. **release** variantni tanlang
5. **Finish**

APK: `android/app/release/app-release.apk`

---

## 🌐 9-QADAM: Backend URL'larni O'zgartirish

### LocalStorage bazasida qolish (hozirgi holat)
Hech narsa o'zgartirish shart emas - ilova offline ishlaydi.

### Server bazasiga o'tish (kelajak)
Agar Supabase yoki boshqa backend ishlatmoqchi bo'lsangiz:

1. `utils/supabase/info.tsx` faylida real URL va API keys qo'ying
2. `utils/storage.ts` - localStorage o'rniga API calls qiling
3. `contexts/AuthContext.tsx` - real auth service bilan integratsiya qiling

---

## 📱 10-QADAM: Telefoniga O'rnatish

### USB orqali:
1. Telefoningizda **Developer options** > **USB debugging** yoqing
2. USB kabel bilan ulang
3. Android Studio'da **Run** > **Run 'app'**

### APK faylni ko'chirish:
1. APK faylni telefoninga ko'chiring
2. Faylni oching va o'rnating
3. **Unknown sources**ni ruxsat bering (sozlamalarda)

---

## 🎯 11-QADAM: Google Play Store'ga Yuklash

### Talab qilinadigan narsalar:
1. **Google Play Developer Account** ($25 bir martalik to'lov)
2. **App Bundle** (APK emas!) yaratish:
   - Android Studio: **Build** > **Build Bundle(s) / APK(s)** > **Build Bundle(s)**
3. **Privacy Policy** sahifasi (majburiy)
4. **Screenshot**lar (kamida 2 ta)
5. **App Icon** (512x512px)
6. **Feature Graphic** (1024x500px)

### Play Console'da:
1. https://play.google.com/console oching
2. **Create App** bosing
3. Barcha ma'lumotlarni to'ldiring
4. **Release** > **Production** > **Create new release**
5. AAB faylni yuklang
6. Review uchun yuboring (2-7 kun)

---

## ⚡ Tezkor Buyruqlar

```bash
# Development
npm run dev                  # Local server

# Build va Android
npm run build               # Production build
npm run cap:sync           # Sync with Capacitor
npm run android:build      # Build + Sync + Open Android Studio

# Capacitor
npx cap update             # Update plugins
npx cap copy               # Copy web assets
npx cap sync android       # Faqat Android sync
```

---

## 🐛 Muammo va Yechimlar

### 1. "Java version" xatosi
```bash
export JAVA_HOME=/path/to/java-17
# yoki Windows'da System Environment Variables orqali
```

### 2. "SDK location not found"
Android Studio > **File** > **Settings** > **Android SDK** > SDK path'ni ko'chirib oling

`android/local.properties` yarating:
```
sdk.dir=C:\\Users\\YourName\\AppData\\Local\\Android\\Sdk
```

### 3. "Capacitor not found"
```bash
npm install @capacitor/cli @capacitor/core --save-dev
```

### 4. Icons ko'rinmayapti
Icons'ni to'g'ri papkalarga joylashtiring va:
```bash
npm run cap:sync
```

---

## 📞 Qo'shimcha Resurslar

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Developer**: https://developer.android.com/
- **Icon Generator**: https://www.appicon.co/
- **Play Store Guide**: https://support.google.com/googleplay/android-developer

---

## ✅ Checklist

- [ ] Node.js va Android Studio o'rnatildi
- [ ] package.json yaratildi va dependencies o'rnatildi
- [ ] Capacitor sozlandi (cap:init)
- [ ] Android platformasi qo'shildi (cap:add:android)
- [ ] Icons va splash screen qo'shildi
- [ ] Production build yaratildi
- [ ] Keystore yaratildi (release uchun)
- [ ] APK muvaffaqiyatli build qilindi
- [ ] Telefonida test qilindi
- [ ] Play Store uchun tayyor (ixtiyoriy)

---

**Omad tilaymiz! 🚀**

Agar biror qadamda qiynalgan bo'lsangiz, xabar bering!
