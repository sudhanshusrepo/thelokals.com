import { test, expect } from '../../fixtures/test-fixtures';
import { HomePage, ServiceRequestPage } from '../../page-objects/pages';

test.describe('Live Booking Cancellation', () => {
    let homePage: HomePage;
    let serviceRequestPage: ServiceRequestPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        serviceRequestPage = new ServiceRequestPage(page);
    });

    test('should allow user to cancel a requested booking', async ({ authenticatedPage: page, testBooking }) => {
        // 1. User initiates booking
        await homePage.goto();
        await homePage.selectCategory(testBooking.category);

        await serviceRequestPage.fillServiceRequest({
            description: 'Cancellation Test Booking',
            location: testBooking.location,
        });

        await serviceRequestPage.submitRequest();

        // Wait for AI Analysis and confirm
        await expect(serviceRequestPage.aiChecklistSection).toBeVisible({ timeout: 15000 });
        await serviceRequestPage.confirmBooking();

        // 2. Verify "Searching" state and "Cancel Booking" button presence
        await expect(page.locator('text=Finding a Provider...')).toBeVisible({ timeout: 10000 });
        const cancelButton = page.locator('button:has-text("Cancel Booking")');
        await expect(cancelButton).toBeVisible();

        // 3. Click Cancel
        await cancelButton.click();

        // 4. Verify Status Updates to Cancelled
        await expect(page.locator('text=Booking was cancelled.')).toBeVisible({ timeout: 5000 });

        // 5. Verify "Start New Booking" button
        const startNewButton = page.locator('button:has-text("Start New Booking")');
        await expect(startNewButton).toBeVisible();

        // 6. Click Start New Booking and verify reset
        await startNewButton.click();
        await expect(page.locator('h2:has-text("Step 1: Select Service")')).toBeVisible();
        // Note: The UI resets to Step 1 which has "Step 1: Select Service" in LiveBooking.tsx header
    });
});
