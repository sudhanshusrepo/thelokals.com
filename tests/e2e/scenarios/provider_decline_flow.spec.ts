import { test, expect } from '../../fixtures/test-fixtures';
import { createClient } from '@supabase/supabase-js';

// env vars are picked up from .env or system
const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'placeholder';
// Local Admin Key (service_role) for creating test users
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';

const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

test.describe('Provider Decline Scenario', () => {
    test.setTimeout(120000);

    test('Full Lifecycle: Request -> Decline -> Cancelled', async ({ browser }) => {
        // ============================================
        // SETUP: Create Provider & Client
        // ============================================
        const providerEmail = `provider_decline_${Date.now()}@e2e.test`;
        const providerPassword = 'StrongPass123!';
        const clientEmail = `client_decline_${Date.now()}@e2e.test`;
        const clientPassword = 'Password123!';

        console.log(`[SETUP] Creating provider: ${providerEmail}`);
        const { data: providerAuth, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: providerEmail,
            password: providerPassword,
            email_confirm: true
        });
        if (createError || !providerAuth.user) {
            console.error('Provider creation failed:', createError);
            throw new Error('Failed to create provider user');
        }
        const providerId = providerAuth.user.id;

        // Setup Provider Profile & Service
        await supabaseAdmin.from('profiles').upsert({
            id: providerId,
            full_name: 'E2E Decline Provider',
            phone: '+919876543210',
            email: providerEmail
        });

        await supabaseAdmin.from('providers').upsert({
            id: providerId,
            full_name: 'E2E Decline Provider',
            phone: '+919876543210',
            email: providerEmail,
            category: 'Plumber',
            operating_location: 'POINT(-74.0060 40.7128)',
            service_radius_km: 5,
            is_verified: true,
            is_active: true,
            registration_completed: true,
            phone_verified: true,
            business_name: 'E2E Decline Services',
            description: 'Test provider for Decline testing'
        });

        // Ensure "Plumber" category exists
        await supabaseAdmin.from('service_categories').upsert({
            name: 'Plumber',
            group_name: 'Home Care & Repair',
            icon: '🔧',
            description: 'Fix plumbing issues'
        }, { onConflict: 'name' });

        console.log(`[SETUP] Creating client: ${clientEmail}`);
        const { data: clientAuth } = await supabaseAdmin.auth.admin.createUser({
            email: clientEmail,
            password: clientPassword,
            email_confirm: true
        });

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
        await providerPage.goto('http://localhost:5173/bookings');

        // ============================================
        // PHASE 2: Client Booking
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
        await chatInput.fill('Need checkup but expect decline');
        await chatInput.press('Enter');

        // Wait for Analysis & Book Now
        await expect(clientPage.locator('button[data-testid="book-now-button"]')).toBeEnabled({ timeout: 40000 });
        await clientPage.locator('button[data-testid="book-now-button"]').click();

        // Auth Modal Login
        const authModal = clientPage.locator('[data-testid="auth-modal-overlay"]');
        await expect(authModal).toBeVisible();
        await authModal.getByTestId('email-input').fill(clientEmail);
        await authModal.getByTestId('password-input').fill(clientPassword);

        const submitBtn = authModal.getByTestId('submit-button');
        await expect(submitBtn).toBeVisible();
        await submitBtn.click({ force: true });
        await expect(authModal).not.toBeVisible({ timeout: 15000 });

        // Finalize Booking
        await clientPage.waitForTimeout(1000);
        await clientPage.locator('button[data-testid="book-now-button"]').click();

        // Wait for Live Search
        await expect(clientPage.getByTestId('live-search-screen')).toBeVisible({ timeout: 30000 });
        console.log('[PHASE 2] Client waiting for provider...');

        // ============================================
        // PHASE 3: Provider Declines
        // ============================================
        await providerPage.bringToFront();
        // Check if request appeared, if not reload (Realtime fallback)
        try {
            await expect(providerPage.getByText('Plumber')).toBeVisible({ timeout: 10000 });
        } catch (e) {
            console.log('[PHASE 3] Request not found, reloading page...');
            await providerPage.reload();
            await expect(providerPage.getByText('Plumber')).toBeVisible({ timeout: 20000 });
        }

        // CLICK DECLINE (Directly from card, no need to open modal)
        // Verify both buttons exist
        await expect(providerPage.getByRole('button', { name: 'View & Accept' })).toBeVisible();

        const declineButton = providerPage.getByRole('button', { name: 'Decline' });
        await expect(declineButton).toBeVisible();
        await declineButton.click();
        // Confirm decline if there's a secondary confirmation
        const confirmDecline = providerPage.getByRole('button', { name: /confirm/i });
        if (await confirmDecline.isVisible()) {
            await confirmDecline.click();
        }


        console.log('[PHASE 3] Provider declined booking');

        // ============================================
        // PHASE 4: Client Verification (Declined)
        // ============================================
        await clientPage.bringToFront();
        // What does the client see?
        // Usually "Provider Busy" or "Request Declined" or "Searching for other providers..."
        // If single provider, it might fail to "No Providers Found".

        // Let's look for a text indicating failure/decline
        // Assuming the UI updates to "Declined" or "Cancelled"

        await expect(clientPage.getByText(/Declined|Busy|Cancelled|No providers/i)).toBeVisible({ timeout: 15000 });
        console.log('[PHASE 4] Client received decline status');
    });
});
