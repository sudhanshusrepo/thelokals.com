import { test as base, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';

/**
 * Test Fixtures for E2E Testing
 * Provides reusable test data and utilities
 */

export interface TestUser {
    email: string;
    password: string;
    name: string;
    phone: string;
}

export interface TestProvider {
    email: string;
    password: string;
    name: string;
    category: string;
    experience: number;
}

export interface TestBooking {
    category: string;
    description: string;
    location: string;
    estimatedCost: number;
}

// Extend base test with custom fixtures
export const test = base.extend<{
    authenticatedPage: any;
    testUser: TestUser;
    testProvider: TestProvider;
    testBooking: TestBooking;
}>({
    // Authenticated page fixture
    authenticatedPage: async ({ page }: { page: any }, use: (arg: any) => Promise<void>) => {
        // Login before each test
        await page.goto('/');

        // Click sign in button
        const signInButton = page.getByRole('button', { name: /sign in/i });
        if (await signInButton.count() > 0) {
            await signInButton.first().click();

            // Fill in credentials
            await page.fill('input[type="email"]', 'test@example.com');
            await page.fill('input[type="password"]', 'Test@123456');
            await page.click('button[type="submit"]');

            // Wait for authentication
            await page.waitForTimeout(1000);
        }

        await use(page);
    },

    // Test user fixture
    testUser: async ({ }, use) => {
        const user: TestUser = {
            email: faker.internet.email(),
            password: 'Test@123456',
            name: faker.person.fullName(),
            phone: faker.phone.number(),
        };
        await use(user);
    },

    // Test provider fixture
    testProvider: async ({ }, use) => {
        const provider: TestProvider = {
            email: faker.internet.email(),
            password: 'Provider@123',
            name: faker.person.fullName(),
            category: faker.helpers.arrayElement(['Plumber', 'Electrician', 'Carpenter']),
            experience: faker.number.int({ min: 1, max: 20 }),
        };
        await use(provider);
    },

    // Test booking fixture
    testBooking: async ({ }, use) => {
        const booking: TestBooking = {
            category: faker.helpers.arrayElement(['Plumber', 'Electrician', 'Carpenter']),
            description: faker.lorem.sentence(),
            location: `${faker.location.city()}, ${faker.location.state()}`,
            estimatedCost: faker.number.int({ min: 50, max: 500 }),
        };
        await use(booking);
    },
});

export { expect };

/**
 * Helper Functions
 */

export class TestHelpers {
    /**
     * Wait for network idle
     */
    static async waitForNetworkIdle(page: any, timeout = 5000) {
        await page.waitForLoadState('networkidle', { timeout });
    }

    /**
     * Take screenshot with timestamp
     */
    static async takeScreenshot(page: any, name: string) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        await page.screenshot({
            path: `test-results/screenshots/${name}-${timestamp}.png`,
            fullPage: true
        });
    }

    /**
     * Check for console errors
     */
    static setupConsoleErrorTracking(page: any) {
        const errors: string[] = [];
        page.on('console', (msg: any) => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        return errors;
    }

    /**
     * Mock API response
     */
    static async mockApiResponse(page: any, url: string, response: any) {
        await page.route(url, (route: any) => {
            route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(response),
            });
        });
    }

    /**
     * Wait for element with retry
     */
    static async waitForElementWithRetry(
        page: any,
        selector: string,
        options = { timeout: 10000, retries: 3 }
    ) {
        let lastError;
        for (let i = 0; i < options.retries; i++) {
            try {
                await page.waitForSelector(selector, { timeout: options.timeout });
                return;
            } catch (error) {
                lastError = error;
                await page.waitForTimeout(1000);
            }
        }
        throw lastError;
    }

    /**
     * Fill form with data
     */
    static async fillForm(page: any, formData: Record<string, string>) {
        for (const [name, value] of Object.entries(formData)) {
            const input = page.locator(`input[name="${name}"], textarea[name="${name}"], select[name="${name}"]`);
            if (await input.count() > 0) {
                await input.fill(value);
            }
        }
    }

    /**
     * Check for accessibility violations
     */
    static async checkAccessibility(page: any) {
        // This would integrate with axe-core
        // For now, basic checks
        const images = await page.locator('img').all();
        for (const img of images) {
            const alt = await img.getAttribute('alt');
            expect(alt).toBeTruthy();
        }
    }

    /**
     * Generate random test data
     */
    static generateTestData(type: 'user' | 'provider' | 'booking') {
        switch (type) {
            case 'user':
                return {
                    email: faker.internet.email(),
                    password: 'Test@123456',
                    name: faker.person.fullName(),
                    phone: faker.phone.number(),
                };
            case 'provider':
                return {
                    email: faker.internet.email(),
                    password: 'Provider@123',
                    name: faker.person.fullName(),
                    category: faker.helpers.arrayElement(['Plumber', 'Electrician', 'Carpenter']),
                    experience: faker.number.int({ min: 1, max: 20 }),
                };
            case 'booking':
                return {
                    category: faker.helpers.arrayElement(['Plumber', 'Electrician', 'Carpenter']),
                    description: faker.lorem.sentence(),
                    location: `${faker.location.city()}, ${faker.location.state()}`,
                    estimatedCost: faker.number.int({ min: 50, max: 500 }),
                };
        }
    }
}
