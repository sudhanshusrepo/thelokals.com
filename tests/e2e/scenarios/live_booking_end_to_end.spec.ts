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

test.describe('Unified Booking Lifecycle E2E', () => {
    test.setTimeout(120000);

    test('Full Lifecycle: Request -> Accept -> En Route -> In Progress -> Complete', async ({ browser }) => {
        // ============================================
        // SETUP: Create Provider & Client
        // ============================================
        const clientEmail = `client_${Date.now()}@e2e.test`;
        const clientPassword = 'Password123!';

        console.log(`[SETUP] Creating/Reseting provider: ${TEST_PROVIDER_EMAIL}`);
        // Ensure provider exists with specific email for the OTP Backdoor
        // Delete first to ensure clean state
        const { data: listUsers } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
        let providerUser = listUsers.users.find(u => u.email === TEST_PROVIDER_EMAIL);

        let providerId;
        if (providerUser) {
            console.log(`[SETUP] Provider exists. Updating password...`);
            const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
                providerUser.id,
                { password: TEST_PASSWORD, email_confirm: true, phone_confirm: true }
            );
            if (updateError) throw new Error(`Provider update failed: ${updateError.message}`);
            providerId = providerUser.id;
        } else {
            console.log(`[SETUP] Creating new provider...`);
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: TEST_PROVIDER_EMAIL,
                password: TEST_PASSWORD,
                email_confirm: true,
                phone: TEST_PROVIDER_PHONE,
                phone_confirm: true
            });
            if (createError) throw new Error(`Provider creation failed: ${createError.message}`);
            providerId = newUser.user!.id;
        }

        // Setup Provider Profile & Service
        await supabaseAdmin.from('profiles').upsert({
            id: providerId,
            full_name: 'E2E Provider',
            phone: TEST_PROVIDER_PHONE,
            email: TEST_PROVIDER_EMAIL
        });

        const { error: providerError } = await supabaseAdmin.from('providers').upsert({
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

        if (providerError) throw new Error(`Provider DB record failed: ${providerError.message}`);

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
        // PHASE 1: Provider Login (Phone OTP)
        // ============================================
        const PROVIDER_APP_URL = 'http://localhost:3001';
        const CLIENT_APP_URL = 'http://localhost:3000';
        const providerContext = await browser.newContext({
            geolocation: { latitude: 40.7128, longitude: -74.0060 },
            permissions: ['geolocation']
        });
        const providerPage = await providerContext.newPage();
        providerPage.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));

        // Network Debugging
        await providerPage.route('**/rest/v1/**', async route => {
            const response = await route.fetch();
            if (!response.ok()) {
                console.log(`[Network Error] ${route.request().method()} ${route.request().url()} - ${response.status()}`);
                console.log(await response.text());
            }
            route.fulfill({ response });
        });

        await providerPage.goto(PROVIDER_APP_URL);

        // Login Flow
        await providerPage.getByRole('button', { name: 'Get Started' }).click();

        // Wait for Redirect to Auth
        // await providerPage.waitForURL('**/auth'); // Optional but good

        // Wait for Phone Input directly on page
        await providerPage.getByPlaceholder('+91 98765 43210').fill(TEST_PROVIDER_PHONE);
        await providerPage.getByRole('button', { name: 'Send OTP' }).click();

        // Wait for OTP Input
        await expect(providerPage.getByLabel(/Enter OTP sent to/)).toBeVisible();
        await providerPage.getByPlaceholder('123456').fill('123456');
        await providerPage.getByRole('button', { name: 'Verify & Login' }).click();

        // Verify Dashboard Access
        await expect(providerPage.getByText('Available Jobs')).toBeVisible({ timeout: 15000 });

        // Go Online (Location Tracker)
        // Check if "Go Online" button is present and click it
        const onlineBtn = providerPage.getByRole('button', { name: 'Go Online' });
        if (await onlineBtn.isVisible()) {
            await onlineBtn.click();
            await expect(providerPage.getByText('Online')).toBeVisible();
        }

        // Navigate to Requests Tab - Skipped as we are already on Requests/Jobs view
        // await providerPage.getByRole('button', { name: 'Requests' }).click();
        console.log('[PHASE 1] Provider logged in and Online');

        // ============================================
        // PHASE 2: Client Booking
        // ============================================
        const clientContext = await browser.newContext({
            geolocation: { latitude: 40.7128, longitude: -74.0060 },
            permissions: ['geolocation']
        });
        const clientPage = await clientContext.newPage();
        // Network Debugging
        await clientPage.route('**/rest/v1/**', async route => {
            const response = await route.fetch();
            if (!response.ok()) {
                console.log(`[Client Network Error] ${route.request().method()} ${route.request().url()} - ${response.status()}`);
                console.log(await response.text());
            }
            route.fulfill({ response });
        });
        await clientPage.goto(CLIENT_APP_URL);

        // Select Service
        // Select Service via Search
        await clientPage.getByPlaceholder('Search for services (AC, cab, electrician...)').fill('Leak Repair');
        await clientPage.getByPlaceholder('Search for services (AC, cab, electrician...)').press('Enter');
        await expect(clientPage.getByRole('heading', { name: 'Leak Repair', level: 1 })).toBeVisible();

        // Click Book Now
        await clientPage.getByRole('button', { name: /Book Service/i }).click();

        // 3. BOOKING FORM (/book)
        await expect(clientPage).toHaveURL(/\/book\?service=/);
        await clientPage.getByPlaceholder('Enter full address, landmark, etc.').fill('Test Address 123');
        await clientPage.locator('input[type="date"]').fill('2025-12-25');
        await clientPage.locator('input[type="time"]').fill('10:00');
        await clientPage.getByRole('button', { name: 'Find Provider' }).click();

        // 4. MATCHING (/booking/match)
        await expect(clientPage.getByText('Analysing your request...')).toBeVisible({ timeout: 10000 });

        // 5. TRACKING PAGE (/bookings/[id])
        await expect(clientPage).toHaveURL(/\/bookings\/.+/);
        const bookingId = (await clientPage.url()).split('/').pop();
        console.log(`[PHASE 2] Booking Created with ID: ${bookingId}`);

        // Verify Status Timeline is visible
        await expect(clientPage.getByText('PENDING')).toBeVisible();

        // ============================================
        // PHASE 3: Provider Acceptance
        // ============================================
        await providerPage.bringToFront();
        // Wait for Request Card
        await expect(providerPage.getByText('New Live Booking!')).toBeVisible({ timeout: 30000 });

        // Accept
        await providerPage.getByRole('button', { name: 'Accept Request' }).click();

        // Verify Card moves/disappears or shows "Accepted"
        // Wait for "Bookings" tab to update or check tab switch
        await expect(providerPage.getByText('New Live Booking!')).not.toBeVisible();
        await providerPage.getByRole('button', { name: 'Bookings' }).click();
        await expect(providerPage.getByText('CONFIRMED')).toBeVisible();
        console.log('[PHASE 3] Provider accepted booking');

        // Check Client Side for Update
        await expect(clientPage.getByText('CONFIRMED')).toBeVisible({ timeout: 10000 });

        // ============================================
        // PHASE 4-8: Status Updates
        // ============================================

        // 1. Mark EN_ROUTE
        await providerPage.getByRole('button', { name: 'On My Way' }).click();
        await expect(providerPage.getByText('EN_ROUTE')).toBeVisible();

        // 2. Mark IN_PROGRESS
        await providerPage.getByRole('button', { name: 'Arrived / Start' }).click();
        await expect(providerPage.getByText('IN_PROGRESS')).toBeVisible();

        // 3. Complete
        await providerPage.getByRole('button', { name: 'Complete Job' }).click();
        await expect(providerPage.getByText('COMPLETED')).toBeVisible();

        console.log('[PHASE 8] Job completed successfully');
    });
});
