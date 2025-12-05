import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';

/**
 * @module supabase
 * @description Initializes and exports a singleton Supabase client instance.
 * although functionality will be broken.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Initializing Supabase Client...');
console.log('URL:', supabaseUrl ? 'Defined' : 'Undefined');
console.log('Key:', supabaseAnonKey ? 'Defined' : 'Undefined');

let client;
try {
    client = createClient(
        supabaseUrl || 'https://placeholder.supabase.co',
        supabaseAnonKey || 'placeholder',
        {
            global: {
                headers: {
                    'Accept': 'application/json',
                }
            }
        }
    );
    console.log('Supabase Client Initialized Successfully');
} catch (error) {
    console.error('FAILED to initialize Supabase Client:', error);
    client = createClient('https://placeholder.supabase.co', 'placeholder');
}

export const supabase = client;
