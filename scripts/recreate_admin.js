
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// FORCE Production URL (Local .env is overriding it with localhost)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env');
    console.error('Please ensure you have a .env file with SUPABASE_SERVICE_ROLE_KEY in the root or passed as an environment variable.');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Run this script locally with: node scripts/recreate_admin.js
// Ensure you have SUPABASE_SERVICE_ROLE_KEY in your .env file
async function recreateAdmin() {
    const email = 'admin@thelokals.com';
    const password = 'Dhan@881';

    console.log(`♻️  Recreating admin user: ${email}...`);

    // 1. Find and Delete Existing Authentication User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        console.log(`Found existing auth user (${existingUser.id}). Deleting...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(existingUser.id);
        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            return;
        }
        console.log('✅ Auth user deleted.');
    } else {
        console.log('No existing auth user found.');
    }

    // 2. Clean up public table (just in case of orphans or if cascade didn't catch it)
    console.log('Ensuring clean state in admin_users table...');
    const { error: deletePublicError } = await supabase
        .from('admin_users')
        .delete()
        .eq('email', email);

    if (deletePublicError) {
        console.warn('Warning: Could not delete from admin_users (might already be gone):', deletePublicError.message);
    } else {
        console.log('✅ public.admin_users cleaned.');
    }

    // 3. Create Fresh User
    console.log('Creating new user...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: 'Super Admin' }
    });

    if (createError) {
        console.error('Fatal error creating user:', createError);
        return;
    }

    const userId = newUser.user.id;
    console.log(`✅ User created with ID: ${userId}`);

    // 4. Assign Role
    console.log('Assigning SUPER_ADMIN role...');
    const { error: upsertError } = await supabase
        .from('admin_users')
        .upsert({
            id: userId,
            email: email,
            role: 'SUPER_ADMIN',
            full_name: 'Super Admin',
            is_active: true,
            created_at: new Date().toISOString()
        });

    if (upsertError) {
        console.error('Error assigning role:', upsertError);
    } else {
        console.log('🎉 Success! Admin user has been recreated and promoted to SUPER_ADMIN.');
        console.log('Credentials:');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
    }
}

recreateAdmin();
