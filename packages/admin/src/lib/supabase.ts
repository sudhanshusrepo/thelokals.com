import { supabase } from '@thelocals/core';

// Admin-specific functions
export { supabase };

export const isAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

    return !!data;
};

export const getAdminRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();

    return data;
};
