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

// Helper to safely access process.env without crashing in strict environments, 
// using explicit property access where possible for bundlers.
const safeEnv = (key: string) => {
    try {
        if (typeof process !== 'undefined' && process.env) return process.env[key];
    } catch { }
    return undefined;
};

export const CONFIG = {
    // Explicit access for Next.js/Vite replacement
    SUPABASE_URL:
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
        (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
        safeEnv('EXPO_PUBLIC_SUPABASE_URL') ||
        'https://placeholder.supabase.co',

    SUPABASE_ANON_KEY:
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
        (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
        safeEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY') ||
        // Local Fallback for development only
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0',



    GOOGLE_MAPS_KEY:
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
        (typeof process !== 'undefined' && process.env?.VITE_GOOGLE_MAPS_API_KEY) ||
        safeEnv('EXPO_PUBLIC_GOOGLE_MAPS_API_KEY') || '',

    IS_DEV:
        (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') ||
        safeEnv('DEV') === 'true',

    IS_TEST_MODE:
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_TEST_MODE === 'true') ||
        (typeof process !== 'undefined' && process.env?.VITE_TEST_MODE === 'true') ||
        safeEnv('EXPO_PUBLIC_TEST_MODE') === 'true',

    ENABLE_OTP_BYPASS:
        (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_ENABLE_OTP_BYPASS === 'true') ||
        (typeof process !== 'undefined' && process.env?.VITE_ENABLE_OTP_BYPASS === 'true') ||
        safeEnv('EXPO_PUBLIC_ENABLE_OTP_BYPASS') === 'true',
};
