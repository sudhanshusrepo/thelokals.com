import { test, expect } from '../../../fixtures/test-fixtures';

test.describe('Account Deletion - Play Store Compliance', () => {
    // authenticatedPage fixture automatically logs in a test user

    test('should show custom deletion modal', async ({ authenticatedPage: page }) => {
        await page.goto('/dashboard/profile');

        // Click delete account button
        await page.click('button:has-text("Delete Account")');

        // Verify custom modal is visible
        await expect(page.locator('text=Delete Account Permanently?')).toBeVisible();
        await expect(page.locator('text=Type "DELETE" to confirm')).toBeVisible();
        await expect(page.locator('input[placeholder="DELETE"]')).toBeVisible();

        // Confirm button should be disabled initially
        const confirmButton = page.locator('button:has-text("Confirm Delete")');
        await expect(confirmButton).toBeDisabled();
    });

    test('should enable confirm button only when DELETE is typed', async ({ authenticatedPage: page }) => {
        await page.goto('/dashboard/profile');
        await page.click('button:has-text("Delete Account")');

        const confirmButton = page.locator('button:has-text("Confirm Delete")');
        const input = page.locator('input[placeholder="DELETE"]');

        // Type incorrect text
        await input.fill('DEL');
        await expect(confirmButton).toBeDisabled();

        // Type correct text
        await input.fill('DELETE');
        await expect(confirmButton).toBeEnabled();
    });

    test('should cancel deletion via modal cancel button', async ({ authenticatedPage: page }) => {
        await page.goto('/dashboard/profile');
        await page.click('button:has-text("Delete Account")');

        // Click cancel in modal
        await page.click('button:has-text("Cancel")');

        // Modal should close
        await expect(page.locator('text=Delete Account Permanently?')).not.toBeVisible();

        // User should still be logged in on profile page
        await expect(page).toHaveURL('/dashboard/profile');
        await expect(page.locator('text=Profile')).toBeVisible();
    });

    test('should complete deletion flow and logout user', async ({ authenticatedPage: page }) => {
        await page.goto('/dashboard/profile');

        await page.click('button:has-text("Delete Account")');

        // Fill confirmation
        await page.locator('input[placeholder="DELETE"]').fill('DELETE');

        // Click confirm
        await page.click('button:has-text("Confirm Delete")');

        // Should show processing toast/state (checking exact text might be flaky, checking for disappearance of modal or verify redirect)
        // Implementation shows toast then redirects

        // Wait for deletion process and redirect (4s safety)
        await page.waitForTimeout(4000);

        // Should redirect to home page (logged out)
        await expect(page).toHaveURL('/');

        // Sign in button should be visible (user logged out)
        await expect(page.locator('[data-testid="sign-in-button"]')).toBeVisible();
    });

    test('should handle deletion error gracefully', async ({ authenticatedPage: page }) => {
        await page.goto('/dashboard/profile');

        // Mock API error for signOut which is called at the end
        await page.route('**/auth/v1/logout', route => {
            route.abort('failed');
        });

        await page.click('button:has-text("Delete Account")');
        await page.locator('input[placeholder="DELETE"]').fill('DELETE');
        await page.click('button:has-text("Confirm Delete")');

        // Wait for error toast
        await expect(page.locator('text=Failed to delete account')).toBeVisible({ timeout: 10000 });
    });

    test('should have accessible delete account button', async ({ authenticatedPage: page }) => {
        await page.goto('/dashboard/profile');

        const deleteButton = page.locator('button:has-text("Delete Account")');

        // Should be keyboard accessible
        await deleteButton.focus();
        await expect(deleteButton).toBeFocused();

        // Should have proper ARIA attributes or accessible text
        const text = await deleteButton.textContent();
        expect(text).toContain('Delete Account');
    });
});

test.describe('Logout Functionality', () => {
    // We use authenticatedPage so we are already logged in

    test('should display logout button in profile', async ({ authenticatedPage: page }) => {
        await page.goto('/dashboard/profile');
        await expect(page.locator('text=Logout')).toBeVisible();
    });

    test('should show confirmation dialog on logout', async ({ authenticatedPage: page }) => {
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

    test('should logout user and redirect to home', async ({ authenticatedPage: page }) => {
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

    test('should clear session after logout', async ({ authenticatedPage: page }) => {
        await page.goto('/dashboard/profile');

        page.on('dialog', async dialog => {
            await dialog.accept();
        });

        await page.click('button:has-text("Logout")');
        await expect(page).toHaveURL('/');

        // Try to access protected route which usually redirects to home or login
        await page.goto('/dashboard/bookings');

        // Should redirect to home or show auth modal (implementation dependent, but definitely not bookings)
        // Assuming home redirect
        await expect(page).toHaveURL('/');
    });
});
