# 🎨 App Icons va Splash Screen Yaratish

## App Icon (Launcher Icon)

### Talab qilinadigan o'lchamlar:

Baraka Market logotipi uchun quyidagi o'lchamlarda PNG fayllar kerak:

```
android/app/src/main/res/
├── mipmap-mdpi/
│   └── ic_launcher.png (48x48px)
├── mipmap-hdpi/
│   └── ic_launcher.png (72x72px)
├── mipmap-xhdpi/
│   └── ic_launcher.png (96x96px)
├── mipmap-xxhdpi/
│   └── ic_launcher.png (144x144px)
└── mipmap-xxxhdpi/
    └── ic_launcher.png (192x192px)
```

### Dizayn yo'riqnomasi:
- **Fon**: Amber gradient (#F59E0B to #FB923C)
- **Logo**: Oq rangda, markazda
- **Shakl**: Rounded square (Android adaptive icons)
- **Safe zone**: Chetlardan 10% bo'sh joy qoldiring

---

## Splash Screen

### Talab qilinadigan fayllar:

```
android/app/src/main/res/
├── drawable/
│   └── splash.png (2732x2732px - markazda logo)
├── drawable-land/
│   └── splash.png (landscape versiya)
└── values/
    └── styles.xml (fon rangi sozlamalari)
```

### Dizayn yo'riqnomasi:
- **O'lchami**: 2732x2732px (maksimal o'lcham)
- **Fon rang**: `#F59E0B` (amber-500)
- **Logo o'lchami**: 512x512px markazda
- **Format**: PNG, 24-bit yoki 32-bit (shaffoflik bilan)

---

## Icon Generator Vositalari

### 🔧 Online Generators (TAVSIYA):

1. **AppIcon.co** - https://www.appicon.co/
   - Eng oson va tezkor
   - Bir fayl yuklaysiz, barcha o'lchamlarni avtomatik yaratadi
   - Android va iOS uchun

2. **Icon Kitchen** - https://icon.kitchen/
   - Android Studio'ning rasmiy vositasi
   - Adaptive icons qo'llab-quvvatlaydi
   - Background va foreground alohida

3. **Ape Tools** - https://apetools.webprofusion.com/app/#/tools/imagegorilla
   - Bulk generator
   - Custom sizing

### 📱 Offline Generators:

1. **Android Studio Image Asset**
   - Android Studio ichida: Right-click `res` > New > Image Asset
   - PNG faylni import qiling
   - Barcha o'lchamlarni avtomatik yaratadi

---

## Icon Yaratish (Step-by-Step)

### Variant 1: Canva yoki Figma'da dizayn qilish

1. Yangi loyiha yarating: 512x512px
2. Amber gradient fon qo'shing (#F59E0B → #FB923C)
3. Oq rangda "BM" harflari yoki Baraka Market logosini qo'ying
4. PNG formatda export qiling (transparent background bo'lmasa ham bo'ladi)

### Variant 2: AppIcon.co ishlatish

1. https://www.appicon.co/ saytiga kiring
2. 512x512px yoki 1024x1024px PNG faylni yuklang
3. **Android** platformasini tanlang
4. **Generate** bosing
5. Zip faylni yuklab oling
6. Extract qiling va `res/` papkasidagi barcha fayllarni `android/app/src/main/res/` ga ko'chiring

### Variant 3: Android Studio Image Asset

1. Android Studio'ni oching
2. Project structure'da `app/src/main/res` ni toping
3. Right-click > **New** > **Image Asset**
4. **Icon Type**: Launcher Icons
5. **Asset Type**: Image
6. **Path**: 512x512px PNG faylingizni tanlang
7. **Shape**: Squircle yoki Circle (ixtiyoriy)
8. **Next** > **Finish**

---

## Splash Screen Yaratish

### 1. Splash rasm yaratish (Figma/Canva):

```
Dimensions: 2732x2732px
Background: #F59E0B (amber-500)
Logo: 512x512px, markazda
Safe area: Logo markazdan 400px radiusdan tashqariga chiqmasligi kerak
```

### 2. Export:
- Format: PNG
- Quality: High (90-100%)
- Color: RGB
- Fayl nomi: `splash.png`

### 3. Ko'chirish:
```bash
android/app/src/main/res/drawable/splash.png
```

---

## styles.xml Konfiguratsiyasi

`android/app/src/main/res/values/styles.xml` faylini yarating:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <!-- Base application theme -->
    <style name="AppTheme" parent="Theme.AppCompat.Light.DarkActionBar">
        <item name="colorPrimary">@color/colorPrimary</item>
        <item name="colorPrimaryDark">@color/colorPrimaryDark</item>
        <item name="colorAccent">@color/colorAccent</item>
        <item name="android:windowBackground">@color/splashBackground</item>
    </style>

    <!-- Splash screen theme -->
    <style name="AppTheme.NoActionBarLaunch" parent="AppTheme">
        <item name="android:background">@drawable/splash</item>
        <item name="android:windowBackground">@drawable/splash</item>
        <item name="android:windowNoTitle">true</item>
        <item name="android:windowActionBar">false</item>
        <item name="android:windowFullscreen">true</item>
        <item name="android:windowContentOverlay">@null</item>
    </style>
</resources>
```

---

## colors.xml

`android/app/src/main/res/values/colors.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="colorPrimary">#F59E0B</color>
    <color name="colorPrimaryDark">#D97706</color>
    <color name="colorAccent">#FB923C</color>
    <color name="splashBackground">#F59E0B</color>
    <color name="statusBarColor">#F59E0B</color>
</resources>
```

---

## Round Icon (ixtiyoriy)

Agar round (dumaloq) icon ham kerak bo'lsa:

```
mipmap-mdpi/ic_launcher_round.png (48x48px)
mipmap-hdpi/ic_launcher_round.png (72x72px)
mipmap-xhdpi/ic_launcher_round.png (96x96px)
mipmap-xxhdpi/ic_launcher_round.png (144x144px)
mipmap-xxxhdpi/ic_launcher_round.png (192x192px)
```

Bu fayllar kvadrat icon'ning dumaloq versiyasi.

---

## Adaptive Icons (Android 8.0+)

Android 8.0+ uchun adaptive icons qo'llash tavsiya etiladi:

```xml
<!-- android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml -->
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/colorPrimary"/>
    <foreground android:drawable="@drawable/ic_launcher_foreground"/>
</adaptive-icon>
```

Bu uchun:
- `ic_launcher_foreground.xml` - Logo/foreground
- Background'da `@color/colorPrimary` ishlatiladi

---

## Tekshirish

Icons to'g'ri o'rnatilganini tekshirish:

1. Android Studio'da loyihani oching
2. **Run** > **Run 'app'** (emulator yoki real device)
3. App launcher'da Baraka Market ikonini ko'ring
4. Splash screen 1-2 soniya ko'rsatilishi kerak

---

## Tayyor Template

Agar dizayn qilishni istamasangiz, men sizga tayyor template tayyorlayman. Shunchaki:

1. Baraka Market logotipi yoki harflarini (BM) taqdim eting
2. Men barcha o'lchamlarni yarataman
3. Sizga tayyor fayllarni beraman

---

**Murojaat:** Agar biror qismda yordam kerak bo'lsa, xabar bering!
