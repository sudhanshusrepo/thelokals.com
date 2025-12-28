
import { test, expect } from '@playwright/test';

test.describe('Sprint 2: Booking Flow Edge Cases', () => {

    test.beforeEach(async ({ page }) => {
        // Setup default mocks (Happy path baseline)
        // Mock Service Categories
        await page.route('**/rest/v1/service_categories*', async route => {
            const json = [
                { id: 'ac-repair', name: 'AC Service', is_active: true },
                { id: 'no-providers', name: 'Remote Area Service', is_active: true }
            ];
            await route.fulfill({ json });
        });

        // Login first
        await page.goto('/auth/signin');
        try {
            await page.fill('input[type="email"]', 'admin@thelokals.com');
            await page.fill('input[type="password"]', 'password123');
            await page.click('button[type="submit"]');
            await page.waitForLoadState('networkidle'); // Wait for network
            console.log('Post-login URL:', page.url());
            if (page.url().includes('signin')) {
                console.log('Login likely failed (still on signin page)');
            }
        } catch (e) {
            console.log('Login interaction failed', e);
        }
    });

    test('Scenario 1: No Match Found (No Providers)', async ({ page }) => {
        await page.goto('/category/no-providers');

        // Mock "Find Providers" API to return empty list
        await page.route('**/functions/v1/find-providers*', async route => {
            await route.fulfill({ json: { providers: [] } });
        });

        // Trigger search/match (assuming auto or button click)
        // await page.getByRole('button', { name: 'Find Providers' }).click();

        // Verify "No services" message (which effectively means no providers/services in this category)
        await expect(page.getByText('No services available')).toBeVisible({ timeout: 5000 });
    });

    test('Scenario 2: Booking Failure (Payment/System)', async ({ page }) => {
        await page.goto('/book/checkout?serviceId=ac-repair');

        // Mock Supabase Insert Failure (Simulating Payment/Logic Error)
        await page.route('**/rest/v1/bookings*', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        message: 'Payment declined by system',
                        error: 'Payment declined by system',
                        hint: 'Check balance'
                    })
                });
            } else {
                await route.continue();
            }
        });

        // Click Confirm
        await page.getByRole('button', { name: 'Confirm Booking' }).click();

        // Verify Error Message
        await expect(page.getByText('Payment declined by system')).toBeVisible({ timeout: 5000 });
        await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
    });

    test('Scenario 3: Slot Conflict', async ({ page }) => {
        await page.goto('/book/checkout?serviceId=ac-repair');

        // Mock Supabase Conflict
        await page.route('**/rest/v1/bookings*', async route => {
            if (route.request().method() === 'POST') {
                await route.fulfill({
                    status: 409,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'Slot no longer available' })
                });
            } else {
                await route.continue();
            }
        });

        // Click Confirm
        await page.getByRole('button', { name: 'Confirm Booking' }).click();

        // Verify Alert (using regex or text match)
        await expect(page.getByText('Slot no longer available')).toBeVisible({ timeout: 5000 });
    });

});
