// Core Contracts (New)
export * from './contracts';

// Legacy Shared Core Exports (Migrated)// Constants
export * from './constants/cities';

export * from './types';
export * from './services/supabase';
export * from './services/bookingService';
export * from './services/providerService';
// export * from './services/workerService'; // Keeping types separate if needed, assuming providerService covers it? No, explicit export is better.
export * from './services/workerService';
export * from './services/customerService';
export * from './services/paymentService';
export * from './services/authBridge';
export * from './services/geoService';
export * from './services/geminiService';
export * from './services/adminService';
export * from './services/liveBookingService';
export * from './services/otp';
export * from './services/matchingService';
export * from './services/dynamicPricingService';
export * from './services/aiClassificationService';
export * from './services/voiceInputService';
export * from './databaseTypes';
export * from './utils/headerUtils';
export * from './utils/featureFlags';
export * from './components/auth';

// Theme system
export * from './theme';
export * from './config';
export { colors } from './theme';

export { ThemeProvider, useTheme } from './components/ThemeProvider';
export { AuthProvider, useAuth, type AuthContextType } from './components/auth/AuthProvider';
export * from './components/layout/AppHeader';
export * from './components/layout/BottomNav';
export * from './components/layout/AppLayout';
export * from './components/ui/Button';
export { useTheme as useThemeHook } from './hooks/useTheme';

export { ErrorFallback } from './components/ErrorFallback';
export { logger } from './services/logger';
