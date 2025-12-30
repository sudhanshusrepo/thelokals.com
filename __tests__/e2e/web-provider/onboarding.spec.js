const { test, expect } = require('@playwright/test');

test.describe('Provider App Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Enable Test Mode in App
        await page.addInitScript(() => {
            // @ts-ignore
            window.PLAYWRIGHT_TEST_MODE = true;
        });

        // Mock Supabase Services API
        await page.route('**/rest/v1/services*', async route => {
            const json = [
                { id: '1', code: 'ac-repair', name: 'AC Repair', description: 'AC Service & Repair', enabled_globally: true },
                { id: '2', code: 'cleaning', name: 'Home Cleaning', description: 'Full home cleaning', enabled_globally: true }
            ];
            await route.fulfill({ json });
        });

        // Mock Supabase Auth OTP (Login) - IF the app makes a network call for it
        // Often client-side supabase calls /auth/v1/otp
        await page.route('**/auth/v1/otp', async route => {
            await route.fulfill({ json: {} }); // Mock success
        });

        // Mock Supabase Auth Verify
        await page.route('**/auth/v1/verify', async route => {
            // Create a JWT that expires in the future to prevent auto-refresh
            const futureExp = Math.floor(Date.now() / 1000) + 36000; // 10 hours
            const payload = {
                sub: 'test-user-id',
                aud: 'authenticated',
                role: 'authenticated',
                iat: Math.floor(Date.now() / 1000),
                exp: futureExp
            };
            const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64').replace(/=/g, '');
            const fakeJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${encodedPayload}.signature`;

            await route.fulfill({
                json: {
                    user: { id: 'test-user-id', email: 'test@example.com' },
                    session: {
                        access_token: fakeJwt,
                        refresh_token: 'fake-refresh-token',
                        expires_in: 36000,
                        user: { id: 'test-user-id' }
                    }
                }
            });
        });

        // Mock Supabase Get User (Session Restoration)
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                json: {
                    id: 'test-user-id',
                    email: 'test@example.com',
                    aud: 'authenticated',
                    role: 'authenticated'
                }
            });
        });

        // Mock Providers Check (for profile existence)
        await page.route('**/rest/v1/providers*', async route => {
            // Return empty list to simulate new user
            await route.fulfill({ json: [] });
        });
    });

    test('Provider Onboarding: Login -> Onboarding -> Verification -> Dashboard', async ({ page }) => {
        // Log all console messages from the browser
        page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

        test.setTimeout(60000);
        // 2. Start Test (Already Authenticated via Test Mode)
        await page.goto('/onboarding');

        // Wait for potential redirect logic (though we should be allowed)
        await expect(page).toHaveURL(/\/onboarding/, { timeout: 20000 });

        // 4. Onboarding Step 1: Personal Details
        await expect(page.locator('text=Personal Details')).toBeVisible();
        await page.fill('input[placeholder="Full Name"]', 'Rajesh Kumar');
        await page.fill('input[placeholder="Email Address"]', 'rajesh@example.com');
        // City defaults to Gurugram, which is fine
        await page.click('button:has-text("Next")');

        // 5. Onboarding Step 2: Service Selection
        await expect(page.locator('text=Select Your Service')).toBeVisible();
        // Click the mock service
        await page.click('text=AC Repair');
        await page.click('button:has-text("Next")');

        // 6. Onboarding Step 3: DigiLocker
        await expect(page.locator('text=DigiLocker Verification')).toBeVisible();
        await page.click('button:has-text("Connect DigiLocker")');

        // DigiLocker Modal interactions
        const modal = page.locator('div:has-text("Verify your Identity")');
        await expect(modal.first()).toBeVisible();

        // Fill Aadhaar
        await page.fill('input[placeholder="XXXX XXXX XXXX"]', '123456789012');
        // Ensure we click the Next button INSIDE the modal
        await page.click('.fixed button:has-text("Next")');

        // Wait for OTP step (simulated delay in component is 1.5s)
        await expect(page.locator('text=Enter OTP')).toBeVisible({ timeout: 10000 });
        await page.fill('input[placeholder="123456"]', '123456');
        await page.click('button:has-text("Verify & Fetch Documents")');

        // Wait for success in modal (component has delays)
        // It shows "Fetching Documents..." then eventually success inside modal? 
        // No, `DigiLockerModal` calls `onSuccess` then closes.
        // Wait for modal to close or Success message in main page.

        await expect(page.locator('text=Verification Successful')).toBeVisible({ timeout: 15000 });

        // 7. Complete Registration
        await page.click('button:has-text("Complete Registration")');

        // 8. Verify Redirect to Dashboard
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 20000 });

        // Optional: Verify dashboard content if possible
        // await expect(page.locator('text=Dashboard')).toBeVisible();
    });
});
