// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
    testDir: './__tests__/e2e',
    testMatch: /.*\.spec\.[jt]s/,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [
        ['html', { outputFolder: 'playwright-report' }],
        ['json', { outputFile: 'test-results/results.json' }],
        ['list']
    ],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'web-client',
            testDir: './__tests__/e2e/web-client',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: process.env.BASE_URL_CLIENT || 'http://localhost:3000',
            },
        },
        {
            name: 'web-provider',
            testDir: './__tests__/e2e/web-provider',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: process.env.BASE_URL_PROVIDER || 'http://localhost:3001',
            },
        },
        {
            name: 'web-admin',
            testDir: './__tests__/e2e/web-admin',
            use: {
                ...devices['Desktop Chrome'],
                baseURL: process.env.BASE_URL_ADMIN || 'http://localhost:3002',
            },
        },
        {
            name: 'integration',
            testDir: './__tests__/e2e/integration',
            use: {
                ...devices['Desktop Chrome'],
                // No specific baseURL as this test uses multiple contexts
            },
        },
    ],
});
