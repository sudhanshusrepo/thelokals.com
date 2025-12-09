import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Error Handling Regression', () => {

    test('Network Offline Handling', async ({ page, context }) => {
        await page.goto('/');

        // Go offline
        await context.setOffline(true);

        // Try to perform an action, e.g. load a category
        try {
            await page.getByText('Home Care & Repair').click({ timeout: 5000 });
        } catch (e) {
            // Expected timeout or error
        }

        // Check for UI indication of offline or graceful failure
        // ensure app doesn't crash to white screen
        const body = page.locator('body');
        await expect(body).toBeVisible();

        // Go online
        await context.setOffline(false);
        await page.reload();
        await expect(page.getByText('Home Care & Repair')).toBeVisible();
    });
});
