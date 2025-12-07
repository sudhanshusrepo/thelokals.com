import { test, expect } from '../../fixtures/test-fixtures';
import { createClient } from '@supabase/supabase-js';
import { HomePage, ServiceRequestPage } from '../../page-objects/pages';

// Initialize Supabase client for backend manipulation
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

test.describe('Full Live Booking Flow', () => {
    let homePage: HomePage;
    let serviceRequestPage: ServiceRequestPage;
    let bookingId: string;
    let providerId: string;

    test.beforeAll(async () => {
        // Create a test provider in the DB if not exists
        const { data: provider, error } = await supabase
            .from('providers')
            .select('id')
            .limit(1)
            .single();

        if (provider) {
            providerId = provider.id;
        } else {
            // Create a dummy provider user and profile/provider entry
            const email = `provider_${Date.now()}@test.com`;
            const { data: user, error: userError } = await supabase.auth.signUp({
                email,
                password: 'Provider@123456!',
            });

            if (userError || !user.user) {
                console.error('Failed to create test provider user:', userError);
                throw new Error('Failed to create test provider user');
            }

            const userId = user.user.id;

            // Create profile
            await supabase.from('profiles').insert({
                id: userId,
                email,
                role: 'provider',
                full_name: 'Test Provider',
            });

            // Create provider entry
            const { data: newProvider, error: providerError } = await supabase
                .from('providers')
                .insert({
                    id: userId,
                    service_radius: 50,
                    is_verified: true,
                    is_active: true
                })
                .select('id')
                .single();

            if (providerError) {
                console.error('Failed to create provider entry:', providerError);
                throw new Error('Failed to create provider entry');
            }

            providerId = newProvider.id;
            console.log(`Created test provider: ${providerId}`);
        }
    });

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        serviceRequestPage = new ServiceRequestPage(page);
    });

    test('should complete a full live booking lifecycle', async ({ authenticatedPage: page, testBooking }) => {
        // 1. User initiates booking
        await homePage.goto();
        await homePage.selectCategory(testBooking.category);

        await serviceRequestPage.fillServiceRequest({
            description: 'E2E Test Booking Request',
            location: testBooking.location,
        });

        await serviceRequestPage.submitRequest();

        // Wait for AI Analysis
        await expect(serviceRequestPage.aiChecklistSection).toBeVisible({ timeout: 15000 });

        // Confirm Booking (Start Live Search)
        await serviceRequestPage.confirmBooking();

        // Verify "Searching" state
        await expect(page.locator('text=Searching for nearby professionals')).toBeVisible({ timeout: 10000 });

        // 2. Backend: Find the booking
        // Wait a bit for DB propagation
        await page.waitForTimeout(2000);

        const { data: bookings } = await supabase
            .from('bookings')
            .select('id, client_id')
            .order('created_at', { ascending: false })
            .limit(1);

        if (!bookings || bookings.length === 0) {
            throw new Error('Booking not found in DB');
        }
        bookingId = bookings[0].id;
        console.log(`Booking created: ${bookingId}`);

        // 3. Backend: Simulate Provider Acceptance
        // We manually insert a live_booking_request or update the booking directly
        // For "Live" flow, usually a request is created.
        // Let's assume the system created requests. We'll accept one.

        if (providerId) {
            // Simulate Provider accepting
            // First, ensure there is a request or create one
            const { error: reqError } = await supabase
                .from('live_booking_requests')
                .upsert({
                    booking_id: bookingId,
                    provider_id: providerId,
                    status: 'ACCEPTED',
                    expires_at: new Date(Date.now() + 3600000).toISOString()
                });

            if (reqError) console.error('Error creating acceptance:', reqError);

            // Update booking status to CONFIRMED/IN_PROGRESS
            await supabase
                .from('bookings')
                .update({
                    status: 'CONFIRMED',
                    provider_id: providerId
                })
                .eq('id', bookingId);
        }

        // 4. Verify User UI updates to "Provider Found"
        // The UI should listen to realtime changes.
        // We might need to reload or wait for realtime trigger.
        await expect(page.locator('text=Provider Found')).toBeVisible({ timeout: 15000 });

        // 5. Backend: Simulate Provider Arrived / OTP Generation
        // Update status to IN_PROGRESS (Provider Arrived)
        await supabase
            .from('bookings')
            .update({ status: 'IN_PROGRESS' })
            .eq('id', bookingId);

        // Verify OTP is shown on User screen
        // (Assuming OTP is shown when status is IN_PROGRESS or just before)
        await expect(page.locator('[data-testid="booking-otp"]')).toBeVisible({ timeout: 10000 });
        const otpText = await page.locator('[data-testid="booking-otp"]').textContent();
        console.log(`OTP shown to user: ${otpText}`);

        // 6. Backend: Simulate Provider Verifying OTP
        // We'll just mark it verified in DB if there's a table, or just proceed to completion
        // Assuming 'booking_otp' table exists
        if (otpText) {
            await supabase
                .from('booking_otp')
                .update({
                    is_verified: true,
                    verified_at: new Date().toISOString()
                })
                .eq('booking_id', bookingId);
        }

        // 7. Backend: Simulate Job Completion
        await supabase
            .from('bookings')
            .update({
                status: 'COMPLETED',
                completed_at: new Date().toISOString(),
                final_cost: 150.00
            })
            .eq('id', bookingId);

        // 8. Verify User UI shows Rating Screen
        await expect(page.locator('text=Rate your experience')).toBeVisible({ timeout: 10000 });

        // 9. User submits rating
        await page.locator('[aria-label="5 stars"]').click();
        await page.fill('textarea[name="review"]', 'Great service, automated test!');
        await page.click('button:has-text("Submit")');

        // 10. Verify Success
        await expect(page.locator('text=Thank you')).toBeVisible();
    });
});
