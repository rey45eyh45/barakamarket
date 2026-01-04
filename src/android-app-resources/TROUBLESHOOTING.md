# ⚠️ Umumiy Xatolar va Yechimlar

Bu faylda Android APK yaratishda uchraydigan eng ko'p tarqalgan muammolar va ularning yechimlari keltirilgan.

---

## 1. Java/JDK Muammolari

### ❌ Xato: "Java version incorrect"
```
Error: Unsupported Java version. Build requires JDK 17.
```

### ✅ Yechim:

#### Windows:
1. JDK 17 yuklab oling: https://adoptium.net/
2. O'rnating
3. System Environment Variables'ga qo'shing:
   - `JAVA_HOME = C:\Program Files\Eclipse Adoptium\jdk-17.x.x`
   - `PATH`ga qo'shing: `%JAVA_HOME%\bin`
4. CMD'da tekshiring:
```bash
java -version
```

#### Mac/Linux:
```bash
# Install via Homebrew
brew install openjdk@17

# Set JAVA_HOME
export JAVA_HOME=/usr/local/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$PATH

# Add to .zshrc or .bashrc
echo 'export JAVA_HOME=/usr/local/opt/openjdk@17' >> ~/.zshrc
```

---

## 2. Android SDK Muammolari

### ❌ Xato: "SDK location not found"
```
Error: SDK location not found. Define location with sdk.dir in local.properties
```

### ✅ Yechim:

1. Android Studio'da SDK path'ni aniqlang:
   - **File** > **Settings** > **Appearance & Behavior** > **System Settings** > **Android SDK**
   - SDK Location'ni ko'chirib oling

2. `android/local.properties` faylini yarating:

**Windows:**
```properties
sdk.dir=C:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

**Mac:**
```properties
sdk.dir=/Users/YourUsername/Library/Android/sdk
```

**Linux:**
```properties
sdk.dir=/home/YourUsername/Android/Sdk
```

---

## 3. Capacitor Muammolari

### ❌ Xato: "Capacitor command not found"
```
'cap' is not recognized as an internal or external command
```

### ✅ Yechim:
```bash
# Install Capacitor globally
npm install -g @capacitor/cli

# Or use npx
npx cap sync
```

### ❌ Xato: "Capacitor could not find the web assets directory"
```
Error: Could not find the web assets directory
```

### ✅ Yechim:
```bash
# Build web app first
npm run build

# Then sync
npm run cap:sync

# Check if dist/ folder exists
ls dist/
```

---

## 4. Build Muammolari

### ❌ Xato: "Task failed with an exception"
```
Execution failed for task ':app:processDebugResources'
```

### ✅ Yechim:

1. **Clean build:**
```bash
cd android
./gradlew clean
cd ..
npm run cap:sync
```

2. **Android Studio'da:**
   - **Build** > **Clean Project**
   - **Build** > **Rebuild Project**

### ❌ Xato: "Duplicate resources"
```
Error: Duplicate resources
```

### ✅ Yechim:

`android/app/build.gradle`'ga qo'shing:
```gradle
android {
    packagingOptions {
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
    }
}
```

---

## 5. Icon/Splash Screen Muammolari

### ❌ Muammo: Icons ko'rinmayapti

### ✅ Yechim:

1. Icon fayllar to'g'ri joyda ekanini tekshiring:
```bash
android/app/src/main/res/
├── mipmap-mdpi/ic_launcher.png
├── mipmap-hdpi/ic_launcher.png
├── mipmap-xhdpi/ic_launcher.png
├── mipmap-xxhdpi/ic_launcher.png
└── mipmap-xxxhdpi/ic_launcher.png
```

2. Sync qiling:
```bash
npm run cap:sync
```

3. Android Studio'da **Rebuild Project**

### ❌ Muammo: Splash screen ko'rinmayapti

### ✅ Yechim:

1. `splash.png` fayl mavjudligini tekshiring:
```bash
android/app/src/main/res/drawable/splash.png
```

2. `AndroidManifest.xml`'da theme to'g'ri yozilganini tekshiring:
```xml
android:theme="@style/AppTheme.NoActionBarLaunch"
```

3. `styles.xml` faylini tekshiring

---

## 6. Gradle Muammolari

### ❌ Xato: "Could not resolve all dependencies"
```
Could not resolve all dependencies for configuration
```

### ✅ Yechim:

1. `android/build.gradle` faylini oching
2. Repositories qismini tekshiring:
```gradle
repositories {
    google()
    mavenCentral()
    jcenter() // Bu eskirgan, o'chirib tashlang
}
```

3. Gradle sync:
```bash
cd android
./gradlew build --refresh-dependencies
```

### ❌ Xato: "Gradle version issue"
```
This version requires Gradle X.X
```

### ✅ Yechim:

`android/gradle/wrapper/gradle-wrapper.properties`:
```properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.0-all.zip
```

---

## 7. Android Studio Muammolari

### ❌ Muammo: Android Studio ochilmayapti

### ✅ Yechim:

1. **Invalidate Caches:**
   - **File** > **Invalidate Caches / Restart**
   - **Invalidate and Restart**

2. **Reimport Project:**
   - **File** > **Sync Project with Gradle Files**

### ❌ Muammo: "Unable to start ADB server"

### ✅ Yechim:

```bash
# Kill existing ADB
adb kill-server

# Start ADB
adb start-server

# Check devices
adb devices
```

---

## 8. Permission Muammolari

### ❌ Muammo: Kamera ishlamayapti

### ✅ Yechim:

`AndroidManifest.xml`'ga qo'shing:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />
```

### ❌ Muammo: Storage'ga yozish imkoni yo'q

### ✅ Yechim:

Runtime permission so'rang yoki `AndroidManifest.xml`'da:
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
```

---

## 9. Keystore Muammolari

### ❌ Xato: "Failed to read key"
```
Failed to read key from keystore
```

### ✅ Yechim:

1. Keystore parolini to'g'ri kiritganingizni tekshiring
2. Keystore fayl `android/app/` papkasida ekanini tekshiring
3. `build.gradle`'da path to'g'ri yozilganini tekshiring:
```gradle
storeFile file('baraka-market.keystore')
```

### ❌ Xato: "Keystore was tampered with"

### ✅ Yechim:

Keystore fayl buzilgan. Yangi keystore yarating:
```bash
cd android/app
keytool -genkey -v -keystore baraka-market-new.keystore -alias baraka-market -keyalg RSA -keysize 2048 -validity 10000
```

---

## 10. USB Debugging Muammolari

### ❌ Muammo: Telefon topilmayapti

### ✅ Yechim:

1. **Developer Options**ni yoqing:
   - **Settings** > **About Phone**
   - **Build Number**ni 7 marta bosing

2. **USB Debugging**ni yoqing:
   - **Settings** > **Developer Options** > **USB Debugging**

3. USB kabelni tekshiring (ma'lumot uzatadigan kabel bo'lishi kerak)

4. ADB'ni qayta ishga tushiring:
```bash
adb kill-server
adb start-server
adb devices
```

5. Telefondan **Allow USB debugging** oynasida **OK** bosing

---

## 11. Performance Muammolari

### ❌ Muammo: Ilova sekin ochilmoqda

### ✅ Yechim:

1. **ProGuard/R8**ni yoqing (`build.gradle`):
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

2. **Lazy Loading** qo'shing (React code splitting)

3. **Images**ni optimize qiling

### ❌ Muammo: APK hajmi katta

### ✅ Yechim:

1. **Android App Bundle** yarating (APK o'rniga)
2. **ProGuard** yoqing
3. **Unused resources**larni o'chirib tashlang
4. **Vector drawables** ishlatng (PNG o'rniga)

---

## 12. Network Muammolari

### ❌ Muammo: API requests ishlamayapti

### ✅ Yechim:

1. **HTTPS** ishlatayotganingizni tekshiring
2. `AndroidManifest.xml`'da:
```xml
android:usesCleartextTraffic="true"
```

3. **CORS** sozlamalarini tekshiring (backend'da)

---

## 13. Dark Mode Muammolari

### ❌ Muammo: Dark mode noto'g'ri ko'rsatilmoqda

### ✅ Yechim:

`android/app/src/main/res/values-night/styles.xml` yarating:
```xml
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight">
        <!-- Dark mode colors -->
    </style>
</resources>
```

---

## 📞 Yordam Kerakmi?

Agar bu yechimlar yordam bermagan bo'lsa:

1. Xato xabarining to'liq matinini ko'ring
2. `android/app/build/outputs/logs/` papkasidagi loglarni tekshiring
3. Stack Overflow'da qidiring
4. Capacitor docs'ga qarang: https://capacitorjs.com/docs

---

## 🔍 Debug Buyruqlari

```bash
# Android Studio loglarini ko'rish
adb logcat

# Build log
cd android
./gradlew assembleDebug --stacktrace

# Clean everything
./gradlew clean
cd ..
rm -rf node_modules
npm install
npm run build
npm run cap:sync
```

---

**Omad! 🚀** Agar muammo hal bo'lmasa, menga batafsil xato xabarini yuboring.
