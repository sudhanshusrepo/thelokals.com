import { test, expect } from '../../fixtures/test-fixtures';

test.describe('Form Validation Regression', () => {

    test('Booking Request Form Required Fields', async ({ page }) => {
        await page.goto('/');
        // Simulate navigating to a booking form
        // For example clicking a Category
        await page.getByText('Home Care & Repair').click();
        await page.getByText('Plumber').click();
        await page.locator('[data-testid="service-type-leak-repair"]').click();

        // Try to submit without details (if there's a submit button immediately, or check chat input)
        const chatInput = page.locator('textarea[data-testid="smart-service-input-textarea"]');
        await expect(chatInput).toBeVisible();

        // Case 1: Empty Input
        await chatInput.fill('   ');
        await chatInput.press('Enter');
        // Expect warning toast
        await expect(page.getByText('Please provide more details')).toBeVisible();

        // Case 2: Too short input
        await chatInput.fill('Hi help'); // < 10 chars
        await chatInput.press('Enter');
        await expect(page.getByText('Please provide more details (at least 10 characters).')).toBeVisible();

        // Case 3: Valid input proceeds (but we stop here for robustness test)
        await chatInput.fill('This is a valid request string > 10 chars');
        await chatInput.press('Enter');
        // Should show "Thinking..." or "Processing..."
        // Or wait for overlay
        await expect(page.locator('text=Processing input...')).toBeVisible();
    });
});
