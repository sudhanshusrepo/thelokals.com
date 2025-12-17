export const getEnvVar = (key: string, defaultValue: string = ''): string => {
    // Check for Vite's import.meta.env
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        // @ts-ignore
        return import.meta.env[key];
    }

    // Check for React Native / Node process.env
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
        return process.env[key];
    }

    // Check for Expo Constants (Manifest) if available
    // Note: This often requires installing expo-constants, but we can do a safe global check 
    // or rely on the fact that Expo exposes env vars on process.env in recent versions.

    return defaultValue;
};

export const CONFIG = {
    SUPABASE_URL: getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || getEnvVar('VITE_SUPABASE_URL') || getEnvVar('EXPO_PUBLIC_SUPABASE_URL'),
    SUPABASE_ANON_KEY: getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('EXPO_PUBLIC_SUPABASE_ANON_KEY'),
    GOOGLE_MAPS_KEY: getEnvVar('NEXT_PUBLIC_GOOGLE_MAPS_API_KEY') || getEnvVar('VITE_GOOGLE_MAPS_API_KEY') || getEnvVar('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY'),
    IS_DEV: getEnvVar('NODE_ENV') === 'development' || getEnvVar('DEV') === 'true',
    IS_TEST_MODE: getEnvVar('NEXT_PUBLIC_TEST_MODE') === 'true' || getEnvVar('VITE_TEST_MODE') === 'true' || getEnvVar('EXPO_PUBLIC_TEST_MODE') === 'true',
    ENABLE_OTP_BYPASS: getEnvVar('NEXT_PUBLIC_ENABLE_OTP_BYPASS') === 'true' || getEnvVar('VITE_ENABLE_OTP_BYPASS') === 'true' || getEnvVar('EXPO_PUBLIC_ENABLE_OTP_BYPASS') === 'true',
};
