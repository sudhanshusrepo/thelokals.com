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
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
}) as any;

/**
 * Helper to check if Supabase is properly configured
 * usage: if (!isSupabaseConfigured()) { showConfigError() }
 */
export const isSupabaseConfigured = () => {
    return supabaseUrl !== 'https://placeholder.supabase.co' &&
        supabaseAnonKey !== 'placeholder';
};
