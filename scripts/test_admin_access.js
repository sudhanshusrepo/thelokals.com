
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
// Anon Key from .env
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, ANON_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testAccess() {
    const email = 'admin@thelokals.com';
    const password = 'password123';

    console.log('1. Attempting Login with Anon Key...');
    const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginError) {
        console.error('Login Failed:', loginError.message);
        return;
    }
    console.log('Login Successful. User ID:', session.user.id);

    console.log('2. Attempting to fetch Profile...');
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('email', email)
        .single();

    if (profileError) console.error('Profile Fetch Failed:', profileError);
    else console.log('Profile Fetched:', profile);

    console.log('3. Attempting to fetch Admin User...');
    const { data: admin, error: adminError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (adminError) console.error('Admin User Fetch Failed:', adminError);
    else console.log('Admin User Fetched:', admin);
}

testAccess();
