# Layout & Header Standardization Fixes

## Overview
Addressed the "scrolled-up on load" issue and standardized the header layout across the entire application. The header is now fixed with a consistent height, and the main content area has global padding to prevent overlap.

## Implementation Date
December 1, 2025

## Changes Implemented

### 1. Header Standardization (`Header.tsx`)
- Changed positioning from `sticky` to `fixed` (top: 0, left: 0, right: 0).
- Enforced a consistent height of `64px` (`h-16`).
- Increased z-index to `z-50` to ensure it stays above all content.
- Added `backdrop-blur-lg` and high opacity background for better visibility.

### 2. Global Layout Update (`App.tsx`)
- Updated the `<main>` container to have global top padding:
  ```css
  padding-top: calc(64px + env(safe-area-inset-top));
  ```
  This ensures content always starts *below* the header, regardless of the route.
- Added global bottom padding (`80px`) to account for the fixed bottom navigation bar.
- Removed ad-hoc padding from individual pages to avoid double padding.

### 3. Scroll Behavior (`App.tsx`)
- Implemented a `ScrollToTop` component that triggers on every route change (`pathname` change).
- Ensures that when navigating between pages (e.g., from Home to Profile), the new page starts scrolled to the top, not at the previous scroll position.

### 4. Page-Specific Cleanups
- **ServiceRequestPage.tsx**: Removed `pt-24` class.
- **HomePage.tsx**: Removed `pb-24` class.
- **UserDashboard.tsx**: Removed `pb-20` class.
- Verified **Profile**, **Support**, and **Legal** pages now render correctly without hidden content.

## Benefits
- **Consistent UX**: Header behaves identically on all screens.
- **No Hidden Content**: First lines of text are always visible on load.
- **Simplified Maintenance**: Padding is managed in one place (`App.tsx`), not scattered across every page component.
- **Mobile Friendly**: Respects safe-area insets for notched devices.

## Testing Verification
- [x] Home Page: Header fixed, content starts below it.
- [x] Service Request: No double padding, content visible.
- [x] Dashboard/Profile: Content not hidden behind header.
- [x] Navigation: Scroll position resets to top on route change.
- [x] Build: Successful.

---
**Status**: ✅ Fixed & Deployed
**Commit**: `fix: Standardize header layout and fix content overlap`
