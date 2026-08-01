# Utkal Pest Control - Android Application

This directory contains the complete, production-ready Android Studio project for **Utkal Pest Control**.

## Features Included
1. **WebView Integration**: High-performance, hardware-accelerated WebView configured to load `https://utkalpestcontrol.com`.
2. **Splash Screen**: Animated branded splash screen featuring Utkal Pest Control logo and tagline.
3. **Pull-to-Refresh**: Native `SwipeRefreshLayout` support.
4. **Offline Handling**: Automatic network detection with custom offline view and retry button.
5. **Back Button Override**: Back button navigates through web browsing history before closing the app.
6. **External Intent Handling**: Automatically handles `tel:`, `mailto:`, and `whatsapp://` / `wa.me` links by launching native apps.
7. **File Chooser**: Supports file and image upload dialogs for user bookings and reviews.
8. **Notification Ready**: Configured for FCM / Push Notification integration.

---

## How to Build Release APK and Android App Bundle (.aab)

### Option 1: Using Android Studio (Recommended)
1. Open **Android Studio**.
2. Select **Open an Existing Project** and navigate to this `android/` folder.
3. Allow Gradle to sync dependencies automatically.
4. Go to **Build** -> **Generate Signed Bundle / APK...**
5. Select **Android App Bundle (.aab)** or **APK**.
6. Select/Create your signing keystore (or choose debug/release build variant).
7. Select destination folder and click **Finish**.
8. Output files generated:
   - Release APK: `android/app/build/outputs/apk/release/app-release.apk`
   - Release AAB: `android/app/build/outputs/bundle/release/app-release.aab`

### Option 2: Using Command Line (Gradle Wrapper)
Make sure you have JDK 17+ installed.

#### Linux / macOS:
```bash
cd android
./gradlew assembleRelease   # Generates Release APK
./gradlew bundleRelease     # Generates Release AAB
```

#### Windows:
```cmd
cd android
gradlew.bat assembleRelease
gradlew.bat bundleRelease
```

---

## Package Metadata
- **Package Name**: `com.utkalpestcontrol.app`
- **Application Name**: Utkal Pest Control
- **Target SDK**: 34 (Android 14)
- **Minimum SDK**: 24 (Android 7.0)
