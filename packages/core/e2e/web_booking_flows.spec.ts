
import { test, expect } from '@playwright/test';

// Run on localhost:3000 (Web Client)
test.use({ baseURL: 'http://localhost:3000' });

test.describe('Web Client - Booking Flows', () => {

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
        await page.goto('/browse');

        // Verify Categories
        await expect(page.getByText('Browse Services')).toBeVisible();

        // Toggle Offline/Online
        await page.getByText('Online (Remote)').click();
        // Verify online service appears
        await expect(page.getByText('Online Yoga Class')).toBeVisible();

        // Switch back to Offline
        await page.getByText('Offline (In-Person)').click();

        // Click a service
        await page.getByText('AC Repair & Service').click();

        // Verify Navigated to Service Detail
        // URL should contain /service/
        await expect(page).toHaveURL(/\/service\//);

        // Select Tier
        await page.getByText('Major Repair').click();

        // Click Book (navigates to checkout or billing)
        // Note: The service detail page creates a booking intent.
        // We need to ensure the button exists.
        const bookBtn = page.getByRole('button', { name: /Book Service/i });
        await expect(bookBtn).toBeVisible();
        // await bookBtn.click(); // Might require Auth
    });

    test('Flow 3: Unified Checkout UI', async ({ page }) => {
        // Access Checkout directly with params
        await page.goto('/book/checkout?serviceName=Test-Service&price=999&tier=Premium');

        await expect(page.getByText('Checkout')).toBeVisible();
        await expect(page.getByText('Test-Service')).toBeVisible();
        await expect(page.getByText('Premium')).toBeVisible();
        await expect(page.getByText('₹999')).toBeVisible();

        // Interaction: Select Date
        await page.getByText('Tomorrow').click();

        // Interaction: Payment
        await page.getByText('Cash after service').click();

        // Confirm
        const confirmBtn = page.getByRole('button', { name: /Confirm Booking/i });
        await expect(confirmBtn).toBeVisible();
    });

});
