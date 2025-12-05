import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

/**
 * @module supabase
import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

/**
 * @module supabase
 * @description Initializes and exports a singleton Supabase client instance.
 * although functionality will be broken.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase environment variables are missing!');
    throw new Error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
    },
});
