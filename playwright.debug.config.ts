
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: '.',
    testMatch: 'sanity.spec.ts',
    use: {
        baseURL: 'http://localhost:3000',
    },
    projects: [
        { name: 'chromium', use: { browserName: 'chromium' } },
    ],
});
