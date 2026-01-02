
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY is missing from .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdmin() {
    const email = 'admin@thelokals.com';
    const password = 'password123';

    console.log(`Creating/Ensuring admin user: ${email}`);

    // 1. Try to get user first
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let user = users.find(u => u.email === email);

    if (!user) {
        console.log('User not found, creating...');
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (error) {
            console.error('Fatal error creating user:', error);
            return;
        }
        user = data.user;
    } else {
        console.log(`User found: ${user.id}`);
    }

    if (user) {
        await ensureProfileAndRole(user.id, email);
    }
}

async function ensureProfileAndRole(userId, email) {
    console.log(`Promoting ${userId} to SUPER_ADMIN...`);

    // 2. Ensure Profile Exists
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            email: email,
            full_name: 'Super Admin',
            created_at: new Date().toISOString()
        });

    if (profileError) {
        console.error('Error creating profile:', profileError);
    } else {
        console.log('Profile ensured.');
    }

    // 3. Insert into admin_users
    const { error } = await supabase
        .from('admin_users')
        .upsert({
            id: userId,
            role: 'SUPER_ADMIN',
            is_active: true
        });

    if (error) {
        console.error('Error promoting user:', error);
    } else {
        console.log('Success! User is now a SUPER_ADMIN.');
    }
}

createAdmin();
