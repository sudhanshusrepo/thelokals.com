const { createClient } = require('@supabase/supabase-js');
// dotenv removed
// require('dotenv').config({ path: '.env' });
// require('dotenv').config({ path: 'apps/web-client/.env.local', override: true });

// Config
const SUPABASE_URL = 'https://gdnltvvxiychrsdzenia.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbmx0dnZ4aXljaHJzZHplbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjM2NzIsImV4cCI6MjA3OTM5OTY3Mn0.LKYscrC9N4320dv0KimqqS83WKHJXQgN5Hyinw2Rua8';
const SERVICE_KEY = SUPABASE_KEY; // Force use of Anon Key to bypass potential env var mismatch
const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function simulateMovement(bookingId, providerId) {
    console.log(`🚀 Starting Movement Simulation for Booking: ${bookingId}`);

    // 1. Get Booking Destination (Admin RPC bypass)
    const { data: booking, error } = await supabase.rpc('get_booking_admin', { p_booking_id: bookingId });

    if (error || !booking) {
        console.error("❌ Booking not found:", error?.message);
        return;
    }

    const destination = booking.requirements.location;
    if (!destination || !destination.lat || !destination.lng) {
        console.error("❌ No location found in booking requirements.");
        return;
    }

    console.log(`📍 Destination: ${destination.address} (${destination.lat}, ${destination.lng})`);

    // 2. Start from 500m away (approx 0.005 deg)
    let currentLat = destination.lat - 0.005;
    let currentLng = destination.lng - 0.005;

    // 3. Set Status to EN_ROUTE
    await supabase.rpc('update_booking_status_admin', { p_booking_id: bookingId, p_status: 'EN_ROUTE' });
    console.log("🚚 Status: EN_ROUTE");

    // 4. Move every 1s
    const steps = 10;
    const channel = supabase.channel(`booking-updates:${bookingId}`);

    channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
            console.log("📡 Connected to Channel. Beginning journey...");

            for (let i = 0; i <= steps; i++) {
                // Interpolate
                const progress = i / steps;
                const lat = currentLat + (destination.lat - currentLat) * progress;
                const lng = currentLng + (destination.lng - currentLng) * progress;

                // Broadcast
                await channel.send({
                    type: 'broadcast',
                    event: 'provider_location',
                    payload: { lat, lng }
                });

                console.log(`📍 [${i}/${steps}] Moving... ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                await new Promise(r => setTimeout(r, 1000));
            }

            // 5. Arrive
            console.log("✅ Arrived!");
            await supabase.rpc('update_booking_status_admin', { p_booking_id: bookingId, p_status: 'IN_PROGRESS' });
            console.log("🛠️ Status: IN_PROGRESS");

            // Cleanup
            supabase.removeChannel(channel);
            process.exit(0);
        }
    });
}

// CLI Args
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: node scripts/simulate-provider-movement.js <bookingId> <providerId>");

    // Auto-fetch active booking for dev convenience
    (async () => {
        const { data } = await supabase.from('bookings').select('id, provider_id').eq('status', 'CONFIRMED').limit(1).single();
        if (data) {
            console.log("💡 Auto-detected active booking:", data.id);
            simulateMovement(data.id, data.provider_id || 'mock-provider-id');
        } else {
            process.exit(1);
        }
    })();
} else {
    simulateMovement(args[0], args[1]);
}
