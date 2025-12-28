
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function debugCleanTable() {
    console.log('--- CLEAN TABLE DEBUGGER ---');
    const authClient = createClient(SUPABASE_URL, ANON_KEY);
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);

    // 1. Login
    const { data: { session }, error: loginError } = await authClient.auth.signInWithPassword({
        email: 'admin@thelokals.com',
        password: 'password123'
    });
    if (loginError) { console.error('LOGIN FAILED:', loginError.message); return; }
    console.log('[Auth] Admin logged in. UID:', session.user.id);

    // 2. Insert Dummy Record (Service Role)
    const { data: inserted, error: insertError } = await adminClient
        .from('providers_clean')
        .insert({ verification_status: 'pending', owner_id: session.user.id }) // Owner is me, or someone else? 
        // Wait, the policy says: USING (EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid()))
        // So ownership doesn't matter for the Admin Policy.
        .select()
        .single();

    if (insertError) {
        console.error('[Setup] Failed to insert dummy record:', insertError);
        return;
    }
    const targetId = inserted.id;
    console.log(`[Setup] Created dummy record: ${targetId}`);

    // 3. Attempt UPDATE as ADMIN
    console.log('[Test] Attempting update as ADMIN on providers_clean...');
    const { data: updateData, error: updateError } = await authClient
        .from('providers_clean')
        .update({ is_verified: true })
        .eq('id', targetId)
        .select();

    if (updateError) {
        console.error('[Test] ERROR:', updateError);
    } else if (updateData.length === 0) {
        console.error('[Test] FAILED: 0 rows returned. RLS is STILL blocking even on clean table.');
    } else {
        console.log('[Test] SUCCESS! Admin can update clean table.');
    }

    // Cleanup
    await adminClient.from('providers_clean').delete().eq('id', targetId);
}

debugCleanTable();
