import { test, expect } from '../../fixtures/test-fixtures';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
console.log('DEBUG: Keys:', { url: supabaseUrl, keyLength: envKey?.length, keyStart: envKey?.substring(0, 5) });
const supabaseAdminKey = envKey || 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'; // Fallback for local testing
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

        // Setup Provider Profile & Service
        await supabaseAdmin.from('profiles').update({
            full_name: 'E2E Provider',
            registration_status: 'verified',
        }).eq('id', providerId);

        await supabaseAdmin.from('providers').upsert({
            id: providerId,
            service_radius: 5000,
            is_verified: true,
            is_active: true,
            location: 'POINT(-74.0060 40.7128)', // NYC
            services: ['PLUMBER', 'plumber']
        });

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

        // Wait for "Booking Request Sent" or "Live Search Screen"
        await expect(clientPage.getByTestId('live-search-screen')).toBeVisible({ timeout: 20000 });
        await expect(clientPage.getByText(/Searching for/i).first()).toBeVisible();
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
        // Navigate to details if not auto-redirected (BookingRequestsPage logic might just refresh list)
        // Since we accepted, it should be in "ACCEPTED" tab or we navigate to details.
        // Let's assume we need to click "Go to Job" or similar if still on requests page.
        // Or if we implemented auto-nav:

        // Based on my implementation: "navigate(`/booking/${requestId}`);" happens on Accept, but wait, 
        // in my last edit to BookingRequestsPage.tsx I commented out navigate!
        // " // navigate(`/booking/${request.booking_id}`); // Navigate to details"
        // And refreshed list. So requests list should show "ACCEPTED" status and "Go to Job".

        await providerPage.getByRole('button', { name: 'Accepted' }).click(); // Filter tab
        await providerPage.getByRole('button', { name: 'Go to Job' }).click();

        // Now on BookingDetailsPage
        await expect(providerPage.getByText("I'm on my way")).toBeVisible();
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
