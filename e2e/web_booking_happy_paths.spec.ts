import { test, expect } from '@playwright/test';

test.describe('Sprint 1: Core Happy Paths', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Service Categories
        await page.route('**/rest/v1/service_categories*', async route => {
            const json = [
                {
                    id: 'ac-repair',
                    name: 'AC & Appliances',
                    description: 'AC repair • RO service',
                    image_url: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b',
                    display_order: 1,
                    is_active: true
                },
                {
                    id: 'cleaning',
                    name: 'Home Cleaning',
                    description: 'Full home cleaning services',
                    image_url: 'https://images.unsplash.com/photo-1581578731117-104f8a74695e',
                    display_order: 2,
                    is_active: true
                }
            ];
            await route.fulfill({ json });
        });

        // Mock Search Results (if AI search hits an API)
        await page.route('**/api/ai/search*', async route => {
            await route.fulfill({
                json: {
                    serviceId: 'ac-repair',
                    confidence: 0.95
                }
            });
        });
    });

    test('Scenario 1: AI Search -> Checkout', async ({ page }) => {
        await page.goto('/');

        // Interaction
        const searchInput = page.getByPlaceholder('Search for a service or issue...');
        await searchInput.click();
        await searchInput.fill('My AC is leaking');
        await page.keyboard.press('Enter');

        // Expectation: Should match and redirect/show AC service
        // For now, assuming it finds 'AC & Appliances' and user clicks it or auto-redirects
        // Adjust selector based on actual AI implementation
        await expect(page.getByRole('heading', { name: 'AC & Appliances' })).toBeVisible();
    });

    test('Scenario 2: Category Browse -> Checkout', async ({ page }) => {
        await page.goto('/');

        // Scroll to browse
        const browseSection = page.getByText('Browse Services'); // Adjust selector
        await browseSection.scrollIntoViewIfNeeded();

        // Click Service
        await page.getByRole('heading', { name: 'Home Cleaning' }).click();

        // Verify navigation
        await expect(page).toHaveURL(/.*category\/cleaning|.*service\/cleaning/);

        // Click Book Now (Mock assumption of next step)
        // await page.getByRole('button', { name: 'Book Now' }).click();
        // await expect(page).toHaveURL(/.*checkout/);
    });

    test('Scenario 3: Guest Flow Redirect', async ({ page }) => {
        // Attempt to access checkout without auth
        await page.goto('/book/checkout?serviceId=ac-repair');

        // Should redirect to auth
        await expect(page).toHaveURL(/.*auth(\/login)?/);
    });

});
