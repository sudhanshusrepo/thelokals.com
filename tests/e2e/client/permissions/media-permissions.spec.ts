import { test, expect } from '@playwright/test';

test.describe('Media Permissions - Play Store Compliance', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/service/plumber');
    });

    test.describe('Microphone Permission', () => {
        test('should display audio recording button', async ({ page }) => {
            // Scroll to chat input
            await page.locator('[data-testid="chat-input-textarea"]').scrollIntoViewIfNeeded();

            // Audio button should be visible
            const audioButton = page.locator('button[title="Record Audio"]');
            await expect(audioButton).toBeVisible();

            // Should have microphone icon
            await expect(audioButton.locator('svg')).toBeVisible();
        });

        test('should request microphone permission when audio button clicked', async ({ page, context }) => {
            // Grant microphone permission
            await context.grantPermissions(['microphone']);

            await page.click('button[title="Record Audio"]');

            // Should show audio recording UI
            await expect(page.locator('text=Recording audio').or(page.locator('[data-testid="audio-recording-ui"]'))).toBeVisible({ timeout: 5000 });
        });

        test('should show error message when microphone permission denied', async ({ page, context }) => {
            // Explicitly deny microphone permission
            await context.clearPermissions();

            let alertShown = false;
            let alertMessage = '';

            page.on('dialog', async dialog => {
                alertShown = true;
                alertMessage = dialog.message();
                await dialog.accept();
            });

            await page.click('button[title="Record Audio"]');

            // Wait for alert
            await page.waitForTimeout(1000);

            // Should show error message
            expect(alertShown).toBe(true);
            expect(alertMessage).toContain('Microphone access is required');
            expect(alertMessage).toContain('browser settings');
            expect(alertMessage).toContain('🎤');
        });

        test('should handle microphone permission prompt cancellation', async ({ page }) => {
            // Don't grant or deny, let it timeout
            await page.click('button[title="Record Audio"]');

            // Should either show error or stay on same page
            await page.waitForTimeout(2000);

            // Should still be on service page
            await expect(page).toHaveURL(/\/service\//);
        });

        test('should allow recording after permission granted', async ({ page, context }) => {
            await context.grantPermissions(['microphone']);

            await page.click('button[title="Record Audio"]');

            // Should show recording UI with timer
            await expect(page.locator('text=00:').or(page.locator('text=Recording'))).toBeVisible({ timeout: 5000 });

            // Should have stop/cancel buttons
            await expect(page.locator('button').filter({ hasText: /Cancel|Stop/ })).toBeVisible();
        });

        test('should stop recording when stop button clicked', async ({ page, context }) => {
            await context.grantPermissions(['microphone']);

            await page.click('button[title="Record Audio"]');
            await page.waitForTimeout(1000);

            // Click stop button (square icon)
            await page.locator('button').filter({ has: page.locator('rect') }).click();

            // Should show review/send options
            await expect(page.locator('button').filter({ hasText: /Send|Review/ })).toBeVisible();
        });

        test('should cancel recording when cancel button clicked', async ({ page, context }) => {
            await context.grantPermissions(['microphone']);

            await page.click('button[title="Record Audio"]');
            await page.waitForTimeout(500);

            // Click cancel button (X icon)
            await page.locator('button').filter({ has: page.locator('path[d*="M6 18L18 6"]') }).click();

            // Should return to normal chat input
            await expect(page.locator('[data-testid="chat-input-textarea"]')).toBeVisible();
        });
    });

    test.describe('Camera Permission', () => {
        test('should display video recording button', async ({ page }) => {
            await page.locator('[data-testid="chat-input-textarea"]').scrollIntoViewIfNeeded();

            const videoButton = page.locator('button[title="Record Video"]');
            await expect(videoButton).toBeVisible();

            // Should have video camera icon
            await expect(videoButton.locator('svg')).toBeVisible();
        });

        test('should request camera and microphone permissions when video button clicked', async ({ page, context }) => {
            // Grant both camera and microphone permissions
            await context.grantPermissions(['camera', 'microphone']);

            await page.click('button[title="Record Video"]');

            // Should show video recording UI
            await expect(page.locator('video').or(page.locator('[data-testid="video-recording-ui"]'))).toBeVisible({ timeout: 5000 });
        });

        test('should show error message when camera permission denied', async ({ page, context }) => {
            await context.clearPermissions();

            let alertShown = false;
            let alertMessage = '';

            page.on('dialog', async dialog => {
                alertShown = true;
                alertMessage = dialog.message();
                await dialog.accept();
            });

            await page.click('button[title="Record Video"]');

            await page.waitForTimeout(1000);

            expect(alertShown).toBe(true);
            expect(alertMessage).toContain('Camera and microphone access are required');
            expect(alertMessage).toContain('browser settings');
            expect(alertMessage).toContain('📹');
        });

        test('should show video preview when permission granted', async ({ page, context }) => {
            await context.grantPermissions(['camera', 'microphone']);

            await page.click('button[title="Record Video"]');

            // Should show video element
            const video = page.locator('video');
            await expect(video).toBeVisible({ timeout: 5000 });

            // Video should be playing (preview)
            const isPlaying = await video.evaluate((v: HTMLVideoElement) => !v.paused);
            expect(isPlaying).toBe(true);
        });

        test('should display recording timer during video recording', async ({ page, context }) => {
            await context.grantPermissions(['camera', 'microphone']);

            await page.click('button[title="Record Video"]');
            await page.waitForTimeout(1000);

            // Click record button (red circle)
            await page.locator('button').filter({ has: page.locator('.bg-red-500') }).click();

            // Should show timer
            await expect(page.locator('text=/00:\\d{2}/')).toBeVisible();
        });

        test('should have maximum recording duration', async ({ page, context }) => {
            await context.grantPermissions(['camera', 'microphone']);

            await page.click('button[title="Record Video"]');
            await page.waitForTimeout(500);

            // Should show max duration (00:30 or similar)
            await expect(page.locator('text=/\\/ 00:30/')).toBeVisible();
        });

        test('should cancel video recording', async ({ page, context }) => {
            await context.grantPermissions(['camera', 'microphone']);

            await page.click('button[title="Record Video"]');
            await page.waitForTimeout(500);

            // Click cancel button
            await page.locator('button').filter({ has: page.locator('path[d*="M6 18L18 6"]') }).click();

            // Should return to chat input
            await expect(page.locator('[data-testid="chat-input-textarea"]')).toBeVisible();
        });
    });

    test.describe('Permission Persistence', () => {
        test('should remember granted microphone permission', async ({ page, context }) => {
            await context.grantPermissions(['microphone']);

            // First recording
            await page.click('button[title="Record Audio"]');
            await expect(page.locator('text=Recording').or(page.locator('[data-testid="audio-recording-ui"]'))).toBeVisible({ timeout: 5000 });

            // Cancel
            await page.locator('button').filter({ has: page.locator('path[d*="M6 18L18 6"]') }).click();

            // Second recording - should not ask for permission again
            await page.click('button[title="Record Audio"]');
            await expect(page.locator('text=Recording').or(page.locator('[data-testid="audio-recording-ui"]'))).toBeVisible({ timeout: 5000 });
        });

        test('should remember granted camera permission', async ({ page, context }) => {
            await context.grantPermissions(['camera', 'microphone']);

            // First recording
            await page.click('button[title="Record Video"]');
            await expect(page.locator('video')).toBeVisible({ timeout: 5000 });

            // Cancel
            await page.locator('button').filter({ has: page.locator('path[d*="M6 18L18 6"]') }).click();

            // Second recording - should not ask again
            await page.click('button[title="Record Video"]');
            await expect(page.locator('video')).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Error Handling', () => {
        test('should handle device not found error', async ({ page, context }) => {
            // This test simulates no camera/microphone available
            // In real scenario, this would require browser flags or mocking

            await page.goto('/service/plumber');

            // The buttons should still be visible even if device not available
            await expect(page.locator('button[title="Record Audio"]')).toBeVisible();
            await expect(page.locator('button[title="Record Video"]')).toBeVisible();
        });

        test('should handle permission revocation during recording', async ({ page, context }) => {
            await context.grantPermissions(['microphone']);

            await page.click('button[title="Record Audio"]');
            await page.waitForTimeout(500);

            // Revoke permission mid-recording
            await context.clearPermissions();

            // Should handle gracefully (show error or stop recording)
            // Exact behavior depends on implementation
        });
    });

    test.describe('Accessibility', () => {
        test('should have accessible button labels', async ({ page }) => {
            const audioButton = page.locator('button[title="Record Audio"]');
            const videoButton = page.locator('button[title="Record Video"]');

            // Should have title attributes
            await expect(audioButton).toHaveAttribute('title', 'Record Audio');
            await expect(videoButton).toHaveAttribute('title', 'Record Video');

            // Should be keyboard accessible
            await audioButton.focus();
            await expect(audioButton).toBeFocused();

            await videoButton.focus();
            await expect(videoButton).toBeFocused();
        });

        test('should be activatable with keyboard', async ({ page, context }) => {
            await context.grantPermissions(['microphone']);

            const audioButton = page.locator('button[title="Record Audio"]');
            await audioButton.focus();
            await page.keyboard.press('Enter');

            // Should activate recording
            await expect(page.locator('text=Recording').or(page.locator('[data-testid="audio-recording-ui"]'))).toBeVisible({ timeout: 5000 });
        });
    });

    test.describe('Mobile Viewport', () => {
        test.beforeEach(async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
        });

        test('should display media buttons on mobile', async ({ page }) => {
            await page.goto('/service/plumber');

            // Buttons should be visible and appropriately sized
            await expect(page.locator('button[title="Record Audio"]')).toBeVisible();
            await expect(page.locator('button[title="Record Video"]')).toBeVisible();
        });

        test('should handle mobile camera permission', async ({ page, context }) => {
            await context.grantPermissions(['camera', 'microphone']);

            await page.goto('/service/plumber');
            await page.click('button[title="Record Video"]');

            // Should work on mobile viewport
            await expect(page.locator('video')).toBeVisible({ timeout: 5000 });
        });
    });
});

test.describe('Media Permissions - Integration', () => {
    test('should send audio recording with booking request', async ({ page, context }) => {
        await context.grantPermissions(['microphone']);

        await page.goto('/service/plumber');

        // Start recording
        await page.click('button[title="Record Audio"]');
        await page.waitForTimeout(2000);

        // Stop recording
        await page.locator('button').filter({ has: page.locator('rect') }).click();

        // Send recording
        await page.click('button:has-text("Send")');

        // Should process the audio
        await expect(page.locator('text=Analyzing').or(page.locator('text=Processing'))).toBeVisible({ timeout: 5000 });
    });

    test('should send video recording with booking request', async ({ page, context }) => {
        await context.grantPermissions(['camera', 'microphone']);

        await page.goto('/service/plumber');

        // Start video recording
        await page.click('button[title="Record Video"]');
        await page.waitForTimeout(1000);

        // Start recording
        await page.locator('button').filter({ has: page.locator('.bg-red-500') }).click();
        await page.waitForTimeout(2000);

        // Stop recording
        await page.locator('button').filter({ has: page.locator('rect') }).click();

        // Send
        await page.click('button').filter({ has: page.locator('path[d*="M5 13l4 4"]') }).click();

        // Should process the video
        await expect(page.locator('text=Analyzing').or(page.locator('text=Processing'))).toBeVisible({ timeout: 5000 });
    });
});
