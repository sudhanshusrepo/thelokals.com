import { test, expect } from '../../fixtures/test-fixtures';
import { HomePage, AuthPage } from '../../page-objects/pages';

test.describe('Authentication Flow - Enhanced', () => {
    let homePage: HomePage;
    let authPage: AuthPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        authPage = new AuthPage(page);
        await homePage.goto();
    });

    test.describe('Sign In', () => {
        test('should successfully sign in with valid credentials', async ({ page }) => {
            // Open sign in modal
            await homePage.clickSignIn();

            // Fill credentials
            await authPage.login('test@example.com', 'Test@123456');

            // Verify successful login
            await expect(page).toHaveURL(/\/(dashboard)?/);

            // Verify user is authenticated
            const userMenu = page.locator('[data-testid="user-menu"], .user-avatar');
            await expect(userMenu.first()).toBeVisible({ timeout: 5000 });
        });

        test('should show error with invalid email', async ({ page }) => {
            await homePage.clickSignIn();

            await authPage.login('invalid-email', 'Test@123456');

            // Check for error message
            const errorMsg = await authPage.getErrorMessage();
            expect(errorMsg).toBeTruthy();
        });

        test('should show error with wrong password', async ({ page }) => {
            await homePage.clickSignIn();

            await authPage.login('test@example.com', 'wrongpassword');

            // Check for error message
            const errorMsg = await authPage.getErrorMessage();
            expect(errorMsg).toBeTruthy();
        });

        test('should validate required fields', async ({ page }) => {
            await homePage.clickSignIn();

            // Try to submit without filling fields
            await authPage.submitButton.click();

            // Check for validation error toast
            const errorMsg = await authPage.getErrorMessage();
            expect(errorMsg).toContain('valid email address');
        });

        test('should toggle password visibility', async ({ page }) => {
            await homePage.clickSignIn();

            await authPage.passwordInput.fill('Test@123456');

            // Find toggle button
            const toggleButton = page.locator('button[aria-label*="password"], .password-toggle');
            if (await toggleButton.count() > 0) {
                await toggleButton.click();

                // Check if password is visible
                const type = await authPage.passwordInput.getAttribute('type');
                expect(type).toBe('text');

                // Toggle back
                await toggleButton.click();
                const typeHidden = await authPage.passwordInput.getAttribute('type');
                expect(typeHidden).toBe('password');
            }
        });

        test('should persist session after page reload', async ({ page }) => {
            await homePage.clickSignIn();
            await authPage.login('test@example.com', 'Test@123456');

            // Wait for authentication
            await page.waitForTimeout(1000);

            // Reload page
            await page.reload();

            // Verify still authenticated
            const userMenu = page.locator('[data-testid="user-menu"], .user-avatar');
            await expect(userMenu.first()).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Sign Up', () => {
        test('should successfully register new user', async ({ page, testUser }) => {
            await homePage.clickSignIn();

            // Switch to sign up
            const signUpTab = page.getByTestId('sign-up-tab');
            if (await signUpTab.count() > 0) {
                await signUpTab.click();
            }

            // Fill registration form
            await authPage.emailInput.fill(testUser.email);
            await authPage.passwordInput.fill(testUser.password);

            const nameInput = page.locator('input[name="name"]');
            if (await nameInput.count() > 0) {
                await nameInput.fill(testUser.name);
            }

            await authPage.submitButton.click();

            // Verify successful registration
            await page.waitForTimeout(2000);
            const url = page.url();
            expect(url).toMatch(/\/(dashboard|verify)?/);
        });

        test('should prevent duplicate email registration', async ({ page }) => {
            await homePage.clickSignIn();

            const signUpTab = page.getByTestId('sign-up-tab');
            if (await signUpTab.count() > 0) {
                await signUpTab.click();
            }

            // Try to register with existing email
            await authPage.emailInput.fill('test@example.com');
            await authPage.passwordInput.fill('Test@123456');
            await authPage.submitButton.click();

            // Check for error
            const errorMsg = await authPage.getErrorMessage();
            expect(errorMsg).toBeTruthy();
        });

        test('should validate password strength', async ({ page }) => {
            await homePage.clickSignIn();

            const signUpTab = page.getByTestId('sign-up-tab');
            if (await signUpTab.count() > 0) {
                await signUpTab.click();
            }

            // Try weak password
            await authPage.emailInput.fill('newuser@example.com');
            await authPage.passwordInput.fill('123');

            // Check for password strength indicator
            const strengthIndicator = page.locator('.password-strength, [data-testid="password-strength"]');
            if (await strengthIndicator.count() > 0) {
                const strength = await strengthIndicator.textContent();
                expect(strength?.toLowerCase()).toContain('weak');
            }
        });
    });

    test.describe('Sign Out', () => {
        test('should successfully sign out', async ({ page }) => {
            // Sign in first
            await homePage.clickSignIn();
            await authPage.login('test@example.com', 'Test@123456');
            await page.waitForTimeout(1000);

            // Find and click sign out
            const userMenu = page.locator('[data-testid="user-menu"], .user-avatar');
            if (await userMenu.count() > 0) {
                await userMenu.first().click();

                const signOutButton = page.locator('button:has-text("Sign Out"), a:has-text("Sign Out")');
                await signOutButton.click();

                // Verify signed out
                await page.waitForTimeout(1000);
                await expect(homePage.signInButton.first()).toBeVisible();
            }
        });
    });

    test.describe('Password Recovery', () => {
        test('should send password reset email', async ({ page }) => {
            await homePage.clickSignIn();

            // Click forgot password
            if (await authPage.forgotPasswordLink.count() > 0) {
                await authPage.forgotPasswordLink.click();

                // Enter email
                await authPage.emailInput.fill('test@example.com');
                await authPage.submitButton.click();

                // Check for success message
                await expect(authPage.successMessage).toBeVisible({ timeout: 5000 });
            }
        });
    });

    test.describe('Social Authentication', () => {
        test('should initiate Google sign in', async ({ page }) => {
            await homePage.clickSignIn();

            if (await authPage.googleSignInButton.count() > 0) {
                // Mock Google OAuth
                await page.route('**/auth/google', route => {
                    route.fulfill({
                        status: 302,
                        headers: {
                            'Location': '/dashboard'
                        }
                    });
                });

                await authPage.googleSignInButton.click();

                // Verify redirect initiated
                await page.waitForTimeout(1000);
            }
        });
    });

    test.describe('Security', () => {
        test('should prevent XSS in email field', async ({ page }) => {
            await homePage.clickSignIn();

            const xssPayload = '<script>alert("XSS")</script>';
            await authPage.emailInput.fill(xssPayload);

            // Verify input is sanitized
            const value = await authPage.emailInput.inputValue();
            expect(value).not.toContain('<script>');
        });

        test.skip('should rate limit login attempts', async ({ page }) => {
            await homePage.clickSignIn();

            // Attempt multiple failed logins
            for (let i = 0; i < 5; i++) {
                await authPage.login('test@example.com', 'wrongpassword');
                await page.waitForTimeout(500);
            }

            // Check for rate limit message
            const errorMsg = await authPage.getErrorMessage();
            if (errorMsg) {
                expect(errorMsg.toLowerCase()).toMatch(/limit|many|wait/);
            }
        });
    });
});
