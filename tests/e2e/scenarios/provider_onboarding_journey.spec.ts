import { test, expect } from '@playwright/test';
import { supabase } from '@thelocals/core/services/supabase';

const TEST_PROVIDER_EMAIL = `provider-${Date.now()}@test.com`;
const TEST_PROVIDER_PHONE = '9876543210';
const TEST_ADMIN_EMAIL = 'admin@lokals.com';

test.describe('Provider Onboarding and Approval Journey', () => {
    let providerId: string;
    let adminId: string;

    test.beforeAll(async () => {
        // Setup: Create admin user if not exists
        const { data: adminData } = await supabase.auth.admin.listUsers();
        const existingAdmin = adminData?.users.find(u => u.email === TEST_ADMIN_EMAIL);

        if (existingAdmin) {
            adminId = existingAdmin.id;
        } else {
            const { data, error } = await supabase.auth.admin.createUser({
                email: TEST_ADMIN_EMAIL,
                password: 'admin123',
                email_confirm: true
            });
            if (error) throw error;
            adminId = data.user.id;

            // Set admin role
            await supabase.from('users').upsert({
                id: adminId,
                email: TEST_ADMIN_EMAIL,
                role: 'admin'
            });
        }
    });

    test('Complete provider journey: signup → onboarding → approval → booking', async ({ page, context }) => {
        // Step 1: Provider Signup
        await page.goto('http://localhost:3001');
        await page.click('text=Get Started');

        // Fill phone auth (simplified - assumes phone auth is implemented)
        await page.fill('input[placeholder*="phone"]', TEST_PROVIDER_PHONE);
        await page.click('button:has-text("Continue")');

        // Mock OTP verification
        await page.fill('input[placeholder*="OTP"]', '123456');
        await page.click('button:has-text("Verify")');

        // Step 2: Onboarding - Welcome
        await expect(page.locator('text=Welcome to lokals')).toBeVisible();
        await page.click('button:has-text("Let\'s Get Started")');

        // Step 3: Personal Information
        await page.fill('input[placeholder*="full name"]', 'Test Provider');
        await page.fill('input[type="tel"]', TEST_PROVIDER_PHONE);
        await page.fill('input[type="email"]', TEST_PROVIDER_EMAIL);
        await page.click('button:has-text("Continue")');

        // Step 4: Professional Details
        await page.click('button:has-text("Plumber")');
        await page.fill('input[placeholder*="experience"]', '5');
        await page.fill('input[placeholder*="Service Area"]', 'Indiranagar, Bangalore');
        await page.click('button:has-text("Continue")');

        // Step 5: Documents (mock upload)
        // In real test, would upload actual files
        await page.click('button:has-text("Continue")');

        // Step 6: Banking Details
        await page.fill('input[placeholder*="Account Holder"]', 'Test Provider');
        await page.fill('input[placeholder*="Account Number"]', '1234567890');
        await page.fill('input[placeholder*="IFSC"]', 'SBIN0001234');
        await page.click('button:has-text("Continue")');

        // Step 7: Review and Submit
        await expect(page.locator('text=Almost There')).toBeVisible();
        await page.click('button:has-text("Submit Application")');

        // Should redirect to verification-pending
        await expect(page).toHaveURL(/verification-pending/);
        await expect(page.locator('text=Application Under Review')).toBeVisible();

        // Get provider ID from database
        const { data: providerData } = await supabase
            .from('providers')
            .select('id')
            .eq('email', TEST_PROVIDER_EMAIL)
            .single();

        providerId = providerData?.id;
        expect(providerId).toBeTruthy();

        // Step 8: Admin Approval
        // Open admin dashboard in new page
        const adminPage = await context.newPage();
        await adminPage.goto('http://localhost:3002/providers');

        // Admin login (simplified)
        await adminPage.fill('input[type="email"]', TEST_ADMIN_EMAIL);
        await adminPage.fill('input[type="password"]', 'admin123');
        await adminPage.click('button:has-text("Sign In")');

        // Find provider in queue
        await expect(adminPage.locator(`text=${TEST_PROVIDER_EMAIL}`)).toBeVisible();

        // Approve provider
        await adminPage.click(`button:has-text("Approve")`);

        // Verify approval in database
        const { data: approvedProvider } = await supabase
            .from('providers')
            .select('verification_status')
            .eq('id', providerId)
            .single();

        expect(approvedProvider?.verification_status).toBe('approved');

        // Step 9: Provider sees approval notification
        // Real-time update should trigger on provider page
        await page.waitForTimeout(2000); // Wait for real-time update
        await expect(page.locator('text=Congratulations')).toBeVisible();

        // Auto-redirect to dashboard
        await page.waitForURL(/dashboard/, { timeout: 5000 });
        await expect(page.locator('text=Dashboard')).toBeVisible();

        // Step 10: Verify provider receives booking requests
        // Create a test booking
        const { data: booking } = await supabase.from('bookings').insert({
            customer_id: adminId, // Use admin as customer for test
            service_category: 'Plumber',
            location: 'POINT(77.6412 12.9716)', // Bangalore coordinates
            status: 'PENDING'
        }).select().single();

        // Verify provider received booking request
        const { data: bookingRequest } = await supabase
            .from('live_booking_requests')
            .select('*')
            .eq('booking_id', booking.id)
            .eq('provider_id', providerId)
            .single();

        expect(bookingRequest).toBeTruthy();
        expect(bookingRequest.status).toBe('PENDING');

        // Cleanup
        await adminPage.close();
    });

    test.afterAll(async () => {
        // Cleanup: Delete test provider
        if (providerId) {
            await supabase.from('providers').delete().eq('id', providerId);
            await supabase.auth.admin.deleteUser(providerId);
        }
    });
});
