

import dotenv from 'dotenv';
import path from 'path';


// Force credentials from MCP if .env fails
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://gdnltvvxiychrsdzenia.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdkbmx0dnZ4aXljaHJzZHplbmlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM4MjM2NzIsImV4cCI6MjA3OTM5OTY3Mn0.LKYscrC9N4320dv0KimqqS83WKHJXQgN5Hyinw2Rua8';

console.log('DEBUG: URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

dotenv.config({ path: path.join(process.cwd(), 'apps/web-client/.env.local') });

// Test Data
const CLIENT_ID = 'deac1349-c990-46f4-bd21-d96c4668a221';
const PROVIDER_ID = 'a07ecf24-ad10-4665-8de0-22a328731f34';
const SERVICE_CATEGORY_ID = '0d580f1d-d9c3-4e8d-85ac-f5981c139448';
const SERVICE_CATEGORY_NAME = 'Plumber';

async function runTest() {
    // Dynamic imports to ensure env vars are set first
    const { bookingService } = await import('../packages/platform-core/src/services/bookingService');
    const { supabase } = await import('../packages/platform-core/src/services/supabase');

    console.log('Starting E2E Booking Flow Test...');

    try {
        // 1. Create Booking
        console.log('1. Creating AI Booking...');
        const result = await bookingService.createAIBooking({
            clientId: CLIENT_ID,
            serviceCategory: SERVICE_CATEGORY_NAME,
            serviceCategoryId: SERVICE_CATEGORY_ID,
            requirements: { issue: 'Leaky faucet' },
            aiChecklist: ['Turn off water'],
            estimatedCost: 500,
            location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
            address: { city: 'Bangalore', line1: 'Test Address' },
            notes: 'E2E Test Booking'
        });

        console.log('Booking Created:', result);
        const bookingId = result.bookingId;

        // 2. Wait for matching logic (async triggers/functions)
        console.log('2. Waiting for system matching (5s)...');
        await new Promise(r => setTimeout(r, 5000));

        // 3. Verify Booking Created
        const booking = await bookingService.getBooking(bookingId);
        console.log('Booking Status:', booking.status);

        // 4. Check for Booking Requests
        const { data: requests, error } = await supabase
            .from('booking_requests')
            .select('*')
            .eq('booking_id', bookingId);

        if (error) {
            console.error('Error fetching requests:', error);
            return;
        }

        console.log(`Found ${requests.length} booking requests.`);

        if (requests.length > 0) {
            console.log('SUCCESS: Booking requests created!');
            requests.forEach(r => {
                console.log(`- Request for Provider ${r.provider_id}, status: ${r.status}`);
            });

            // Check if our specific provider got it (if matching logic works)
            const targetRequest = requests.find(r => r.provider_id === PROVIDER_ID);
            if (targetRequest) {
                console.log('SUCCESS: Target provider received request.');
            } else {
                console.warn('WARNING: Target provider did NOT receive request. Check geolocation/matching logic.');
            }
        } else {
            console.error('FAILURE: No booking requests generated. Check DB triggers/RPC.');
        }

    } catch (e) {
        console.error('Test Failed:', e);
    }
}

runTest();
