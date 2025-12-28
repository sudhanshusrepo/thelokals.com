
import { test, expect } from '@playwright/test';

test('sanity check', async ({ page }) => {
    console.log('Sanity test running');
    expect(1).toBe(1);
});
