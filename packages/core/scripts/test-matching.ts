import { createClient } from '@supabase/supabase-js';
import { matchingService } from '../services/matchingService';
import * as dotenv from 'dotenv';
import path from 'path';

// Load env vars from root .env if available
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Needed for admin actions if any

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runTest() {
    console.log('🚀 Starting Matching Service Test...');

    try {
        // 1. Setup: Ensure we have a test provider
        console.log('1️⃣ Setting up test provider...');
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log('⚠️ No authenticated user found. Please login or set up a test user.');
            // For this script to work fully, we might need a logged-in user or use service role
            // Let's assume we are running this in an environment where we can use service role for setup
            // or the user runs it locally with their session.
        }

        // For the sake of the test, let's assume we have a provider "Test Provider"
        // We'll search for one or create a dummy one if we have service role access.
        // Since we might not, we'll skip creation and assume one exists for 'cleaning'.

        // 2. Create a Test Booking
        console.log('2️⃣ Creating test booking (REQUESTED)...');
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                service_category: 'cleaning',
                service_mode: 'local',
                status: 'REQUESTED',
                estimated_price_min: 500,
                estimated_price_max: 700,
                address: { city: 'Test City' }, // Ensure this matches a provider's city
                client_id: user?.id // Optional if RLS allows null, but usually required
            })
            .select()
            .single();

        if (bookingError) throw new Error(`Booking creation failed: ${bookingError.message}`);
        console.log(`✅ Booking created: ${booking.id}`);

        // 3. Find Providers
        console.log('3️⃣ Finding providers...');
        const matchResult = await matchingService.findProviders(booking.id);
        console.log(`✅ Found ${matchResult.count} providers:`, matchResult.matchedProviderIds);

        if (matchResult.count === 0) {
            console.warn('⚠️ No providers found. Make sure you have active providers with service_category="cleaning" and city="Test City".');
        }

        // 4. Notify Providers
        console.log('4️⃣ Notifying providers...');
        await matchingService.notifyProviders(booking.id, matchResult.matchedProviderIds);
        console.log('✅ Providers notified (Requests created)');

        // 5. Verify Requests
        const { data: requests } = await supabase
            .from('booking_requests')
            .select('*')
            .eq('booking_id', booking.id);

        console.log(`✅ Verified ${requests?.length} requests in DB`);

        // 6. Simulate Acceptance (by the first provider)
        if (matchResult.matchedProviderIds.length > 0) {
            const providerId = matchResult.matchedProviderIds[0];
            console.log(`5️⃣ Simulating acceptance by provider ${providerId}...`);

            const success = await matchingService.acceptBooking(booking.id, providerId);

            if (success) {
                console.log('✅ Booking accepted successfully!');
            } else {
                console.error('❌ Booking acceptance failed.');
            }

            // 7. Verify Final State
            const { data: updatedBooking } = await supabase
                .from('bookings')
                .select('status, provider_id')
                .eq('id', booking.id)
                .single();

            console.log('6️⃣ Final Booking State:', updatedBooking);

            if (updatedBooking?.status === 'CONFIRMED' && updatedBooking?.provider_id === providerId) {
                console.log('🎉 TEST PASSED: Full flow verified.');
            } else {
                console.error('❌ TEST FAILED: Booking state mismatch.');
            }

        } else {
            console.log('⏭️ Skipping acceptance test (no providers found).');
        }

    } catch (error: any) {
        console.error('❌ Test failed:', error.message);
    }
}

runTest();
