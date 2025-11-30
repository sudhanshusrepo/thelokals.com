import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin-specific functions
export const isAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', user.id)
        .single();

    return !!data;
};

export const getAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('admin_users')
        .select('role, permissions')
        .eq('user_id', user.id)
        .single();

    return data;
};
