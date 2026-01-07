import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { CONFIG } from '../config';

/**
 * @module supabase
 * @description Initializes and exports a singleton Supabase client instance.
 * Handles missing environment variables gracefully to prevent app crashes.
 */

// Initialize the Supabase client
const supabaseUrl = CONFIG.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = CONFIG.SUPABASE_ANON_KEY || 'placeholder';

// Log warning if utilizing placeholders (critical for debugging)
if (supabaseUrl === 'https://placeholder.supabase.co') {
    console.warn('⚠️ Supabase environment variables are missing! Using placeholder values. Auth will not work.');
}

// Create client with robust configuration
// Create client with robust configuration (Default Web Config)
export let supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: typeof window !== 'undefined',
        autoRefreshToken: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined'
    },
    global: {
        headers: {
            'Accept': 'application/json',
        }
    }
}) as any;

/**
 * Re-initialize Supabase client with custom configuration (e.g. for React Native)
 */
export const initSupabase = (url: string, key: string, options: any) => {
    supabase = createClient<Database>(url, key, {
        ...options,
        global: {
            headers: {
                'Accept': 'application/json',
            }
        }
    }) as any;
    return supabase;
};

/**
 * Helper to check if Supabase is properly configured
 * usage: if (!isSupabaseConfigured()) { showConfigError() }
 */
export const isSupabaseConfigured = () => {
    return supabaseUrl !== 'https://placeholder.supabase.co' &&
        supabaseAnonKey !== 'placeholder';
};
