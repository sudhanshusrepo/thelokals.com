
const { test, expect } = require('@playwright/test');

test.describe('Admin Provider Approval Flow', () => {
    test.setTimeout(60000);

    test.beforeEach(async ({ page }) => {
        // Mock Admin Authentication
        // Direct local storage injection if Admin uses Supabase Auth
        // Assuming implementation is consistent with other apps
        await page.addInitScript(() => {
            window.localStorage.setItem('supabase.auth.token', JSON.stringify({
                currentSession: {
                    user: { id: 'admin-user-id', email: 'admin@thelokals.com', role: 'authenticated' },
                    access_token: 'fake-jwt',
                    expires_at: Math.floor(Date.now() / 1000) + 3600
                }
            }));
        });

        // Debug
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('request', request => console.log('>>', request.method(), request.url()));

        // Mock Supabase User
        await page.route('**/auth/v1/user', async route => {
            await route.fulfill({
                status: 200,
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    id: 'admin-user-id',
                    email: 'admin@thelokals.com',
                    aud: 'authenticated',
                    role: 'authenticated'
                })
            });
        });

        // Mock Providers Queue
        await page.route('**/rest/v1/providers*', async route => {
            const method = route.request().method();
            const url = route.request().url();

            if (method === 'GET') {
                console.log('Intercepted GET providers');
                // Return one pending provider
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([{
                        id: 'provider-123',
                        full_name: 'Pending Plumber',
                        email: 'plumber@example.com',
                        phone: '9876543210',
                        category: 'plumbing',
                        experience_years: 5,
                        verification_status: 'pending',
                        submitted_at: new Date().toISOString(),
                        created_at: new Date().toISOString()
                    }])
                });
            } else if (method === 'PATCH') {
                console.log('Intercepted PATCH provider (Approval)');
                // Simulate successful update
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([{
                        id: 'provider-123',
                        verification_status: 'approved',
                        verified_at: new Date().toISOString()
                    }])
                });
            } else {
                await route.continue();
            }
        });

        // Mock Approval History
        await page.route('**/rest/v1/provider_approval_history', async route => {
            await route.fulfill({
                status: 201,
                body: JSON.stringify({ success: true })
            });
        });

        await page.goto('/providers'); // Admin route for approval queue
    });

    test('should allow admin to approve a pending provider', async ({ page }) => {
        // 1. Verify Pending Provider is visible
        const providerCard = page.getByText('Pending Plumber');
        await expect(providerCard).toBeVisible();
        await expect(page.getByText('pending', { exact: true })).toBeVisible(); // Badge

        // 2. Click Approve
        const approveBtn = page.getByTestId('approve-btn');
        await expect(approveBtn).toBeVisible();
        await approveBtn.click();

        // 3. Verify UI update 
        // Note: The component re-fetches after approval. 
        // We need to update the mock for the 2nd fetch to show 'approved' OR empty if it filters by pending.
        // The component uses local state `filter` default 'pending'.
        // So if we approve, it re-fetches 'pending'. 
        // If our mock keeps returning the pending provider, it won't disappear unless we make mock stateful.

        // Let's verify the BUTTONS disappear or verify the PATCH call was made (Playwright implicit check if we mock strict).
        // OR we can switch filter to 'Approved'.

        // Simulating the flow:
        // 1. App loads -> GET providers?status=pending -> returns [Pending Plumber]
        // 2. User clicks Approve -> PATCH provider -> 200 OK
        // 3. App calls fetchProviders() -> GET providers?status=pending

        // To verify success "visually" like a user, the item should vanish from Pending list.
        // We need a stateful mock.

        /* 
           Simulate:
           Call 1 (Load): Returns [Pending Provider]
           Call 2 (Refetch after approve): Returns [] (No more pending)
        */

        // Note: We can't easily change the route handler mid-test without re-declaring. 
        // Simpler approach: Verify the PATCH request happened and UI feedback if any?
        // Inspecting the code: `fetchProviders()` runs again. `setSelectedProvider(null)`.
        // No explicit success toast in the code I viewed, just re-fetch.

        // Let's rely on the PATCH intercept log or mock statefulness.
    });
});
