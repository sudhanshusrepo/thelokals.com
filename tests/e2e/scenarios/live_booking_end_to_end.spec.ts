import { test, expect } from '../../fixtures/test-fixtures';
import { createClient } from '@supabase/supabase-js';

// Force local Supabase for E2E tests
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
console.log('DEBUG: Using local Supabase:', {
    url: supabaseUrl,
    keyStart: supabaseAdminKey ? supabaseAdminKey.substring(0, 10) + '...' : 'NULL',
    keyLength: supabaseAdminKey ? supabaseAdminKey.length : 0
});
const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

test.describe('Unified Booking Lifecycle E2E', () => {
    test.setTimeout(120000);

    test('Full Lifecycle: Request -> Accept -> En Route -> In Progress -> Complete', async ({ browser }) => {
        // ============================================
        // SETUP: Create Provider & Client
        // ============================================
        const providerEmail = `provider_${Date.now()}@e2e.test`;
        const providerPassword = 'StrongPass123!';
        const clientEmail = `client_${Date.now()}@e2e.test`;
        const clientPassword = 'Password123!';

        console.log(`[SETUP] Creating provider: ${providerEmail}`);
        const { data: providerAuth } = await supabaseAdmin.auth.admin.createUser({
            email: providerEmail,
            password: providerPassword,
            email_confirm: true
        });
        if (!providerAuth.user) {
            console.error('Provider creation failed. Auth response:', JSON.stringify(providerAuth, null, 2));
            // Also check if there was an error returned alongside data (though destructured above)
            const { error } = await supabaseAdmin.auth.admin.createUser({
                email: providerEmail,
                password: providerPassword,
                email_confirm: true
            });
            if (error) console.error('Provider creation error object:', error);
            throw new Error('Provider creation failed - user is null');
        }
        const providerId = providerAuth.user!.id;

        // Setup Provider Profile & Service with CORRECT column names
        await supabaseAdmin.from('profiles').upsert({
            id: providerId,
            full_name: 'E2E Provider',
            phone: '+919876543210',
            email: providerEmail
        });

        const { data: providerData, error: providerError } = await supabaseAdmin.from('providers').upsert({
            id: providerId,
            full_name: 'E2E Provider',
            phone: '+919876543210',
            email: providerEmail,
            category: 'Plumber', // Single category, not array
            operating_location: 'POINT(-74.0060 40.7128)', // Correct column name
            service_radius_km: 5, // Correct column name
            is_verified: true,
            is_active: true,
            registration_completed: true, // Mark as registered
            phone_verified: true,
            business_name: 'E2E Plumbing Services',
            description: 'Test provider for E2E testing'
        }).select();

        if (providerError) {
            throw new Error(`Provider creation failed: ${providerError.message}`);
        }
        console.log(`[SETUP] Provider created and verified:`, providerData);

        // Ensure "Plumber" category exists in DB (backend requirement)
        const { error: seedError } = await supabaseAdmin
            .from('service_categories')
            .upsert({
                name: 'Plumber',
                group_name: 'Home Care & Repair',
                icon: '🔧',
                description: 'Fix plumbing issues'
            }, { onConflict: 'name' });

        if (seedError) {
            console.error('Failed to seed service category:', seedError);
        }

        console.log(`[SETUP] Creating client: ${clientEmail}`);
        const { data: clientAuth } = await supabaseAdmin.auth.admin.createUser({
            email: clientEmail,
            password: clientPassword,
            email_confirm: true
        });
        const clientId = clientAuth.user!.id;

        // ============================================
        // PHASE 1: Provider Login
        // ============================================
        // ============================================
        // PHASE 1: Provider Login
        // ============================================
        const providerContext = await browser.newContext({
            geolocation: { latitude: 40.7128, longitude: -74.0060 },
            permissions: ['geolocation']
        });
        const providerPage = await providerContext.newPage();
        providerPage.on('console', msg => {
            console.log(`[Provider Browser] ${msg.type()}: ${msg.text()}`);
        }); providerPage.on('requestfailed', request => console.log(`[Provider Browser] Request failed: ${request.url()} - ${request.failure()?.errorText}`));
        providerPage.on('response', response => {
            if (response.status() >= 400) console.log(`[Provider Browser] Response error: ${response.url()} ${response.status()}`);
        });
        await providerPage.goto('http://localhost:5173');

        // Login Flow
        await providerPage.getByRole('button', { name: 'Get Started' }).click();
        const modal = providerPage.locator('.fixed.inset-0');
        await modal.getByRole('button', { name: 'Sign In' }).first().click();
        await modal.getByPlaceholder('you@example.com').fill(providerEmail);
        await modal.getByPlaceholder('••••••••').fill(providerPassword);
        await modal.getByRole('button', { name: /sign in/i }).last().click();
        await expect(providerPage.getByText('Dashboard')).toBeVisible({ timeout: 15000 });

        // Navigate to Requests Page specifically
        await providerPage.goto('http://localhost:5173/bookings');
        console.log('[PHASE 1] Provider logged in and on Requests page');

        // ============================================
        // PHASE 2: Client Booking (AI Flow)
        // ============================================
        const clientContext = await browser.newContext({
            geolocation: { latitude: 40.7128, longitude: -74.0060 },
            permissions: ['geolocation']
        });
        const clientPage = await clientContext.newPage();
        await clientPage.goto('http://localhost:3000');
        clientPage.on('console', msg => console.log(`[Client Browser] ${msg.type()}: ${msg.text()}`));

        // Login Helper - REMOVED (Unreliable LocalStorage Key)
        // We will login via the UI flow triggered by Book Now

        // Create Booking
        await clientPage.getByText('Home Care & Repair').click();
        await clientPage.getByText('Plumber').click();
        // Phase 2.1: Select Service Type (Schedule Page)
        await clientPage.locator('[data-testid="service-type-leak-repair"]').click();
        const chatInput = clientPage.locator('textarea[data-testid="smart-service-input-textarea"]');
        await expect(chatInput).toBeVisible({ timeout: 10000 });
        await chatInput.fill('Fix leaking faucet urgency high');
        await chatInput.press('Enter');

        // Check for AI Response & Checklist
        await expect(clientPage.locator('[data-testid="ai-checklist-section"]')).toBeVisible({ timeout: 30000 });
        // Wait for pricing to finish and overlay to disappear
        await expect(clientPage.getByText('Calculating Price...')).not.toBeVisible();
        await expect(clientPage.locator('button[data-testid="book-now-button"]')).toBeEnabled();

        // CLICK 1: Triggers Auth Modal
        await clientPage.locator('button[data-testid="book-now-button"]').dispatchEvent('click');
        console.log('[PHASE 2] Book Now clicked (Triggering Auth)');

        // Handle Auth Modal
        const authModal = clientPage.locator('[data-testid="auth-modal-overlay"]'); // Modal overlay
        await expect(authModal).toBeVisible({ timeout: 5000 });

        // Fill Login Form
        await authModal.getByTestId('email-input').fill(clientEmail);
        await authModal.getByTestId('password-input').fill(clientPassword);

        // Submit Login (Force to bypass animation issues)
        const submitBtn = authModal.getByTestId('submit-button');
        await expect(submitBtn).toBeVisible();
        await submitBtn.click({ force: true });

        // Wait for Modal to Close (Login Success)
        await expect(authModal).not.toBeVisible({ timeout: 15000 });
        console.log('[PHASE 2] Client Logged In via UI');

        // CLICK 2: Actual Booking
        // Wait a small moment for state to settle
        await clientPage.waitForTimeout(1000);
        await clientPage.locator('button[data-testid="book-now-button"]').dispatchEvent('click');
        console.log('[PHASE 2] Book Now clicked (Authenticated)');

        // Wait a moment for state to update
        await clientPage.waitForTimeout(1000);

        // Take screenshot for debugging
        await clientPage.screenshot({ path: 'test-results/after-book-now-click.png', fullPage: true });
        console.log('[DEBUG] Screenshot saved: after-book-now-click.png');

        // Wait for LiveSearch screen OR Error
        try {
            const liveSearchPromise = clientPage.waitForSelector('[data-testid="live-search-screen"]', {
                state: 'visible',
                timeout: 30000
            });
            const errorPromise = clientPage.waitForSelector('[data-testid="booking-error"]', {
                state: 'visible',
                timeout: 30000
            });

            const result = await Promise.race([liveSearchPromise, errorPromise]);

            // Check if it was an error
            const isError = await clientPage.isVisible('[data-testid="booking-error"]');
            if (isError) {
                const errorText = await clientPage.textContent('[data-testid="booking-error"]');
                console.error(`[CRITICAL] Booking Failed visible in UI: ${errorText}`);
                throw new Error(`Booking Failed: ${errorText}`);
            }

            console.log('[DEBUG] live-search-screen is visible');

            // Verify the "Searching for" text is present
            await expect(clientPage.getByText(/Searching for/i).first()).toBeVisible({ timeout: 5000 });
            console.log('[PHASE 2] ✓ LiveSearch screen displayed successfully');
        } catch (error) {
            console.error('[ERROR] Failed to find LiveSearch screen or found error');
            console.error('Error details:', error);
            await clientPage.screenshot({ path: 'test-results/livesearch-error.png', fullPage: true });
            throw error;
        }

        const bookingIdText = await clientPage.getByTestId('booking-id').textContent();
        console.log(`[PHASE 2] Booking Created. ID: ${bookingIdText}`);

        // ============================================
        // PHASE 3: Provider Acceptance
        // ============================================
        await providerPage.bringToFront();
        // Allow time for realtime event
        await expect(providerPage.getByText('Plumber')).toBeVisible({ timeout: 20000 }); // Service name
        await expect(providerPage.getByText('PENDING')).toBeVisible();

        // Click "View & Accept"
        await providerPage.getByRole('button', { name: 'View & Accept' }).click();

        // Modal Action
        await providerPage.getByRole('button', { name: 'Accept Job' }).click();
        await expect(providerPage.getByText('Booking Accepted!')).toBeVisible();
        console.log('[PHASE 3] Provider accepted booking');

        // ============================================
        // PHASE 4: Client Verification (Confirmed)
        // ============================================
        await clientPage.bringToFront();
        // Client should see "Provider confirmed"
        await expect(clientPage.getByText(/Provider confirmed/i)).toBeVisible({ timeout: 10000 });
        console.log('[PHASE 4] Client sees CONFIRMED status');

        // ============================================
        // PHASE 5: Provider "On My Way" (EN_ROUTE)
        // ============================================
        await providerPage.bringToFront();

        // VERIFICATION: Check for Auto-Navigation
        // The provider should now be on the BookingDetailsPage automatically.
        // We verify this by looking for the "I'm on my way" button immediately.
        await expect(providerPage.getByRole('button', { name: "I'm on my way" })).toBeVisible({ timeout: 10000 });
        console.log('[PHASE 5] Auto-navigation verified. Provider is on details page.');

        await providerPage.getByRole('button', { name: "I'm on my way" }).click();
        await expect(providerPage.getByText('Start Job')).toBeVisible(); // Next state button
        console.log('[PHASE 5] Provider marked EN_ROUTE');

        // ============================================
        // PHASE 6: Client Verification (En Route)
        // ============================================
        await clientPage.bringToFront();
        await expect(clientPage.getByText(/Provider is On The Way/i)).toBeVisible({ timeout: 10000 });
        console.log('[PHASE 6] Client sees EN_ROUTE status');

        // ============================================
        // PHASE 7: Start Job (IN_PROGRESS)
        // ============================================
        await providerPage.bringToFront();
        await providerPage.getByRole('button', { name: 'Start Job' }).click();
        await expect(providerPage.getByText('Mark as Completed')).toBeVisible();
        console.log('[PHASE 7] Provider started job');

        await clientPage.bringToFront();
        await expect(clientPage.getByText(/Job is in progress/i)).toBeVisible();

        // ============================================
        // PHASE 8: Complete Job (COMPLETED)
        // ============================================
        await providerPage.bringToFront();
        // Must complete checklist first?
        // "disabled={progressPercentage < 100}"

        // Check all checkboxes
        const checkboxes = await providerPage.locator('input[type="checkbox"]').all();
        for (const box of checkboxes) {
            await box.check();
        }

        await providerPage.getByRole('button', { name: 'Mark as Completed' }).click();
        await expect(providerPage.getByText('Job Completed Successfully')).toBeVisible();
        console.log('[PHASE 8] Job completed');

        // ============================================
        // PHASE 9: Final Client Verification
        // ============================================
        await clientPage.bringToFront();
        await expect(clientPage.getByText(/Job completed successfully/i)).toBeVisible();
        console.log('[PHASE 9] Client sees COMPLETED status. Full cycle success!');
    });
});
