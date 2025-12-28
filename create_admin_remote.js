
const { createClient } = require('@supabase/supabase-js');

// Production credential
const SUPABASE_URL = 'https://gdnltvvxiychrsdzenia.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY; // User has this in env

if (!SUPABASE_ANON_KEY) {
    console.error('SUPABASE_ANON_KEY missing');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createAdmin() {
    console.log('Creating Admin User...');

    // 1. SignUp (Client side creation ensures valid hash)
    const { data, error } = await supabase.auth.signUp({
        email: 'admin@thelokals.com',
        password: 'Admin@123',
        options: {
            data: {
                full_name: 'Super Admin',
                role: 'admin'
            }
        }
    });

    if (error) {
        console.error('Error creating user:', error);
        return;
    }

    console.log('User created:', data.user.id);
    console.log('Note: User needs to be confirmed/promoted manually via SQL if not auto-confirmed.');
}

createAdmin();
