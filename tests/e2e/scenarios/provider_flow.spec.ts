import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing. Please check your .env file.');
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const TEST_PROVIDER_EMAIL = `provider.test.${Date.now()}@test.com`;
const TEST_PROVIDER_PASSWORD = 'password123';

test.describe('Provider Booking Acceptance Flow', () => {
    let providerId: string;
    let clientId: string;
    let bookingId: string;

    test.beforeAll(async () => {
        // 1. Create Provider User
        const { data: providerAuth, error: providerError } = await supabaseAdmin.auth.admin.createUser({
            email: TEST_PROVIDER_EMAIL,
            password: TEST_PROVIDER_PASSWORD,
            email_confirm: true,
            user_metadata: { role: 'provider', name: 'Test Provider' }
        });

        if (providerError) throw providerError;
        providerId = providerAuth.user.id;

        // Ensure provider profile exists in public.users/user_profiles if needed
        // Assuming trigger handles it, or we insert manually if needed.
        // For 'users' table (our custom table):
        await supabaseAdmin.from('users').upsert({
            id: providerId,
            name: 'Test Provider',
            email: TEST_PROVIDER_EMAIL,
            role: 'provider',
            phone: '1234567890'
        });

        // 2. Create Client User for booking ownership
        const { data: clientAuth, error: clientError } = await supabaseAdmin.auth.admin.createUser({
            email: `client.${Date.now()}@test.com`,
            password: 'password123',
            email_confirm: true,
            user_metadata: { role: 'client', name: 'Test Client' }
        });
        if (clientError) throw clientError;
        clientId = clientAuth.user.id;

        await supabaseAdmin.from('users').upsert({
            id: clientId,
            name: 'Test Client',
            email: `client.${Date.now()}@test.com`,
            role: 'client',
            phone: '9876543210'
        });

        // 3. Create Provider Record in providers table
        const { error: providerRecordError } = await supabaseAdmin.from('providers').upsert({
            id: providerId,
            full_name: 'Test Provider',
            email: TEST_PROVIDER_EMAIL,
            phone: '1234567890',
            category: 'Plumber'
        });

        if (providerRecordError) {
            console.error('[SETUP ERROR] Failed to create provider record:', providerRecordError);
            throw providerRecordError;
        }
        console.log(`[SETUP] Created Provider Record: ${providerId}`);
    });

    test('Provider can view and accept a booking request', async ({ page }) => {
        // 3. Create a PENDING booking directly in DB
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from('bookings')
            .insert({
                user_id: clientId,
                service_code: 'bathroom-fitting',
                service_category: 'Plumber',
                status: 'PENDING',
                estimated_cost: 500.00,
                address: { full_address: "123 Test St" },
                requirements: {}
            })
            .select()
            .single();

        if (bookingError) throw bookingError;
        bookingId = booking.id;
        console.log(`[SETUP] Created Pending Booking: ${bookingId}`);

        // 4. Create a Booking Request for this provider
        const { error: requestError } = await supabaseAdmin
            .from('live_booking_requests')
            .insert({
                booking_id: bookingId,
                provider_id: providerId,
                status: 'PENDING',
                expires_at: new Date(Date.now() + 3600000).toISOString() // 1 hour expiry
            });

        if (requestError) throw requestError;
        console.log(`[SETUP] Created Booking Request for Provider: ${providerId}`);

        // 5. Test Provider Flow
        await page.goto('http://localhost:3001/auth/login'); // Provider App Port

        // Login
        await page.fill('input[type="email"]', TEST_PROVIDER_EMAIL);
        await page.fill('input[type="password"]', TEST_PROVIDER_PASSWORD);
        await page.click('button[type="submit"]');

        // Verify Dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
        await expect(page.getByText('Provider Dashboard')).toBeVisible();

        // 6. Verify "Requests" Tab shows the new request
        // It might be under "Requests" tab which is active by default
        await expect(page.getByText('New Live Booking!')).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Accept Request')).toBeVisible();

        // 7. Accept the Request
        await page.click('button:has-text("Accept Request")');

        // 8. Verify Status Change
        // It should disappear from "Requests" and appear in "Bookings" (Active)
        await expect(page.getByText('New Live Booking!')).not.toBeVisible({ timeout: 5000 });

        // Switch to "Bookings" tab if not auto-redirected
        const bookingsTab = page.getByText('Bookings', { exact: true });
        if (await bookingsTab.isVisible()) {
            await bookingsTab.click();
        }

        // Verify it appears in "Active" bookings logic or "Upcoming" depending on logic
        // Status updates to CONFIRMED.
        // Check for client name or ID
        await expect(page.getByText('Test Client')).toBeVisible();
        await expect(page.getByText('CONFIRMED')).toBeVisible();

        console.log('[SUCCESS] Provider successfully accepted booking!');
    });
});
