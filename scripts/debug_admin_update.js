
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function debugAdminUpdate() {
    console.log('--- ADMIN UPDATE DEBUGGER ---');
    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. Login
    const { data: { session }, error: loginError } = await authClient.auth.signInWithPassword({
        email: 'admin@thelokals.com',
        password: 'password123'
    });
    if (loginError) { console.error('LOGIN FAILED:', loginError.message); return; }
    console.log('[Auth] Admin logged in. UID:', session.user.id);

    // 1.5 Check Admin Users Visibility
    console.log('[Check] Verifying visibility of own admin_user record...');
    const { data: myself, error: meError } = await authClient
        .from('admin_users')
        .select('id') // Just ID to avoid column issues
        .eq('id', session.user.id);

    if (meError) {
        console.error('[Check] FAILED to read admin_users:', meError);
    } else if (myself.length === 0) {
        console.error('[Check] FAILED: Admin user exists in Auth but CANNOT SEE themselves in admin_users table (RLS Block?).');
        console.error('[Check] This explains why the provider UPDATE policy fails (subquery returns nothing).');
    } else {
        console.log('[Check] SUCCESS: Can see own admin record.');
    }

    // 2. Find Pending Provider
    const { data: providers } = await adminClient
        .from('providers')
        .select('*')
        .eq('verification_status', 'pending')
        .limit(1);

    if (!providers || providers.length === 0) {
        console.warn('[Fetch] No pending providers found. (Make sure one exists)');
        return;
    }
    const providerId = providers[0].id;
    console.log(`[Fetch] Target Provider: ${providerId}`);

    // [Test 0] Visibility Check as ADMIN
    console.log('[Test 0] Checking visibility as ADMIN...');
    const { data: visibleProvider, error: visibleError } = await authClient
        .from('providers')
        .select('*')
        .eq('id', providerId)
        .single();

    if (visibleError || !visibleProvider) {
        console.log(`[Test 0] FAILED: Admin cannot SEE the provider. RLS blocking SELECT. Error: ${visibleError?.message}`);
    } else {
        console.log('[Test 0] SUCCESS: Admin can see the provider.');
    }

    // 3. Attempt UPDATE as ADMIN (RLS Test)
    console.log('[Test 1] Attempting update as ADMIN...');
    const { data: adminUpdate, error: rlsError } = await authClient
        .from('providers')
        .update({ is_verified: true })
        .eq('id', providerId)
        .select();

    if (rlsError) {
        console.error('[Test 1] ERROR:', rlsError);
    } else if (adminUpdate.length === 0) {
        console.error('[Test 1] FAILED: 0 rows returned. RLS Policy is blocking UPDATE.');
    } else {
        console.log('[Test 1] SUCCESS! RLS is working.');
        // Revert 
        await adminClient.from('providers').update({ is_verified: false }).eq('id', providerId);
        return;
    }

    // 4. Attempt UPDATE as SERVICE ROLE (Trigger Test)
    console.log('[Test 2] Attempting update as SERVICE ROLE...');
    const { data: srUpdate, error: srError } = await adminClient
        .from('providers')
        .update({ is_verified: true })
        .eq('id', providerId)
        .select();

    if (srError) {
        console.error('[Test 2] ERROR:', srError);
    } else if (srUpdate.length === 0) {
        console.error('[Test 2] FAILED: 0 rows returned. Something deeper is wrong (Triggers?)');
    } else {
        console.log('[Test 2] SUCCESS! Triggers are fine. The issue is definitely RLS.');
        // Revert
        await adminClient.from('providers').update({ is_verified: false }).eq('id', providerId);
    }
}

debugAdminUpdate();
