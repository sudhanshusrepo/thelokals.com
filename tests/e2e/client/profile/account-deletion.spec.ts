import { test, expect } from '@playwright/test';

test.describe('Account Deletion - Play Store Compliance', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to home page
        await page.goto('/');

        // Sign in as test user
        await page.click('[data-testid="sign-in-button"]');
        await page.fill('[data-testid="email-input"]', 'test@thelokals.com');
        await page.fill('[data-testid="password-input"]', 'Test123!@#');
        await page.click('[data-testid="submit-button"]');

        // Wait for dashboard to load
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should display delete account button in profile', async ({ page }) => {
        // Navigate to profile
        await page.goto('/dashboard/profile');

        // Scroll to account management section
        await page.locator('text=Account Management').scrollIntoViewIfNeeded();

        // Verify delete account button is visible
        await expect(page.locator('text=Delete Account')).toBeVisible();

        // Verify button has destructive styling (red)
        const deleteButton = page.locator('button:has-text("Delete Account")');
        await expect(deleteButton).toHaveClass(/red/);
    });

    test('should show warning message on delete account button', async ({ page }) => {
        await page.goto('/dashboard/profile');

        // Check for warning text
        await expect(page.locator('text=Permanently delete your account and all data')).toBeVisible();
    });

    test('should show first confirmation dialog with strong warning', async ({ page }) => {
        await page.goto('/dashboard/profile');

        // Set up dialog handler
        let dialogShown = false;
        let dialogMessage = '';

        page.on('dialog', async dialog => {
            dialogShown = true;
            dialogMessage = dialog.message();
            await dialog.dismiss(); // Dismiss to test cancellation
        });

        // Click delete account button
        await page.click('button:has-text("Delete Account")');

        // Verify dialog was shown
        expect(dialogShown).toBe(true);
        expect(dialogMessage).toContain('WARNING');
        expect(dialogMessage).toContain('cannot be undone');
        expect(dialogMessage).toContain('permanently delete');
    });

    test('should cancel deletion when first confirmation is dismissed', async ({ page }) => {
        await page.goto('/dashboard/profile');

        page.on('dialog', async dialog => {
            await dialog.dismiss();
        });

        await page.click('button:has-text("Delete Account")');

        // Should still be on profile page
        await expect(page).toHaveURL('/dashboard/profile');

        // User should still be logged in
        await expect(page.locator('text=Profile')).toBeVisible();
    });

    test('should show second confirmation dialog after accepting first', async ({ page }) => {
        await page.goto('/dashboard/profile');

        let dialogCount = 0;
        const dialogMessages: string[] = [];

        page.on('dialog', async dialog => {
            dialogCount++;
            dialogMessages.push(dialog.message());

            if (dialogCount === 1) {
                await dialog.accept(); // Accept first confirmation
            } else {
                await dialog.dismiss(); // Dismiss second to test
            }
        });

        await page.click('button:has-text("Delete Account")');

        // Wait for dialogs to process
        await page.waitForTimeout(1000);

        // Should have shown 2 dialogs
        expect(dialogCount).toBe(2);
        expect(dialogMessages[1]).toContain('confirm one more time');
    });

    test('should complete deletion flow and logout user', async ({ page }) => {
        await page.goto('/dashboard/profile');

        let dialogCount = 0;
        let finalAlertShown = false;
        let finalAlertMessage = '';

        page.on('dialog', async dialog => {
            dialogCount++;

            if (dialogCount <= 2) {
                // Accept both confirmation dialogs
                await dialog.accept();
            } else {
                // Final success message
                finalAlertShown = true;
                finalAlertMessage = dialog.message();
                await dialog.accept();
            }
        });

        await page.click('button:has-text("Delete Account")');

        // Wait for deletion process
        await page.waitForTimeout(2000);

        // Should show success message
        expect(finalAlertShown).toBe(true);
        expect(finalAlertMessage).toContain('deletion request submitted');
        expect(finalAlertMessage).toContain('24-48 hours');

        // Should redirect to home page (logged out)
        await expect(page).toHaveURL('/');

        // Sign in button should be visible (user logged out)
        await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
    });

    test('should handle deletion error gracefully', async ({ page }) => {
        await page.goto('/dashboard/profile');

        // Mock API error
        await page.route('**/api/auth/signOut', route => {
            route.abort('failed');
        });

        let errorAlertShown = false;
        let errorMessage = '';

        page.on('dialog', async dialog => {
            if (dialog.message().includes('Failed to delete')) {
                errorAlertShown = true;
                errorMessage = dialog.message();
            }
            await dialog.accept();
        });

        await page.click('button:has-text("Delete Account")');

        // Wait for error
        await page.waitForTimeout(2000);

        // Should show error message
        expect(errorAlertShown).toBe(true);
        expect(errorMessage).toContain('Failed to delete account');
        expect(errorMessage).toContain('contact support');
    });

    test('should have accessible delete account button', async ({ page }) => {
        await page.goto('/dashboard/profile');

        const deleteButton = page.locator('button:has-text("Delete Account")');

        // Should be keyboard accessible
        await deleteButton.focus();
        await expect(deleteButton).toBeFocused();

        // Should have proper ARIA attributes
        const ariaLabel = await deleteButton.getAttribute('aria-label');
        expect(ariaLabel || await deleteButton.textContent()).toContain('Delete');
    });
});

test.describe('Logout Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.click('[data-testid="sign-in-button"]');
        await page.fill('[data-testid="email-input"]', 'test@thelokals.com');
        await page.fill('[data-testid="password-input"]', 'Test123!@#');
        await page.click('[data-testid="submit-button"]');
        await expect(page).toHaveURL(/\/dashboard/);
    });

    test('should display logout button in profile', async ({ page }) => {
        await page.goto('/dashboard/profile');
        await expect(page.locator('text=Logout')).toBeVisible();
    });

    test('should show confirmation dialog on logout', async ({ page }) => {
        await page.goto('/dashboard/profile');

        let dialogShown = false;
        page.on('dialog', async dialog => {
            dialogShown = true;
            expect(dialog.message()).toContain('Are you sure you want to logout');
            await dialog.dismiss();
        });

        await page.click('button:has-text("Logout")');
        expect(dialogShown).toBe(true);
    });

    test('should logout user and redirect to home', async ({ page }) => {
        await page.goto('/dashboard/profile');

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        await page.click('button:has-text("Logout")');

        // Should redirect to home
        await expect(page).toHaveURL('/');

        // Should show sign in button
        await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
    });

    test('should clear session after logout', async ({ page }) => {
        await page.goto('/dashboard/profile');

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL('/');

        // Try to access protected route
        await page.goto('/dashboard/bookings');

        // Should redirect to home or show auth modal
        await expect(page).toHaveURL('/');
    });
});
