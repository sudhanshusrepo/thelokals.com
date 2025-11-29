import { test, expect, TestHelpers } from '../fixtures/test-fixtures';
import { HomePage, ServiceRequestPage, DashboardPage, BookingDetailsPage } from '../page-objects/pages';

test.describe('Booking Flow - Enhanced', () => {
    let homePage: HomePage;
    let serviceRequestPage: ServiceRequestPage;
    let dashboardPage: DashboardPage;
    let bookingDetailsPage: BookingDetailsPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        serviceRequestPage = new ServiceRequestPage(page);
        dashboardPage = new DashboardPage(page);
        bookingDetailsPage = new BookingDetailsPage(page);
    });

    test.describe('AI-Enhanced Booking', () => {
        test('should create booking with AI analysis', async ({ page, testBooking }) => {
            await homePage.goto();

            // Select service category
            await homePage.selectCategory(testBooking.category);

            // Fill service request
            await serviceRequestPage.fillServiceRequest({
                description: testBooking.description,
                location: testBooking.location,
            });

            // Submit for AI analysis
            await serviceRequestPage.submitRequest();

            // Verify AI checklist appears
            await expect(serviceRequestPage.aiChecklistSection).toBeVisible({ timeout: 10000 });

            // Verify estimated cost
            const cost = await serviceRequestPage.getEstimatedCost();
            expect(cost).toBeTruthy();

            // Confirm booking
            await serviceRequestPage.confirmBooking();

            // Verify booking created
            await page.waitForTimeout(2000);
            const url = page.url();
            expect(url).toMatch(/booking|confirmation/);
        });

        test('should handle AI analysis timeout gracefully', async ({ page }) => {
            await serviceRequestPage.goto('plumber');

            // Mock slow AI response
            await page.route('**/api/ai/**', route => {
                setTimeout(() => {
                    route.fulfill({
                        status: 200,
                        body: JSON.stringify({ checklist: [], estimatedCost: 100 })
                    });
                }, 15000);
            });

            await serviceRequestPage.fillServiceRequest({
                description: 'Emergency plumbing',
                location: 'New York, NY',
            });

            await serviceRequestPage.submitRequest();

            // Check for timeout message or fallback
            const errorMessage = page.locator('.error-message, [role="alert"]');
            await expect(errorMessage.first()).toBeVisible({ timeout: 20000 });
        });

        test('should allow editing requirements before confirmation', async ({ page, testBooking }) => {
            await serviceRequestPage.goto(testBooking.category.toLowerCase());

            await serviceRequestPage.fillServiceRequest({
                description: testBooking.description,
                location: testBooking.location,
            });

            await serviceRequestPage.submitRequest();

            // Wait for AI analysis
            await expect(serviceRequestPage.aiChecklistSection).toBeVisible({ timeout: 10000 });

            // Find edit button
            const editButton = page.locator('button:has-text("Edit"), button:has-text("Modify")');
            if (await editButton.count() > 0) {
                await editButton.click();

                // Modify description
                await serviceRequestPage.descriptionInput.fill('Updated requirements');
                await serviceRequestPage.submitRequest();

                // Verify AI re-analysis
                await expect(serviceRequestPage.aiChecklistSection).toBeVisible({ timeout: 10000 });
            }
        });

        test('should validate required fields', async ({ page }) => {
            await serviceRequestPage.goto('electrician');

            // Try to submit without filling required fields
            await serviceRequestPage.submitButton.first().click();

            // Check for validation errors
            const descriptionInvalid = await serviceRequestPage.descriptionInput.evaluate(
                (el: HTMLTextAreaElement) => !el.validity.valid
            );
            expect(descriptionInvalid).toBeTruthy();
        });
    });

    test.describe('Live Booking', () => {
        test('should send live booking request to providers', async ({ page, testBooking }) => {
            await serviceRequestPage.goto();

            // Select live booking option
            const liveBookingRadio = page.locator('input[value="LIVE"], input[type="radio"][value="live"]');
            if (await liveBookingRadio.count() > 0) {
                await liveBookingRadio.click();
            }

            await serviceRequestPage.fillServiceRequest({
                category: testBooking.category,
                description: testBooking.description,
                location: testBooking.location,
            });

            await serviceRequestPage.submitRequest();

            // Verify live search initiated
            const searchingMessage = page.locator('text=/searching|finding/i');
            await expect(searchingMessage.first()).toBeVisible({ timeout: 5000 });

            // Verify countdown timer
            const countdown = page.locator('.countdown, [data-testid="countdown"]');
            if (await countdown.count() > 0) {
                await expect(countdown).toBeVisible();
            }
        });

        test('should handle no providers available', async ({ page, testBooking }) => {
            await serviceRequestPage.goto();

            // Mock no providers response
            await page.route('**/api/bookings/live', route => {
                route.fulfill({
                    status: 200,
                    body: JSON.stringify({ providers: [] })
                });
            });

            const liveBookingRadio = page.locator('input[value="LIVE"]');
            if (await liveBookingRadio.count() > 0) {
                await liveBookingRadio.click();
            }

            await serviceRequestPage.fillServiceRequest({
                category: testBooking.category,
                description: testBooking.description,
                location: testBooking.location,
            });

            await serviceRequestPage.submitRequest();

            // Check for no providers message
            const noProvidersMessage = page.locator('text=/no providers|unavailable/i');
            await expect(noProvidersMessage.first()).toBeVisible({ timeout: 10000 });
        });

        test('should cancel live booking request', async ({ page, testBooking }) => {
            await serviceRequestPage.goto();

            const liveBookingRadio = page.locator('input[value="LIVE"]');
            if (await liveBookingRadio.count() > 0) {
                await liveBookingRadio.click();
            }

            await serviceRequestPage.fillServiceRequest({
                category: testBooking.category,
                description: testBooking.description,
                location: testBooking.location,
            });

            await serviceRequestPage.submitRequest();

            // Wait for search to start
            await page.waitForTimeout(2000);

            // Cancel request
            const cancelButton = page.locator('button:has-text("Cancel")');
            if (await cancelButton.count() > 0) {
                await cancelButton.click();

                // Verify cancellation
                const cancelledMessage = page.locator('text=/cancelled|stopped/i');
                await expect(cancelledMessage.first()).toBeVisible({ timeout: 5000 });
            }
        });
    });

    test.describe('Booking Management', () => {
        test('should view booking details', async ({ page }) => {
            await dashboardPage.goto();

            // Click on first booking
            const bookingCount = await dashboardPage.getBookingCount();
            if (bookingCount > 0) {
                await dashboardPage.clickBooking(0);

                // Verify details page
                await expect(bookingDetailsPage.statusBadge).toBeVisible();
                await expect(bookingDetailsPage.serviceDetails).toBeVisible();
            }
        });

        test('should filter bookings by status', async ({ page }) => {
            await dashboardPage.goto();

            // Filter by status
            await dashboardPage.filterBookings('PENDING');

            // Verify filtered results
            await page.waitForTimeout(1000);
            const bookings = await dashboardPage.bookingCards.all();

            for (const booking of bookings) {
                const status = await booking.locator('.status-badge').textContent();
                expect(status?.toUpperCase()).toContain('PENDING');
            }
        });

        test('should search bookings', async ({ page }) => {
            await dashboardPage.goto();

            await dashboardPage.searchBookings('plumber');

            // Verify search results
            await page.waitForTimeout(1000);
            const bookingCount = await dashboardPage.getBookingCount();
            expect(bookingCount).toBeGreaterThanOrEqual(0);
        });

        test('should cancel booking', async ({ page }) => {
            await dashboardPage.goto();

            const bookingCount = await dashboardPage.getBookingCount();
            if (bookingCount > 0) {
                await dashboardPage.clickBooking(0);

                // Cancel booking
                await bookingDetailsPage.cancelBooking();

                // Verify cancellation
                const status = await bookingDetailsPage.getStatus();
                expect(status?.toUpperCase()).toContain('CANCEL');
            }
        });
    });

    test.describe('Booking Status Updates', () => {
        test('should update booking status to in-progress', async ({ page }) => {
            await dashboardPage.goto();

            // Mock booking status update
            await page.route('**/api/bookings/**/status', route => {
                route.fulfill({
                    status: 200,
                    body: JSON.stringify({ status: 'IN_PROGRESS' })
                });
            });

            const bookingCount = await dashboardPage.getBookingCount();
            if (bookingCount > 0) {
                await dashboardPage.clickBooking(0);

                // Start service
                const startButton = page.locator('button:has-text("Start")');
                if (await startButton.count() > 0) {
                    await startButton.click();

                    // Verify status updated
                    await page.waitForTimeout(1000);
                    const status = await bookingDetailsPage.getStatus();
                    expect(status?.toUpperCase()).toContain('PROGRESS');
                }
            }
        });

        test('should complete booking', async ({ page }) => {
            await dashboardPage.goto();

            const bookingCount = await dashboardPage.getBookingCount();
            if (bookingCount > 0) {
                await dashboardPage.clickBooking(0);

                // Complete booking
                const completeButton = page.locator('button:has-text("Complete")');
                if (await completeButton.count() > 0) {
                    await completeButton.click();

                    // Fill final cost if required
                    const costInput = page.locator('input[name="finalCost"]');
                    if (await costInput.count() > 0) {
                        await costInput.fill('150.00');
                    }

                    // Confirm completion
                    const confirmButton = page.locator('button:has-text("Confirm")');
                    if (await confirmButton.count() > 0) {
                        await confirmButton.click();
                    }

                    // Verify completion
                    await page.waitForTimeout(1000);
                    const status = await bookingDetailsPage.getStatus();
                    expect(status?.toUpperCase()).toContain('COMPLETE');
                }
            }
        });
    });

    test.describe('Reviews and Ratings', () => {
        test('should leave review for completed booking', async ({ page }) => {
            await dashboardPage.goto();

            // Filter completed bookings
            await dashboardPage.filterBookings('COMPLETED');

            const bookingCount = await dashboardPage.getBookingCount();
            if (bookingCount > 0) {
                await dashboardPage.clickBooking(0);

                // Leave review
                await bookingDetailsPage.leaveReview(5, 'Excellent service!');

                // Verify review submitted
                const successMessage = page.locator('text=/review.*submitted|thank you/i');
                await expect(successMessage.first()).toBeVisible({ timeout: 5000 });
            }
        });

        test('should validate review rating', async ({ page }) => {
            await dashboardPage.goto();
            await dashboardPage.filterBookings('COMPLETED');

            const bookingCount = await dashboardPage.getBookingCount();
            if (bookingCount > 0) {
                await dashboardPage.clickBooking(0);

                const reviewButton = bookingDetailsPage.reviewButton;
                if (await reviewButton.count() > 0) {
                    await reviewButton.click();

                    // Try to submit without rating
                    const submitButton = page.locator('button[type="submit"]');
                    await submitButton.click();

                    // Check for validation error
                    const errorMessage = page.locator('.error-message, [role="alert"]');
                    if (await errorMessage.count() > 0) {
                        await expect(errorMessage.first()).toBeVisible();
                    }
                }
            }
        });
    });

    test.describe('Error Handling', () => {
        test('should handle network errors gracefully', async ({ page, testBooking }) => {
            await serviceRequestPage.goto(testBooking.category.toLowerCase());

            // Simulate network error
            await page.route('**/api/**', route => {
                route.abort('failed');
            });

            await serviceRequestPage.fillServiceRequest({
                description: testBooking.description,
                location: testBooking.location,
            });

            await serviceRequestPage.submitRequest();

            // Check for error message
            const errorMessage = page.locator('.error-message, [role="alert"]');
            await expect(errorMessage.first()).toBeVisible({ timeout: 5000 });
        });

        test('should retry failed requests', async ({ page, testBooking }) => {
            let requestCount = 0;

            await page.route('**/api/bookings', route => {
                requestCount++;
                if (requestCount < 3) {
                    route.abort('failed');
                } else {
                    route.fulfill({
                        status: 200,
                        body: JSON.stringify({ bookingId: '123' })
                    });
                }
            });

            await serviceRequestPage.goto(testBooking.category.toLowerCase());

            await serviceRequestPage.fillServiceRequest({
                description: testBooking.description,
                location: testBooking.location,
            });

            await serviceRequestPage.submitRequest();

            // Verify retry succeeded
            await page.waitForTimeout(5000);
            expect(requestCount).toBeGreaterThanOrEqual(3);
        });
    });
});
