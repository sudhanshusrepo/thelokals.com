import { test, expect } from '../../fixtures/test-fixtures';
import { createClient } from '@supabase/supabase-js';

// Force local Supabase for E2E tests
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAdminKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';
console.log('DEBUG: Using local Supabase:', { url: supabaseUrl, keyStart: supabaseAdminKey.substring(0, 10) });
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

        // Login Helper
        const logInClient = async () => {
            const { data } = await supabaseAdmin.auth.signInWithPassword({ email: clientEmail, password: clientPassword });
            await clientPage.evaluate((session) => {
                localStorage.setItem('sb-' + window.location.host.split('.')[0] + '-auth-token', JSON.stringify(session));
            }, data.session);
            await clientPage.reload();
        };
        await logInClient();

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

        // Ensure overlay is gone (wait for "Processing..." or similar to not be there)
        // Or just force click if it's a fade out animation
        await clientPage.locator('button[data-testid="book-now-button"]').click({ force: true });
        console.log('[PHASE 2] Book Now button clicked');

        // Wait a moment for state to update
        await clientPage.waitForTimeout(1000);

        // Take screenshot for debugging
        await clientPage.screenshot({ path: 'test-results/after-book-now-click.png', fullPage: true });
        console.log('[DEBUG] Screenshot saved: after-book-now-click.png');

        // Wait for LiveSearch screen with better error handling
        try {
            // First, wait for the element to exist in DOM
            await clientPage.waitForSelector('[data-testid="live-search-screen"]', {
                state: 'attached',
                timeout: 30000
            });
            console.log('[DEBUG] live-search-screen element found in DOM');

            // Then wait for it to be visible
            await expect(clientPage.getByTestId('live-search-screen')).toBeVisible({ timeout: 10000 });
            console.log('[DEBUG] live-search-screen is now visible');

            // Verify the "Searching for" text is present
            await expect(clientPage.getByText(/Searching for/i).first()).toBeVisible({ timeout: 5000 });
            console.log('[PHASE 2] ✓ LiveSearch screen displayed successfully');
        } catch (error) {
            console.error('[ERROR] Failed to find LiveSearch screen');
            console.error('Error details:', error);

            // Capture page state for debugging
            const pageContent = await clientPage.content();
            console.log('[DEBUG] Page HTML (first 1000 chars):', pageContent.substring(0, 1000));

            // Take another screenshot
            await clientPage.screenshot({ path: 'test-results/livesearch-error.png', fullPage: true });
            console.log('[DEBUG] Error screenshot saved: livesearch-error.png');

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
