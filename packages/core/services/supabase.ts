import { createClient } from '@supabase/supabase-js';

/**
 * @module supabase
 * @description Initializes and exports a singleton Supabase client instance.
 * Handles missing environment variables gracefully to prevent app crashes.
 */

// Safe retrieval of env vars with fallback
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder';

// Log warning if utilizing placeholders (critical for debugging)
if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase environment variables are missing! Using placeholder values. Auth will not work.');
}

// Create client with robust configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    },
    global: {
        headers: {
            'Accept': 'application/json',
        }
    }
});

/**
 * Helper to check if Supabase is properly configured
 * usage: if (!isSupabaseConfigured()) { showConfigError() }
 */
export const isSupabaseConfigured = () => {
    return supabaseUrl !== 'https://placeholder.supabase.co' &&
        supabaseAnonKey !== 'placeholder';
};
