

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

// FORCE Production URL (Local .env is overriding it with localhost)
const SUPABASE_URL = 'https://gdnltvvxiychrsdzenia.supabase.co';
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

async function resetAdminPassword() {
    const email = 'admin@thelokals.com';
    const newPassword = 'Dhan@881'; // The requested password

    console.log(`Resetting password for: ${email} `);

    // 1. Get User ID
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error(`User ${email} not found! Please run 'node scripts/create_admin.js' first.`);
        return;
    }

    // 2. Update Password
    const { error: updateError } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (updateError) {
        console.error('Error updating password:', updateError);
    } else {
        console.log(`✅ Password for ${email} has been reset to: ${newPassword} `);
        console.log('You can now login at /login');
    }
}

resetAdminPassword();
