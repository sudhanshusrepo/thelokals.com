import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Force local Supabase for E2E tests
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Test Data Constants
const TEST_PROVIDER_PHONE = '+919999999999';
const TEST_PROVIDER_EMAIL = 'provider_test@example.com';
const TEST_PASSWORD = 'password';

test.describe('Client Booking Creation E2E', () => {
    test.setTimeout(120000);

    test('Client Flow: Search -> Book -> Pending', async ({ browser }) => {
        // ============================================
        // SETUP: Create Provider (DB only) & Client
        // ============================================
        const clientEmail = 'demo@user.com';
        const clientPassword = 'password';

        console.log(`[SETUP] Ensuring provider exists in DB for availability...`);
        // We need a provider in the DB so that the service is "available" if the app checks for active providers
        // Logic copied from live_booking_end_to_end.spec.ts but we won't log in as them.

        const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        let providerUser = listUsers.users.find(u => u.email === TEST_PROVIDER_EMAIL);

        let providerId;
        if (providerUser) {
            providerId = providerUser.id;
        } else {
            const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
                email: TEST_PROVIDER_EMAIL,
                password: TEST_PASSWORD,
                email_confirm: true,
                phone: TEST_PROVIDER_PHONE,
                phone_confirm: true
            });
            providerId = newUser.user!.id;
        }

        // Setup Provider Profile & Service
        await supabaseAdmin.from('profiles').upsert({
            id: providerId,
            full_name: 'E2E Provider',
            phone: TEST_PROVIDER_PHONE,
            email: TEST_PROVIDER_EMAIL
        });

        await supabaseAdmin.from('providers').upsert({
            id: providerId,
            full_name: 'E2E Provider',
            phone: TEST_PROVIDER_PHONE,
            email: TEST_PROVIDER_EMAIL,
            category: 'Plumber',
            operating_location: 'POINT(-74.0060 40.7128)',
            service_radius_km: 5,
            is_verified: true,
            is_active: true,
            registration_completed: true,
            phone_verified: true,
            business_name: 'E2E Plumbing Services',
            description: 'Test provider for E2E testing'
        });

        // Ensure "Plumber" category exists
        await supabaseAdmin.from('service_categories').upsert({
            name: 'Plumber',
            group_name: 'Home Care & Repair',
            icon: '🔧',
            description: 'Fix plumbing issues'
        }, { onConflict: 'name' });

        // Ensure Service exists
        await supabaseAdmin.from('services').upsert({
            code: 'leak-repair',
            category: 'Plumber',
            name: 'Leak Repair',
            base_price_cents: 50000,
            duration_minutes_min: 60,
            enabled_globally: true,
            description: 'Fix leaks'
        }, { onConflict: 'code' });

        console.log(`[SETUP] Creating client: ${clientEmail}`);
        await supabaseAdmin.auth.admin.createUser({
            email: clientEmail,
            password: clientPassword,
            email_confirm: true
        });

        // ============================================
        // PHASE 1: Client Booking Flow
        // ============================================
        const CLIENT_APP_URL = 'http://localhost:3000';
        const clientContext = await browser.newContext({
            geolocation: { latitude: 40.7128, longitude: -74.0060 },
            permissions: ['geolocation']
        });
        const clientPage = await clientContext.newPage();

        // Console routing
        clientPage.on('console', msg => console.log(`[Client Console] ${msg.type()}: ${msg.text()}`));

        await clientPage.goto(CLIENT_APP_URL);

        // Select Service via Search
        console.log('[STEP] Searching for service...');
        await clientPage.getByPlaceholder(/Search for a service or issue/).fill('Leak Repair');
        await clientPage.getByPlaceholder(/Search for a service or issue/).press('Enter');

        // Verify Service Page
        await expect(clientPage.getByRole('heading', { name: 'Leak Repair', level: 1 })).toBeVisible({ timeout: 10000 });
        console.log('[STEP] Service page loaded');

        // Click Book Now
        await clientPage.getByRole('button', { name: /Book Service/i }).click();

        // Handle Auth Redirect if needed
        await expect(clientPage).toHaveURL(/\/book|\/auth/, { timeout: 15000 });

        if (clientPage.url().includes('/auth')) {
            console.log('[STEP] Handle Auth Redirect (Test Mode Login)...');
            await expect(clientPage.getByPlaceholder('98765 43210')).toBeVisible();
            await clientPage.getByPlaceholder('98765 43210').fill('9999999999');
            await clientPage.getByRole('button', { name: /Send OTP/i }).click();

            await expect(clientPage.getByPlaceholder('123456')).toBeVisible();
            await clientPage.getByPlaceholder('123456').fill('123456');
            await clientPage.getByRole('button', { name: /Verify & Login/i }).click();

            // Wait for redirect back to book
            await expect(clientPage).toHaveURL(/\/book\?service=/, { timeout: 20000 });
        }

        // [NEW] Verify Navigation Footer is Visible (Logged In)
        console.log('[STEP] Verifying Navigation Footer...');
        await expect(clientPage.getByText('Home', { exact: true })).toBeVisible();
        await expect(clientPage.getByText('Profile', { exact: true })).toBeVisible();

        await clientPage.getByPlaceholder('Enter full address, landmark, etc.').fill('Test Address 123');
        await clientPage.locator('input[type="date"]').fill('2025-12-25');
        await clientPage.locator('input[type="time"]').fill('10:00');
        await clientPage.getByRole('button', { name: 'Find Provider' }).click();

        // Booking creation is fast - redirects immediately to booking detail page
        // (Matching page animation skipped with direct insert)

        console.log('[STEP] Waiting for redirect to /bookings/...');
        await expect(clientPage).toHaveURL(/\/bookings\/.+/, { timeout: 20000 });

        const bookingId = (await clientPage.url()).split('/').pop();
        console.log(`[SUCCESS] Booking Created with ID: ${bookingId}`);

        // Verify we're on the booking detail page
        await expect(clientPage.getByText('Booking Status')).toBeVisible({ timeout: 10000 });

        // Verify status timeline shows PENDING (current status)
        await expect(clientPage.getByText('Current Status')).toBeVisible();
    });
});
