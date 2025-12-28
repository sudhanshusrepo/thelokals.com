
const { createClient } = require('@supabase/supabase-js');

// Config from .env (Assuming checked manually or from previous context)
const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'; // Service Role
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

async function debugRLS() {
    console.log('--- DB RLS Debugger ---');

    // 1. Check Root Data (Service Role)
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: allProviders, error: rootError } = await adminClient
        .from('providers')
        .select('id, full_name, verification_status')
        .limit(5);

    if (rootError) {
        console.error('ROOT QUERY FAILED:', rootError);
        return;
    }
    console.log(`[Root] Found ${allProviders.length} providers.`);
    console.log('[Root] Sample:', allProviders[0]);

    // 2. Check Admin User Access
    const authClient = createClient(SUPABASE_URL, ANON_KEY);

    // Login
    const { data: { session }, error: loginError } = await authClient.auth.signInWithPassword({
        email: 'admin@thelokals.com',
        password: 'password123'
    });

    if (loginError) {
        console.error('LOGIN FAILED:', loginError.message);
        return;
    }
    console.log('[Auth] Admin logged in. UID:', session.user.id);

    // Query as Admin - Check Admin Users table
    const { data: adminCheck, error: adminAuthError } = await authClient
        .from('admin_users')
        .select('id, email')
        .eq('id', session.user.id);

    if (adminAuthError) {
        console.error('[Admin] ADMIN_USERS CHECK FAILED:', adminAuthError);
    } else {
        console.log(`[Admin] Admin User entry visible: ${adminCheck.length > 0}`);
    }

    // Query as Admin - Providers
    const { data: visibleProviders, error: rlsError } = await authClient
        .from('providers')
        .select('id, full_name, verification_status')
        .limit(5);

    if (rlsError) {
        console.error('[Admin] PROVIDERS QUERY FAILED:', rlsError);
    } else {
        console.log(`[Admin] Visible Providers: ${visibleProviders.length}`);
    }

    // Query as Admin - Service Categories (Write Access Check)
    const { data: categories, error: catError } = await authClient
        .from('service_categories')
        .select('id, name')
        .limit(1);

    if (catError) {
        console.error('[Admin] CATEGORIES READ FAILED:', catError);
    } else {
        console.log(`[Admin] Visible Categories: ${categories.length}`);
        // Try Insert
        const newCat = {
            name: `Debug Cat ${Date.now()}`,
            group_name: 'Debug',
            description: 'RLS Check'
        };
        const { data: insertData, error: insertError } = await authClient
            .from('service_categories')
            .insert(newCat)
            .select();

        if (insertError) {
            console.error('[Admin] CATEGORIES INSERT FAILED (RLS?):', insertError);
        } else {
            console.log('[Admin] CATEGORIES INSERT SUCCESS:', insertData[0].name);
            // Cleanup
            await adminClient.from('service_categories').delete().eq('id', insertData[0].id);
        }
    }
}

debugRLS();
