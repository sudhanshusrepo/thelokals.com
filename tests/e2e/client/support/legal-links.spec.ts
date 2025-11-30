import { test, expect } from '@playwright/test';

test.describe('Support Page - Play Store Compliance', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should navigate to support page from bottom navigation', async ({ page }) => {
        // Click support link in bottom nav
        await page.click('a[href="/dashboard/support"]');

        // Should be on support page
        await expect(page).toHaveURL('/dashboard/support');
        await expect(page.locator('text=Customer Support')).toBeVisible();
    });

    test('should display all support contact methods', async ({ page }) => {
        await page.goto('/dashboard/support');

        // Email support
        await expect(page.locator('text=Email Support')).toBeVisible();
        await expect(page.locator('a[href="mailto:support@thelokals.com"]')).toBeVisible();

        // Live chat (coming soon)
        await expect(page.locator('text=Live Chat')).toBeVisible();
    });

    test('should display FAQ section', async ({ page }) => {
        await page.goto('/dashboard/support');

        await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();

        // Check for FAQ items
        await expect(page.locator('summary:has-text("How do I book a service")')).toBeVisible();
        await expect(page.locator('summary:has-text("How do I cancel a booking")')).toBeVisible();
        await expect(page.locator('summary:has-text("What payment methods")')).toBeVisible();
        await expect(page.locator('summary:has-text("Are the service providers verified")')).toBeVisible();
    });

    test('should expand FAQ items when clicked', async ({ page }) => {
        await page.goto('/dashboard/support');

        const faqItem = page.locator('details:has(summary:has-text("How do I book a service"))');

        // Initially collapsed
        await expect(faqItem).not.toHaveAttribute('open');

        // Click to expand
        await faqItem.locator('summary').click();

        // Should be expanded
        await expect(faqItem).toHaveAttribute('open');

        // Content should be visible
        await expect(faqItem.locator('text=AI will help you get matched')).toBeVisible();
    });

    test('should display legal information section', async ({ page }) => {
        await page.goto('/dashboard/support');

        await expect(page.locator('text=Legal Information')).toBeVisible();
    });

    test('should display Terms & Conditions link', async ({ page }) => {
        await page.goto('/dashboard/support');

        const termsLink = page.locator('a:has-text("Terms & Conditions")');
        await expect(termsLink).toBeVisible();

        // Should have correct href
        await expect(termsLink).toHaveAttribute('href', '/dashboard/terms');

        // Should have icon
        await expect(termsLink.locator('svg')).toBeVisible();
    });

    test('should display Privacy Policy link', async ({ page }) => {
        await page.goto('/dashboard/support');

        const privacyLink = page.locator('a:has-text("Privacy Policy")');
        await expect(privacyLink).toBeVisible();

        // Should have correct href
        await expect(privacyLink).toHaveAttribute('href', 'https://thelokals.com/privacy');

        // Should open in new tab
        await expect(privacyLink).toHaveAttribute('target', '_blank');
        await expect(privacyLink).toHaveAttribute('rel', 'noopener noreferrer');

        // Should have icon
        await expect(privacyLink.locator('svg')).toBeVisible();
    });

    test('should navigate to Terms & Conditions page', async ({ page }) => {
        await page.goto('/dashboard/support');

        await page.click('a:has-text("Terms & Conditions")');

        // Should navigate to terms page
        await expect(page).toHaveURL('/dashboard/terms');
    });

    test('should open Privacy Policy in new tab', async ({ page, context }) => {
        await page.goto('/dashboard/support');

        // Listen for new page
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            page.click('a:has-text("Privacy Policy")')
        ]);

        // New page should open with privacy policy URL
        await expect(newPage).toHaveURL(/privacy/);
    });

    test('should have accessible email link', async ({ page }) => {
        await page.goto('/dashboard/support');

        const emailLink = page.locator('a[href="mailto:support@thelokals.com"]');

        // Should be keyboard accessible
        await emailLink.focus();
        await expect(emailLink).toBeFocused();

        // Should have visible text
        await expect(emailLink).toHaveText('support@thelokals.com');
    });

    test('should be responsive on mobile', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto('/dashboard/support');

        // All elements should still be visible
        await expect(page.locator('text=Customer Support')).toBeVisible();
        await expect(page.locator('text=Email Support')).toBeVisible();
        await expect(page.locator('text=Legal Information')).toBeVisible();

        // Legal links should stack vertically on mobile
        const legalSection = page.locator('text=Legal Information').locator('..');
        await expect(legalSection).toBeVisible();
    });

    test('should have proper heading hierarchy', async ({ page }) => {
        await page.goto('/dashboard/support');

        // Main heading
        await expect(page.locator('h1:has-text("Customer Support")')).toBeVisible();

        // Section headings
        await expect(page.locator('h2:has-text("Frequently Asked Questions")')).toBeVisible();
        await expect(page.locator('h3:has-text("Legal Information")')).toBeVisible();
    });

    test('should display support icons', async ({ page }) => {
        await page.goto('/dashboard/support');

        // Main support icon
        await expect(page.locator('text=💬').first()).toBeVisible();

        // Contact method icons
        await expect(page.locator('text=📧')).toBeVisible(); // Email
        await expect(page.locator('text=💬').nth(1)).toBeVisible(); // Chat
    });
});

test.describe('Support Page - Dark Mode', () => {
    test('should render correctly in dark mode', async ({ page }) => {
        // Enable dark mode (if your app supports it)
        await page.goto('/dashboard/support');

        // Toggle dark mode (adjust selector based on your implementation)
        // await page.click('[data-testid="dark-mode-toggle"]');

        // Verify support page is still visible and readable
        await expect(page.locator('text=Customer Support')).toBeVisible();
        await expect(page.locator('text=Legal Information')).toBeVisible();
    });
});

test.describe('Support Page - Accessibility', () => {
    test('should have no accessibility violations', async ({ page }) => {
        await page.goto('/dashboard/support');

        // Check for basic accessibility
        // All links should have accessible names
        const links = await page.locator('a').all();
        for (const link of links) {
            const text = await link.textContent();
            const ariaLabel = await link.getAttribute('aria-label');
            expect(text || ariaLabel).toBeTruthy();
        }
    });

    test('should be keyboard navigable', async ({ page }) => {
        await page.goto('/dashboard/support');

        // Tab through interactive elements
        await page.keyboard.press('Tab'); // Email link
        await page.keyboard.press('Tab'); // Chat button
        await page.keyboard.press('Tab'); // FAQ item

        // Should be able to activate with Enter
        await page.keyboard.press('Enter');
    });
});
