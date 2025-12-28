
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function testRpc() {
    console.log('--- RPC DEBUGGER ---');
    const authClient = createClient(SUPABASE_URL, ANON_KEY);

    // 1. Login
    const { data: { session }, error: loginError } = await authClient.auth.signInWithPassword({
        email: 'admin@thelokals.com',
        password: 'password123'
    });
    if (loginError) { console.error('LOGIN FAILED:', loginError.message); return; }

    console.log('[Auth] Admin logged in.');

    // 2. Call RPC
    const { data, error } = await authClient.rpc('is_admin');

    if (error) {
        console.error('RPC Call Failed:', error);
    } else {
        console.log('is_admin() returned:', data);
    }
}

testRpc();
