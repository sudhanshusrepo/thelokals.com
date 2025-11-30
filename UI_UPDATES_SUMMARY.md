# UI Updates: Bookings, Profile, Support Tabs

## Overview
Updated the core application tabs to match the premium aesthetic of the landing page. The design now features:
- **Consistent Theming**: Used Slate/Teal/Purple color palette consistent with the web landing page.
- **Dark Mode Support**: All components are fully styled for both light and dark modes using NativeWind classes.
- **Premium Components**: Added shadows, rounded corners, and cleaner typography.
- **NativeWind Integration**: Migrated from `StyleSheet` to Tailwind classes for better maintainability and consistency.

## Changes by Screen

### 1. Bookings Tab (`bookings.tsx`)
- **New Design**:
  - Clean header with "My Bookings" title.
  - Card-based layout for bookings with status badges.
  - Status-specific colors (Orange for Pending, Green for Completed, Red for Cancelled).
  - Service icons with colored backgrounds.
  - Empty state with a "Book a Service" CTA.
- **Tech**: Replaced `StyleSheet` with NativeWind classes.

### 2. Profile Tab (`profile.tsx`)
- **New Design**:
  - Premium header with avatar placeholder and user details.
  - "Member" and "Location" badges.
  - Prominent "Become a Provider" CTA card with gradient-like background.
  - Clean list of settings options with icons.
  - Distinct "Log Out" button.
- **Tech**: Replaced `StyleSheet` with NativeWind classes.

### 3. Support Tab (`support.tsx`)
- **New Design**:
  - "Help & Support" header.
  - Large, touchable cards for Email, Call, and FAQ options.
  - Colored icons for better visual hierarchy.
  - Footer section for Legal links (Terms, Privacy).
- **Tech**: Replaced `StyleSheet` with NativeWind classes.

## Technical Details
- **Type Safety**: Added `nativewind-env.d.ts` to fix TypeScript errors related to `className`.
- **Imports**: Switched to `react-native` imports for `View` and `Text` to ensure NativeWind compatibility.
