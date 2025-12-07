import { test, expect } from '../../fixtures/test-fixtures';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

test.describe('Live Booking Scenario: Newly Registered Provider', () => {

    test('should allow a new provider to register and accept a live booking', async ({ browser, testBooking }) => {
        // --- Phase 1: Provider Registration ---
        const providerContext = await browser.newContext();
        const providerPage = await providerContext.newPage();

        // Use a unique email
        const providerEmail = `provider_${Date.now()}@e2e.test`;
        const providerPassword = 'StrongPass123!';

        console.log(`Starting Provider Registration for ${providerEmail}`);

        // 1.1 Visit Provider Landing
        await providerPage.goto('http://localhost:5173');
        await expect(providerPage.getByText('Grow Your Business with')).toBeVisible();

        // 1.2 Sign Up
        await providerPage.getByRole('button', { name: 'Get Started' }).click();
        await providerPage.getByRole('button', { name: 'Sign Up' }).click();

        // Use placeholders matching AuthModal.tsx
        await providerPage.getByPlaceholder('Business or Personal Name').fill('New Provider');
        await providerPage.getByPlaceholder('you@example.com').fill(providerEmail);
        await providerPage.getByPlaceholder('••••••••').fill(providerPassword);

        await providerPage.click('button:has-text("Create Account")');

        // 1.3 Wait for potential redirect or toast
        await providerPage.waitForTimeout(3000);

        // 1.4 Authenticate Node.js Supabase Client to perform DB Setup (Admin simulation)
        // Login as the new provider to insert DB records
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: providerEmail,
            password: providerPassword
        });

        if (signInError) {
            console.error('Sign In Error:', signInError);
            throw new Error(`Test Setup Failed: Could not sign in provider to DB client: ${signInError.message}`);
        }

        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('User not found after login');
        const userId = userData.user.id;

        console.log(`Provider User ID: ${userId}. Setting up Provider Record in DB...`);

        // 1.5 DB Setup: Verify, Location, Service

        // Update Profile
        await supabase.from('profiles').update({
            full_name: 'E2E Provider',
            registration_status: 'verified',
        }).eq('id', userId);

        // Upsert Provider Record
        const { data: existingProvider } = await supabase.from('providers').select('id').eq('id', userId).maybeSingle();

        if (!existingProvider) {
            await supabase.from('providers').insert({
                id: userId,
                service_radius: 5000,
                is_verified: true,
                is_active: true,
                location: 'POINT(-74.0060 40.7128)', // New York
                availability_status: 'online'
            });
        } else {
            await supabase.from('providers').update({
                is_verified: true,
                is_active: true,
                location: 'POINT(-74.0060 40.7128)',
                availability_status: 'online'
            }).eq('id', userId);
        }

        // Add Service (Plumbing)
        const { data: cat } = await supabase.from('service_categories').select('id').eq('slug', 'plumbing').single();
        if (cat) {
            // Upsert Service
            const { error: servError } = await supabase.from('provider_services').upsert({
                provider_id: userId,
                category_id: cat.id,
                base_price: 50,
                is_active: true
            }, { onConflict: 'provider_id, category_id' });

            if (servError) console.log('Service upsert error:', servError.message);
        }

        // 1.6 Verify Dashboard access via UI
        await providerPage.goto('http://localhost:5173/dashboard');
        await expect(providerPage.getByText('Dashboard')).toBeVisible({ timeout: 15000 });

        // --- Phase 2: Client Booking ---
        console.log('--- Phase 2: Client Booking ---');
        const clientContext = await browser.newContext();
        const clientPage = await clientContext.newPage();

        await clientPage.goto('http://localhost:3000');

        // clientEmail/Password logic
        const clientEmail = `client_${Date.now()}@e2e.test`;
        const clientPassword = 'Password123!';

        // Register Client via DB calls (need to sign out provider first!)
        await supabase.auth.signOut();
        await supabase.auth.signUp({
            email: clientEmail,
            password: clientPassword
        });

        // UI Login
        await clientPage.getByRole('button', { name: 'Sign In' }).click();
        await clientPage.getByPlaceholder('Email').fill(clientEmail);
        await clientPage.getByPlaceholder('Password').fill(clientPassword);
        await clientPage.click('button:has-text("Sign In")');

        // 2.1 Book Service
        await clientPage.getByText('Plumbing').click(); // Select Category by text

        await clientPage.fill('textarea[name="description"]', 'Leaky faucet need help ASAP');

        // Address input logic
        const addressInput = clientPage.locator('input[name="address"]');
        if (await addressInput.isVisible()) {
            await addressInput.fill('New York, NY');
        }

        await clientPage.click('button:has-text("Find Pro")');

        // 2.2 Confirm Validation Checklist
        // If AI checklist appears
        try {
            await expect(clientPage.getByText('Recommended Service Checklist')).toBeVisible({ timeout: 10000 });
            await clientPage.click('button:has-text("Confirm Booking")');
        } catch (e) {
            console.log("Checklist skipped or unexpected UI state, trying to see if we search...", e);
        }

        // Wait for "Searching"
        await expect(clientPage.getByText('Searching for nearby professionals')).toBeVisible();

        // --- Phase 3: Provider Acceptance ---
        console.log('--- Phase 3: Provider Acceptance ---');

        // Switch to Provider
        await providerPage.bringToFront();

        // Check for Job Request
        // Navigate to bookings page
        await providerPage.goto('http://localhost:5173/bookings');

        // Verify Request Card appears
        // It might take a moment.
        // Look for "Leaky faucet" description if possible
        await expect(providerPage.getByText('Leaky faucet')).toBeVisible({ timeout: 20000 });

        // Accept
        await providerPage.click('button:has-text("Accept")');

        // --- Phase 4: Success ---
        console.log('--- Phase 4: Success ---');

        // Switch to Client
        await clientPage.bringToFront();

        // Verify Provider Found
        await expect(clientPage.getByText('Provider Found')).toBeVisible({ timeout: 15000 });

    });
});
