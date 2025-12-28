
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'http://127.0.0.1:54321';
const SERVICE_KEY = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function seedPendingProvider() {
    const email = `provider_pending_${Date.now()}@test.com`;
    const password = 'password123';
    const categoryId = 'test-category-id';

    console.log(`Seeding data for: ${email}`);

    // 1. Ensure Service Category Exists
    const { error: catError } = await supabase
        .from('service_categories')
        .upsert({
            id: categoryId,
            name: 'Test Category',
            group_name: 'Test Group',
            description: 'Category for testing',
            is_active: true
        });

    if (catError) {
        console.error('Error ensuring category:', catError);
        return;
    }
    console.log('Category ensured.');

    // 2. Create Auth User
    const { data: { user }, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role: 'provider' }
    });

    if (userError) {
        console.error('Error creating user:', userError);
        return;
    }

    // 3. Create Profile
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.id,
            email,
            full_name: 'Test Pending Provider'
        });

    if (profileError) console.error('Error creating profile:', profileError);

    // 4. Create Provider Record (Pending)
    const { error: providerError } = await supabase
        .from('providers')
        .upsert({
            id: user.id,
            full_name: 'Test Pending Provider',
            email: email,
            phone: '1234567890',
            category: categoryId,
            verification_status: 'pending',
            is_active: true,
            is_verified: false
        });

    if (providerError) {
        console.error('Error creating provider:', providerError);
    } else {
        console.log('Success! Created pending provider:', email);
    }
}

seedPendingProvider();
