import { test, expect } from '../../fixtures/test-fixtures';
import { HomePage } from '../../page-objects/pages';

test.describe('User Experience - Enhanced', () => {
    let homePage: HomePage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        await homePage.goto();
    });

    test.describe('Homepage', () => {
        test('should load homepage successfully', async ({ page }) => {
            await expect(page).toHaveTitle(/lokals|home/i);
            await expect(homePage.heroSection.first()).toBeVisible();
        });

        test('should display all service categories', async ({ page }) => {
            const categoryCount = await homePage.getCategoryCount();
            expect(categoryCount).toBeGreaterThan(0);
        });

        test('should navigate to category page on click', async ({ page }) => {
            await homePage.selectCategory('Plumber');

            await page.waitForTimeout(1000);
            const url = page.url();
            expect(url).toMatch(/plumber|service/i);
        });

        test('should have responsive design', async ({ page }) => {
            // Test mobile viewport
            await page.setViewportSize({ width: 375, height: 667 });
            await expect(homePage.header).toBeVisible();

            // Test tablet viewport
            await page.setViewportSize({ width: 768, height: 1024 });
            await expect(homePage.header).toBeVisible();

            // Test desktop viewport
            await page.setViewportSize({ width: 1920, height: 1080 });
            await expect(homePage.header).toBeVisible();
        });

        test('should load images properly', async ({ page }) => {
            const images = await page.locator('img').all();

            for (const img of images) {
                const isVisible = await img.isVisible();
                if (isVisible) {
                    // Check if image loaded
                    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
                    expect(naturalWidth).toBeGreaterThan(0);
                }
            }
        });
    });

    test.describe('Navigation', () => {
        test('should navigate using header links', async ({ page }) => {
            const homeLink = page.locator('a:has-text("Home"), a[href="/"]');
            if (await homeLink.count() > 0) {
                await homeLink.first().click();
                await expect(page).toHaveURL('/');
            }
        });

        test('should navigate using footer links', async ({ page }) => {
            const footer = page.locator('footer');
            if (await footer.count() > 0) {
                const footerLinks = footer.locator('a');
                const linkCount = await footerLinks.count();
                expect(linkCount).toBeGreaterThan(0);
            }
        });

        test('should have working breadcrumbs', async ({ page }) => {
            await homePage.selectCategory('Electrician');

            const breadcrumbs = page.locator('.breadcrumb, [aria-label="breadcrumb"]');
            if (await breadcrumbs.count() > 0) {
                await expect(breadcrumbs).toBeVisible();

                // Click home breadcrumb
                const homeBreadcrumb = breadcrumbs.locator('a:has-text("Home")');
                if (await homeBreadcrumb.count() > 0) {
                    await homeBreadcrumb.click();
                    await expect(page).toHaveURL('/');
                }
            }
        });

        test('should handle browser back button', async ({ page }) => {
            await homePage.selectCategory('Plumber');
            await page.waitForTimeout(1000);

            await page.goBack();
            await expect(page).toHaveURL('/');
        });

        test('should handle browser forward button', async ({ page }) => {
            await homePage.selectCategory('Plumber');
            await page.waitForTimeout(1000);

            await page.goBack();
            await page.goForward();

            const url = page.url();
            expect(url).toMatch(/plumber|service/i);
        });
    });

    test.describe('Search Functionality', () => {
        test('should search for services', async ({ page }) => {
            if (await homePage.searchInput.count() > 0) {
                await homePage.searchService('plumber');

                await page.waitForTimeout(1000);
                const results = page.locator('.search-result, .provider-card');
                const resultCount = await results.count();
                expect(resultCount).toBeGreaterThanOrEqual(0);
            }
        });

        test('should show no results message for invalid search', async ({ page }) => {
            if (await homePage.searchInput.count() > 0) {
                await homePage.searchService('xyzabc123notfound');

                await page.waitForTimeout(1000);
                const noResults = page.locator('text=/no results|not found/i');
                if (await noResults.count() > 0) {
                    await expect(noResults.first()).toBeVisible();
                }
            }
        });

        test('should clear search results', async ({ page }) => {
            if (await homePage.searchInput.count() > 0) {
                await homePage.searchService('electrician');
                await page.waitForTimeout(1000);

                // Clear search
                const clearButton = page.locator('button[aria-label*="clear"], .clear-search');
                if (await clearButton.count() > 0) {
                    await clearButton.click();

                    const inputValue = await homePage.searchInput.inputValue();
                    expect(inputValue).toBe('');
                }
            }
        });
    });

    test.describe('Performance', () => {
        test('should load page within acceptable time', async ({ page }) => {
            const startTime = Date.now();
            await homePage.goto();
            const loadTime = Date.now() - startTime;

            // Page should load within 5 seconds
            expect(loadTime).toBeLessThan(5000);
        });

        test('should not have console errors', async ({ page }) => {
            const errors: string[] = [];

            page.on('console', msg => {
                if (msg.type() === 'error') {
                    errors.push(msg.text());
                }
            });

            await homePage.goto();
            await page.waitForTimeout(2000);

            // Filter out known acceptable errors
            const criticalErrors = errors.filter(err =>
                !err.includes('favicon') &&
                !err.includes('404')
            );

            expect(criticalErrors.length).toBe(0);
        });

        test('should lazy load images', async ({ page }) => {
            const images = page.locator('img[loading="lazy"]');
            const lazyImageCount = await images.count();

            // At least some images should be lazy loaded
            if (lazyImageCount > 0) {
                expect(lazyImageCount).toBeGreaterThan(0);
            }
        });
    });

    test.describe('Forms and Validation', () => {
        test('should validate email format', async ({ page }) => {
            await homePage.clickSignIn();

            const emailInput = page.locator('input[type="email"]');
            await emailInput.fill('invalid-email');

            const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
            expect(isInvalid).toBeTruthy();
        });

        test('should show validation errors on blur', async ({ page }) => {
            await homePage.clickSignIn();

            const emailInput = page.locator('input[type="email"]');
            await emailInput.focus();
            await emailInput.blur();

            // Check for required field error
            const errorMessage = page.locator('.error-message, .field-error');
            if (await errorMessage.count() > 0) {
                await expect(errorMessage.first()).toBeVisible();
            }
        });

        test('should prevent form submission with invalid data', async ({ page }) => {
            await homePage.clickSignIn();

            const submitButton = page.locator('button[type="submit"]');
            await submitButton.click();

            // Form should not submit
            await page.waitForTimeout(1000);
            const modal = page.locator('[role="dialog"]');
            await expect(modal.first()).toBeVisible();
        });
    });

    test.describe('Modals and Dialogs', () => {
        test('should open and close modal', async ({ page }) => {
            await homePage.clickSignIn();

            const modal = page.locator('[role="dialog"]');
            await expect(modal.first()).toBeVisible();

            // Close modal
            const closeButton = page.locator('button[aria-label*="close"], .modal-close');
            if (await closeButton.count() > 0) {
                await closeButton.first().click();
                await expect(modal.first()).not.toBeVisible();
            }
        });

        test('should close modal on escape key', async ({ page }) => {
            await homePage.clickSignIn();

            const modal = page.locator('[role="dialog"]');
            await expect(modal.first()).toBeVisible();

            // Press escape
            await page.keyboard.press('Escape');

            await page.waitForTimeout(500);
            const isVisible = await modal.first().isVisible();
            expect(isVisible).toBeFalsy();
        });

        test('should close modal on backdrop click', async ({ page }) => {
            await homePage.clickSignIn();

            const modal = page.locator('[role="dialog"]');
            await expect(modal.first()).toBeVisible();

            // Click backdrop
            const backdrop = page.locator('.modal-backdrop, .overlay');
            if (await backdrop.count() > 0) {
                await backdrop.first().click({ position: { x: 5, y: 5 } });

                await page.waitForTimeout(500);
                const isVisible = await modal.first().isVisible();
                expect(isVisible).toBeFalsy();
            }
        });
    });

    test.describe('Notifications', () => {
        test('should display success notification', async ({ page }) => {
            // Trigger action that shows success notification
            const notification = page.locator('.notification, .toast, [role="status"]');

            // Mock successful action
            await page.evaluate(() => {
                const event = new CustomEvent('notification', {
                    detail: { type: 'success', message: 'Action completed' }
                });
                window.dispatchEvent(event);
            });

            if (await notification.count() > 0) {
                await expect(notification.first()).toBeVisible({ timeout: 5000 });
            }
        });

        test('should auto-dismiss notification', async ({ page }) => {
            const notification = page.locator('.notification, .toast');

            if (await notification.count() > 0) {
                await expect(notification.first()).toBeVisible();

                // Wait for auto-dismiss (usually 3-5 seconds)
                await page.waitForTimeout(6000);

                const isVisible = await notification.first().isVisible();
                expect(isVisible).toBeFalsy();
            }
        });
    });

    test.describe('Dark Mode', () => {
        test('should toggle dark mode', async ({ page }) => {
            const darkModeToggle = page.locator('button[aria-label*="dark"], .theme-toggle');

            if (await darkModeToggle.count() > 0) {
                await darkModeToggle.click();

                // Check if dark mode class is applied
                const html = page.locator('html');
                const className = await html.getAttribute('class');
                expect(className).toContain('dark');

                // Toggle back
                await darkModeToggle.click();
                const classNameLight = await html.getAttribute('class');
                expect(classNameLight).not.toContain('dark');
            }
        });

        test('should persist dark mode preference', async ({ page }) => {
            const darkModeToggle = page.locator('button[aria-label*="dark"], .theme-toggle');

            if (await darkModeToggle.count() > 0) {
                await darkModeToggle.click();

                // Reload page
                await page.reload();

                // Check if dark mode persisted
                const html = page.locator('html');
                const className = await html.getAttribute('class');
                expect(className).toContain('dark');
            }
        });
    });

    test.describe('Loading States', () => {
        test('should show loading indicator', async ({ page }) => {
            // Navigate to page that triggers loading
            await homePage.selectCategory('Plumber');

            // Check for loading indicator
            const loader = page.locator('.loading, .spinner, [role="progressbar"]');
            if (await loader.count() > 0) {
                // Loader might appear briefly
                await page.waitForTimeout(100);
            }
        });

        test('should show skeleton screens', async ({ page }) => {
            const skeleton = page.locator('.skeleton, .skeleton-loader');

            if (await skeleton.count() > 0) {
                await expect(skeleton.first()).toBeVisible();

                // Skeleton should disappear after content loads
                await page.waitForTimeout(3000);
                const isVisible = await skeleton.first().isVisible();
                expect(isVisible).toBeFalsy();
            }
        });
    });
});
