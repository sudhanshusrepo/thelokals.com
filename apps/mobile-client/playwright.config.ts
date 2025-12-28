
/**
 * Dummy Playwright Config to satisfy monorepo resolution
 */
import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
});
