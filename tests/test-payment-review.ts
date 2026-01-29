import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

// Service Role Client (for cleanup/setup)
const adminClient = createClient(supabaseUrl, serviceRoleKey);
// Client will be authenticated later
let userClient: any;
let providerClient: any;

async function runTest() {
    console.log('🚀 Starting Payment & Review Logic Test...');

    try {
        // 1. Setup: Create Users & Booking
        console.log('1. Setting up Test Data...');

        // Create/Get User
        const userEmail = `client_${Date.now()}@test.com`;
        const { data: userAuth, error: userError } = await adminClient.auth.admin.createUser({
            email: userEmail,
            password: 'password123',
            email_confirm: true
        });
        if (userError) throw userError;
        const userId = userAuth.user.id;

        const { data: userLogin } = await adminClient.auth.signInWithPassword({
            email: userEmail,
            password: 'password123'
        });
        userClient = createClient(supabaseUrl, supabaseKey);
        await userClient.auth.setSession(userLogin.session);

        // Create/Get Provider
        const providerEmail = `provider_${Date.now()}@test.com`;
        const { data: providerAuth, error: provError } = await adminClient.auth.admin.createUser({
            email: providerEmail,
            password: 'password123',
            email_confirm: true
        });
        if (provError) throw provError;
        const providerId = providerAuth.user.id;

        // Create Provider Profile
        await adminClient.from('providers').insert({
            id: providerId,
            name: 'Test Provider',
            phone: '1234567890',
            service_category_id: '123e4567-e89b-12d3-a456-426614174000', // Mock UUID
            is_active: true
        });

        // Create Booking (COMPLETED status needed for payment)
        const { data: booking, error: bookingError } = await adminClient.from('bookings').insert({
            user_id: userId,
            provider_id: providerId,
            service_id: '123e4567-e89b-12d3-a456-426614174000',
            status: 'COMPLETED',
            total_amount: 500,
            payment_status: 'PENDING'
        }).select().single();

        if (bookingError) throw bookingError;
        const bookingId = booking.id;
        console.log(`✅ Booking Created: ${bookingId} (Status: COMPLETED)`);

        // 2. Test Payment RPC
        console.log('\n2. Testing process_payment RPC...');

        // User calls process_payment via RPC
        const { data: payData, error: payError } = await userClient.rpc('process_payment', {
            p_booking_id: bookingId,
            p_amount: 450,
            p_method: 'UPI'
        });

        if (payError) throw payError;
        console.log('Payment Response:', payData);

        // Verify DB
        const { data: updatedBooking } = await adminClient.from('bookings').select('payment_status, final_cost').eq('id', bookingId).single();
        if (updatedBooking.payment_status !== 'PAID' || updatedBooking.final_cost !== 450) {
            throw new Error(`❌ Payment Verification Failed: ${JSON.stringify(updatedBooking)}`);
        }
        console.log('✅ Payment Verified in DB');


        // 3. Test Review RPC
        console.log('\n3. Testing submit_review RPC...');

        // User calls submit_review
        const { data: reviewData, error: reviewError } = await userClient.rpc('submit_review', {
            p_booking_id: bookingId,
            p_rating: 5,
            p_comment: "Excellent service!"
        });

        if (reviewError) throw reviewError;
        console.log('Review Response:', reviewData);

        // Verify Reviews Table
        const { data: review } = await adminClient.from('reviews').select('*').eq('booking_id', bookingId).single();
        if (!review || review.rating !== 5) {
            throw new Error('❌ Review Verification Failed');
        }
        console.log('✅ Review Record Created');

        // Verify Provider Stats
        const { data: provider } = await adminClient.from('providers').select('rating, review_count').eq('id', providerId).single();
        console.log('Provider Stats:', provider);
        if (provider.review_count !== 1 || provider.rating !== 5) {
            throw new Error('❌ Provider Stats Update Failed');
        }
        console.log('✅ Provider Stats Updated');

    } catch (error: any) {
        console.error('Test Failed:', JSON.stringify(error, null, 2));
        if (error.message) console.error('Error Message:', error.message);
        process.exit(1);
    } finally {
        // Cleanup (optional)
        console.log('\nDone.');
    }
}

runTest();
