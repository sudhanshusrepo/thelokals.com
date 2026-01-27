
// packages/worker/functions/geo-availability/supabase-client.js
import { createClient } from '@supabase/supabase-js';

export const createSupabaseClient = (env) => {
    // Read-only pool configuration if needed, or standard client
    return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false
        }
    });
};
