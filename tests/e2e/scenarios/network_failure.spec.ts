import { test, expect } from '../../fixtures/test-fixtures';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

test.describe('Network Failure Scenario', () => {
    test.setTimeout(120000);

    test('Booking Creation Fails when Offline -> Succeeds when Online', async ({ browser }) => {
        // ============================================
        // SETUP: Create Client Only (Provider not needed for this client-side failure check, but good for completeness)
        // ============================================
        const clientEmail = `client_netfail_${Date.now()}@e2e.test`;
        const clientPassword = 'Password123!';

        console.log(`[SETUP] Creating client: ${clientEmail}`);
        const { data: clientAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: clientEmail,
            password: clientPassword,
            email_confirm: true
        });
        if (createError || !clientAuth.user) throw new Error('Client creation failed');

        // ============================================
        // PHASE 1: Client Booking Flow
        // ============================================
        const clientContext = await browser.newContext({
            geolocation: { latitude: 40.7128, longitude: -74.0060 },
            permissions: ['geolocation']
        });
        const clientPage = await clientContext.newPage();
        await clientPage.goto('http://localhost:3000');

        // Nav to Booking
        await clientPage.getByText('Home Care & Repair').click();
        await clientPage.getByText('Plumber').click();
        await clientPage.locator('[data-testid="service-type-leak-repair"]').click();

        const chatInput = clientPage.locator('textarea[data-testid="smart-service-input-textarea"]');
        await expect(chatInput).toBeVisible({ timeout: 10000 });
        await chatInput.fill('Offline test booking');
        await chatInput.press('Enter');

        // Wait for Analysis & Book Now
        await expect(clientPage.locator('button[data-testid="book-now-button"]')).toBeEnabled({ timeout: 40000 });
        await clientPage.locator('button[data-testid="book-now-button"]').click();

        // Auth Modal Login
        const authModal = clientPage.locator('[data-testid="auth-modal-overlay"]');
        await authModal.getByTestId('email-input').fill(clientEmail);
        await authModal.getByTestId('password-input').fill(clientPassword);

        const submitBtn = authModal.getByTestId('submit-button');
        await submitBtn.click({ force: true });
        await expect(authModal).not.toBeVisible({ timeout: 15000 });

        // Wait a moment for login state
        await clientPage.waitForTimeout(1000);

        // ============================================
        // PHASE 2: Simulate Offline & Click Book
        // ============================================
        console.log('[PHASE 2] Simulating Offline...');
        await clientContext.setOffline(true);

        await clientPage.locator('button[data-testid="book-now-button"]').click();

        // Expect Error Message
        // "booking-error" element
        const bookingError = clientPage.locator('[data-testid="booking-error"]');
        await expect(bookingError).toBeVisible({ timeout: 10000 });
        console.log('[PHASE 2] Booking Error Verified');

        // Verify User Friendly Message ?
        // Usually "Network request failed" or "Failed to create booking"
        // Just visibility is enough for now.

        // ============================================
        // PHASE 3: Retry Online
        // ============================================
        console.log('[PHASE 3] Simulating Online...');
        await clientContext.setOffline(false);

        // Click again
        await clientPage.locator('button[data-testid="book-now-button"]').click();

        // Expect Success (Live Search)
        await expect(clientPage.getByTestId('live-search-screen')).toBeVisible({ timeout: 30000 });
        console.log('[PHASE 3] Booking recovered and succeeded');
    });
});
