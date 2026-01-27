
const { createClient } = require('@supabase/supabase-js');

// Hardcoded for Verification of Remote Backend (Project: thelokals.com / gdnltvvxiychrsdzenia)
const supabaseUrl = 'https://gdnltvvxiychrsdzenia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbmx0dnZ4aXljaHJzZHplbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjM2NzIsImV4cCI6MjA3OTM5OTY3Mn0.LKYscrC9N4320dv0KimqqS83WKHJXQgN5Hyinw2Rua8';

console.log(`🔌 Connecting to: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('🔍 Verifying Backend Endpoints (Node JS)...');

    try {
        // 1. Check Public Categories
        const { data: categories, error: catError } = await supabase
            .from('service_categories')
            .select('*');

        if (catError) console.error('❌ service_categories failed:', catError.message);
        else console.log(`✅ service_categories: Found ${categories.length} items`);

        // 2. Check Public Providers 
        const { data: providers, error: provError } = await supabase
            .from('providers')
            .select('id, status, is_online')
            .eq('status', 'approved');

        if (provError) console.error('❌ providers (public) failed:', provError.message);
        else console.log(`✅ providers: Found ${providers.length} approved providers`);

        // 3. Check RPC
        const { data: rpcData, error: rpcError } = await supabase
            .rpc('find_nearby_providers', {
                p_service_id: '00000000-0000-0000-0000-000000000000',
                p_lat: 19.0760,
                p_lng: 72.8777,
                p_max_distance: 50000
            });

        if (rpcError) console.error('❌ find_nearby_providers RPC failed:', rpcError.message);
        else console.log(`✅ find_nearby_providers: Returned ${rpcData ? rpcData.length : 0} results`);

        // 4. Check Compat View
        const { data: pricing, error: priceError } = await supabase
            .from('service_pricing')
            .select('*');

        if (priceError) console.error('❌ service_pricing (compat view) failed:', priceError.message);
        else console.log(`✅ service_pricing: Found ${pricing.length} items`);

    } catch (err) {
        console.error('❌ Unexpected script error:', err);
    }
}

verify();
