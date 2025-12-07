import { test, expect } from '../../fixtures/test-fixtures';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseAdminKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

test.describe('Live Booking E2E Flow', () => {
    test('Complete booking flow: Provider setup → Client booking → Provider acceptance', async ({ browser }) => {
        test.setTimeout(120000);

        // ============================================
        // PHASE 1: Provider Setup (Admin API)
        // ============================================
        const providerEmail = `provider_${Date.now()}@e2e.test`;
        const providerPassword = 'StrongPass123!';

        console.log(`[PHASE 1] Creating provider: ${providerEmail}`);

        const { data: providerAuthData, error: providerCreateError } = await supabaseAdmin.auth.admin.createUser({
            email: providerEmail,
            password: providerPassword,
            email_confirm: true
        });

        if (providerCreateError) throw new Error(`Provider creation failed: ${providerCreateError.message}`);
        const providerId = providerAuthData.user.id;

        console.log(`[PHASE 1] Provider created with ID: ${providerId}`);

        await supabaseAdmin.from('profiles').update({
            full_name: 'E2E Test Provider',
            registration_status: 'verified',
        }).eq('id', providerId);

        await supabaseAdmin.from('providers').upsert({
            id: providerId,
            service_radius: 5000,
            is_verified: true,
            is_active: true,
            location: 'POINT(-74.0060 40.7128)',
            availability_status: 'online',
            services: ['PLUMBER', 'plumber']
        });

        console.log(`[PHASE 1] Provider setup complete`);

        // ============================================
        // PHASE 2: Provider Login (UI)
        // ============================================
        const providerContext = await browser.newContext();
        const providerPage = await providerContext.newPage();

        console.log(`[PHASE 2] Logging in provider via UI`);

        await providerPage.goto('http://localhost:5173');
        await providerPage.getByRole('button', { name: 'Get Started' }).click();
        await providerPage.waitForTimeout(1000);

        const modal = providerPage.locator('.fixed.inset-0');
        const signInTab = modal.getByRole('button', { name: 'Sign In' }).first();
        if (await signInTab.isVisible()) {
            await signInTab.click();
            await providerPage.waitForTimeout(500);
        }

        await modal.getByPlaceholder('you@example.com').fill(providerEmail);
        await modal.getByPlaceholder('••••••••').fill(providerPassword);
        await modal.getByRole('button', { name: /sign in/i }).last().click();

        await expect(providerPage.getByText('Dashboard')).toBeVisible({ timeout: 15000 });
        console.log(`[PHASE 2] Provider logged in successfully`);

        // ============================================
        // PHASE 3: Client Setup & Booking
        // ============================================
        const clientEmail = `client_${Date.now()}@e2e.test`;
        const clientPassword = 'Password123!';

        console.log(`[PHASE 3] Creating client: ${clientEmail}`);

        const { data: clientAuthData, error: clientCreateError } = await supabaseAdmin.auth.admin.createUser({
            email: clientEmail,
            password: clientPassword,
            email_confirm: true
        });

        if (clientCreateError) throw new Error(`Client creation failed: ${clientCreateError.message}`);
        console.log(`[PHASE 3] Client created`);

        const clientContext = await browser.newContext();
        const clientPage = await clientContext.newPage();
        await clientPage.goto('http://localhost:3000');

        console.log(`[PHASE 3] Setting client auth session directly`);

        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
            email: clientEmail,
            password: clientPassword
        });

        if (sessionError || !sessionData.session) {
            throw new Error(`Failed to create client session: ${sessionError?.message}`);
        }

        await clientPage.evaluate((session) => {
            localStorage.setItem('sb-' + window.location.host.split('.')[0] + '-auth-token', JSON.stringify(session));
        }, sessionData.session);

        await clientPage.reload();
        await clientPage.waitForLoadState('networkidle');

        console.log(`[PHASE 3] Client authenticated, starting booking flow`);

        await clientPage.getByText('Home Care & Repair').click();
        await clientPage.waitForLoadState('networkidle');

        await clientPage.getByText('Plumber').click();
        await clientPage.waitForLoadState('networkidle');

        // Wait for textarea to be stable (it may re-render)
        const descriptionTextarea = clientPage.locator('textarea[name="description"]');
        await descriptionTextarea.waitFor({ state: 'attached', timeout: 5000 });
        await clientPage.waitForTimeout(1000); // Extra buffer for React render

        await descriptionTextarea.fill('Leaky faucet needs urgent repair');

        const addressInput = clientPage.locator('input[name="address"]');
        if (await addressInput.isVisible()) {
            await addressInput.fill('New York, NY');
        }

        await clientPage.click('button:has-text("Find Pro")');

        try {
            await expect(clientPage.getByText('Recommended Service Checklist')).toBeVisible({ timeout: 10000 });
            await clientPage.click('button:has-text("Confirm Booking")');
        } catch (e) {
            console.log('[PHASE 3] AI checklist not shown or skipped');
        }

        await expect(clientPage.getByText('Searching for nearby professionals')).toBeVisible({ timeout: 10000 });
        console.log(`[PHASE 3] Booking submitted, searching for providers`);

        // ============================================
        // PHASE 4: Provider Accepts Booking
        // ============================================
        console.log(`[PHASE 4] Switching to provider to accept booking`);

        await providerPage.bringToFront();
        await providerPage.goto('http://localhost:5173/bookings');

        await expect(providerPage.getByText('Leaky faucet')).toBeVisible({ timeout: 20000 });
        console.log(`[PHASE 4] Booking request visible to provider`);

        await providerPage.click('button:has-text("Accept")');
        console.log(`[PHASE 4] Provider accepted the booking`);

        // ============================================
        // PHASE 5: Verify Success
        // ============================================
        console.log(`[PHASE 5] Verifying booking success on client side`);

        await clientPage.bringToFront();
        await expect(clientPage.getByText('Provider Found')).toBeVisible({ timeout: 15000 });

        console.log(`[PHASE 5] ✅ END-TO-END TEST PASSED!`);
    });
});
