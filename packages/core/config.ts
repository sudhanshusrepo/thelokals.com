export const getEnvVar = (key: string, defaultValue: string = ''): string => {
    try {
        // 1. Check for Vite's import.meta.env
        if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
            const val = (import.meta as any).env[key];
            if (val !== undefined) return val;
        }

        // 2. Check for Process Env (Node / Next.js / React Native)
        // Accessing process directly can sometimes throw in strict edge runtimes if not careful
        if (typeof process !== 'undefined' && process.env) {
            const val = process.env[key];
            if (val !== undefined) return val;
        }
    } catch (e) {
        // Ignore errors accessing env objects in weird runtimes
        console.warn(`Error accessing env var ${key}:`, e);
    }

    if (defaultValue) return defaultValue;

    // Build-time fallbacks to prevent Supabase client crash
    if (key.includes('SUPABASE_URL')) return 'https://placeholder.supabase.co';
    if (key.includes('SUPABASE_ANON_KEY')) return 'placeholder-key';

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
