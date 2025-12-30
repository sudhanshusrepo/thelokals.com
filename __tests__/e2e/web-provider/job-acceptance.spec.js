
const { test, expect } = require('@playwright/test');

test.describe('Provider Job Acceptance Flow', () => {
    test.setTimeout(60000);

    test.beforeEach(async ({ page }) => {
        // Authenticate
        await page.addInitScript(() => {
            window.PLAYWRIGHT_TEST_MODE = true;
            window.localStorage.setItem('supabase.auth.token', JSON.stringify({
                currentSession: {
                    user: { id: 'test-user-id', email: 'provider@example.com', role: 'authenticated' },
                    access_token: 'fake-jwt',
                    expires_at: Math.floor(Date.now() / 1000) + 3600
                }
            }));
            window.localStorage.setItem('playwright-test-profile', JSON.stringify({
                id: 'test-user-id',
                full_name: 'Test Provider',
                is_verified: true,
                registration_completed: true,
                category: 'plumbing',
                verification_status: 'approved'
            }));
        });

        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('request', request => console.log('>>', request.method(), request.url()));

        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    id: 'test-user-id',
                    email: 'provider@example.com',
                    aud: 'authenticated',
                    role: 'authenticated'
                })
            });
        });

        // Stateful Mock for Dashboard Data
        let dashboardCallCount = 0;
        await page.route('**/rpc/get_provider_dashboard_data', async route => {
            dashboardCallCount++;
            console.log(`Intercepted RPC get_provider_dashboard_data (${dashboardCallCount})`);

            if (dashboardCallCount <= 2) {
                // Initial load (x2 usually due to strict mode or re-renders)
                // Return empty bookings
                await route.fulfill({ status: 200, body: JSON.stringify([]) });
            } else {
                // After reload / subsequent fetches
                // Return accepted booking
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([{
                        id: 'booking-123',
                        status: 'CONFIRMED',
                        payment_status: 'PENDING',
                        user_id: 'client-123',
                        user_name: 'Test Client',
                        user_avatar_url: null,
                        address: '123 Fake St',
                        total_price: 100,
                        provider_earnings: 90,
                        platform_commission: 10,
                        created_at: new Date().toISOString()
                    }])
                });
            }
        });

        await page.route('**/rest/v1/provider_notifications*', async route => {
            await route.fulfill({ status: 200, body: JSON.stringify([]) });
        });

        // Mock providers table for profile
        await page.route('**/rest/v1/providers*', async route => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([{
                        id: 'test-user-id',
                        is_verified: true,
                        registration_completed: true,
                        category: 'plumbing'
                    }])
                });
            } else {
                await route.continue();
            }
        });

        await page.route('**/rest/v1/booking_requests*', async route => {
            await route.fulfill({
                status: 200,
                body: JSON.stringify([{
                    id: 'request-123',
                    booking_id: 'booking-123',
                    provider_id: 'test-user-id',
                    status: 'PENDING',
                    created_at: new Date().toISOString()
                }])
            });
        });

        await page.route('**/rpc/accept_booking', async route => {
            console.log('Intercepted accept_booking RPC');
            await route.fulfill({
                status: 200,
                body: JSON.stringify({
                    id: 'booking-123',
                    status: 'CONFIRMED'
                })
            });
        });

        // Catch-all for bookings REST if used
        await page.route('**/rest/v1/bookings*', async route => route.fulfill({ status: 200, body: '[]' }));

        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
    });

    test('should display live request and allow acceptance', async ({ page }) => {
        // 1. Verify Live Request
        await expect(page.getByText('New Live Booking!')).toBeVisible({ timeout: 10000 });

        // 2. Click Accept
        const acceptButton = page.getByRole('button', { name: 'Accept', exact: true });
        await acceptButton.click();

        // 3. Verify Removal
        await expect(page.getByText('New Live Booking!')).not.toBeVisible();

        // 4. Navigate and Verify Accepted
        console.log('Reloading to verify Accepted tab...');
        await page.reload();
        await page.waitForLoadState('networkidle');

        // Navigate to accepted tab
        await page.getByRole('button', { name: 'Accepted' }).click();

        // Wait for dashboard content
        await expect(page.getByText('Provider Inbox')).toBeVisible();

        // Check for client name
        await expect(page.getByText('Test Client')).toBeVisible();
    });
});
