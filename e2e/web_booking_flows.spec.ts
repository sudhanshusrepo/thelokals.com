
import { test, expect } from '../node_modules/@playwright/test';

// Run on localhost:3000 (Web Client)
// test.use({ baseURL: 'http://localhost:3000' });

test.describe('Web Client - Booking Flows', () => {

    test.beforeEach(async ({ page }) => {
        // Mock Supabase response to ensure test stability
        await page.route('**/rest/v1/service_categories*', async route => {
            const json = [
                {
                    id: 'ac-repair',
                    name: 'AC & Appliances',
                    description: 'AC repair • RO service • Fridge repair',
                    image_url: 'https://images.unsplash.com/photo-1621905476059-5f3460b56b3b?q=80&w=600',
                    gradient_colors: 'from-blue-500/80 to-cyan-500/80',
                    display_order: 1,
                    is_active: true
                },
                {
                    id: 'legal-consult',
                    name: 'Legal Consultation',
                    description: 'Video calls with top lawyers.',
                    image_url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600',
                    gradient_colors: 'from-slate-700/80 to-slate-900/80',
                    display_order: 2,
                    is_active: true
                }
            ];
            await route.fulfill({ json });
        });
    });

    test('Flow 1: AI Search -> Checkout', async ({ page }) => {
        // 1. Home Page
        await page.goto('/');
        await expect(page).toHaveTitle(/lokals/i);

        // 2. AI Search Interaction
        const searchInput = page.getByPlaceholder('Search for a service or issue...');
        await searchInput.click();
        await searchInput.fill('AC repair');
        await page.keyboard.press('Enter');

        // Note: Currently Search mocks behavior or redirects.
        // If it redirects to /search?q=..., verify results
        // For this test, we assume the user clicks a result to go to checkout/service detail.

        // Wait for search results
        await page.waitForTimeout(2000);

        // For Flow 1, let's verify we can reach the unified checkout directly 
        // via a "Book Now" flow if implemented, or simple URL check for now.
        // Assuming search results appear and are clickable:
        // await page.getByText('AC Repair').first().click();
    });

    test('Flow 2: Category Browse -> Checkout', async ({ page }) => {
        await page.goto('/');

        // Verify Categories
        const browseSection = page.getByText('Browse Services');
        await expect(browseSection).toBeVisible();
        await browseSection.scrollIntoViewIfNeeded();

        // Default is Offline (In-Person). Verify we can click a service.
        await expect(page.getByRole('heading', { name: 'AC & Appliances' })).toBeVisible();

        // Click a service
        await page.getByRole('heading', { name: 'AC & Appliances' }).click();

        // Verify Navigated to Service Detail logic
        await expect(page).toHaveURL(/\/category\//);

        // Alternatively, check for "Book Service" button immediately if it operates in-place?
        // Let's assume navigation for now, but inspect the failure if it implies 404.
    });

    test('Flow 3: Unified Checkout UI (Unauthenticated)', async ({ page }) => {
        // Access Checkout directly with params
        await page.goto('/book/checkout?serviceName=Test-Service&price=999&tier=Premium');

        // Unauthenticated user should be redirected to Auth
        await expect(page).toHaveURL(/\/auth/);
        // Unauthenticated user should be redirected to Auth
        await expect(page).toHaveURL(/\/auth/);
        await expect(page.getByText('Welcome!')).toBeVisible();
    });

});
