const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' }); // Load root env for keys

// Initialize Client (Needs Service Role or User Token to simulate providers)
// Since we don't have Service Role in env (per previous check), this might fail if RLS is strict.
// But we'll try with the available keys.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

const supabase = createClient(supabaseUrl, supabaseKey);

async function simulateRace() {
    console.log("🏎️ Starting Race Condition Simulation...");

    // 1. Create a dummy test user & booking (Mocking the DB entries for speed)
    // We assume a booking exists. Let's create one fresh.
    const { data: booking, error: bError } = await supabase
        .from('bookings')
        .insert({
            user_id: '00000000-0000-0000-0000-000000000000', // Mock User
            service_id: '00000000-0000-0000-0000-000000000000', // Mock Service
            status: 'BOOKING_CREATED',
            booking_type: 'LIVE'
        })
        .select()
        .single();

    // Note: If Foreign Keys fail (User/Service), this insertion will fail.
    // Sprint 2 seeds might help, but we don't have reliable IDs here without querying.
    // So we'll try to FIND an existing IDLE booking or just use a known one if hardcoded?
    // Better: Query an existing service/user first.

    if (bError) {
        console.warn("⚠️ Could not create clean booking (FK constraints?):", bError.message);
        console.log("ℹ️ Attempting to fetch ANY 'BOOKING_CREATED' booking...");
    }

    // Fetch ANY open booking
    const { data: openBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('status', 'BOOKING_CREATED')
        .limit(1)
        .single();

    if (!openBooking) {
        console.error("❌ No open bookings found to test. Aborting.");
        return;
    }

    const bookingId = openBooking.id;
    console.log(`✅ Using Booking ID: ${bookingId}`);

    // 2. Mock 2 Providers
    // We don't need real Auth users if the RPC 'accept_live_booking' doesn't check auth.uid().
    // We just pass provider_id.
    // We'll generate random UUIDs for providers.
    const providerA = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    const providerB = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

    console.log("🏁 Providers ready: A vs B");

    // 3. The Race
    const p1 = supabase.rpc('accept_live_booking', { p_request_id: bookingId, p_provider_id: providerA });
    const p2 = supabase.rpc('accept_live_booking', { p_request_id: bookingId, p_provider_id: providerB });

    const results = await Promise.allSettled([p1, p2]);

    // 4. Analysis
    const winner = results.find(r => r.status === 'fulfilled' && r.value.data?.success);
    const loser = results.find(r => r.status === 'fulfilled' && !r.value.data?.success);

    if (winner && loser) {
        console.log("✅ RACE HANDLED CORRECTLY!");
        console.log("🏆 Winner:", winner.value.data.message);
        console.log("❌ Loser:", loser.value.data.message);
    } else if (results.filter(r => r.status === 'fulfilled' && r.value.data?.success).length > 1) {
        console.error("🚨 CRITICAL FAIL: Double Booking! Both accepted!");
    } else {
        console.log("⚠️ Inconclusive:", results);
    }
}

simulateRace();
