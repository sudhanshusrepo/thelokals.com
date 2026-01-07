# Assets & Store Listing Guide

## Required Assets
To publish to the Google Play Store, we need to replace the placeholder assets in `frontend/new_apps/mobile-client/assets/` with brand-specific images.

### 1. App Icon
- **Path**: `./assets/icon.png`
- **Resolution**: 1024x1024px
- **Format**: PNG (No transparency)
- **Purpose**: Main app icon on home screen and store.

### 2. Adaptive Icon
- **Foreground**: `./assets/adaptive-icon.png`  (1024x1024px)
- **Background**: Configure color in `app.json` (`#ffffff`)
- **Purpose**: Android adaptive icon (circle/square/squircle masking).

### 3. Splash Screen
- **Path**: `./assets/splash-icon.png`
- **Resolution**: 1242x2436px (or centered icon on solid background)
- **Purpose**: Screen shown while app is loading.

## Store Listing (Metadata)
Prepare the following text for the Google Play Console:

| Field | Length | Draft Content |
|-------|--------|---------------|
| **App Name** | 30 chars | The Lokals Client |
| **Short Description** | 80 chars | Book local services instantly. Quality pros, fair prices. |
| **Full Description** | 4000 chars | The Lokals connects you with trusted service providers in your area. From home cleaning to repairs, get it done with a tap. Features: Real-time booking, secure payments, verified professionals. |

## Feature Graphic
- **Resolution**: 1024x500px
- **Format**: PNG/JPEG
- **Purpose**: Top banner on Play Store listing.

## Screenshots
Take at least 2 screenshots (16:9 or 9:16) of:
1. Home Screen (Service Discovery)
2. Service Detail (Provider Profile)
3. Booking Flow
4. Booking Confirmation
