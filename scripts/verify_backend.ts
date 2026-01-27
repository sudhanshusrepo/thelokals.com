
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env just in case, but use hardcoded for certainty
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Hardcoded for Verification of Remote Backend (Project: thelokals.com / gdnltvvxiychrsdzenia)
const supabaseUrl = 'https://gdnltvvxiychrsdzenia.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbmx0dnZ4aXljaHJzZHplbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjM2NzIsImV4cCI6MjA3OTM5OTY3Mn0.LKYscrC9N4320dv0KimqqS83WKHJXQgN5Hyinw2Rua8';

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase Env Vars');
    process.exit(1);
}

// Log loaded URL (masked)
console.log(`🔌 Connecting to: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('🔍 Verifying Backend Endpoints...');

    try {
        // 1. Check Public Categories (View/Table)
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

        // 3. Check RPC find_nearby_providers
        // Use parameter names p_lat/p_lng as fixed in migration 003
        const { data: rpcData, error: rpcError } = await supabase
            .rpc('find_nearby_providers', {
                p_service_id: '00000000-0000-0000-0000-000000000000',
                p_lat: 19.0760,
                p_lng: 72.8777,
                p_max_distance: 50000
            });

        if (rpcError) console.error('❌ find_nearby_providers RPC failed:', rpcError.message);
        else console.log(`✅ find_nearby_providers: Returned ${rpcData ? rpcData.length : 0} results`);

        // 4. Check Service Pricing View (Compatibility)
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
