import { device, element, by, expect as detoxExpect, waitFor } from 'detox';

describe('Mobile Client - Complete Booking Flow', () => {
    beforeAll(async () => {
        await device.launchApp({
            permissions: { location: 'always' }
        });

        // Set mock location to Narnaund
        await device.setLocation({
            lat: 28.7041,
            lon: 76.9629
        });
    });

    beforeEach(async () => {
        await device.reloadReactNative();
    });

    it('should complete full booking flow: Service → Request → Accept → OTP → Rating', async () => {
        // Step 1: Home screen loads
        await waitFor(element(by.id('home-screen')))
            .toBeVisible()
            .withTimeout(5000);

        // Step 2: Location should be detected
        await waitFor(element(by.text('Narnaund')))
            .toBeVisible()
            .withTimeout(10000);

        // Step 3: Select Plumber service
        await element(by.id('service.plumber')).tap();

        // Step 4: Service selection screen
        await waitFor(element(by.text('Plumbing Services')))
            .toBeVisible()
            .withTimeout(2000);

        // Step 5: Select Medium variant (₹550)
        await element(by.text('Medium ₹550')).tap();
        await detoxExpect(element(by.id('variant.selected.med'))).toBeVisible();

        // Step 6: Location auto-filled
        await detoxExpect(element(by.id('location.input'))).toHaveText(/Narnaund/);

        // Step 7: Add optional details
        await element(by.id('details.textarea')).typeText('Bathroom sink leaking, need urgent fix');

        // Step 8: Post live request
        await element(by.text('POST LIVE REQUEST')).tap();

        // Step 9: Broadcasting screen
        await waitFor(element(by.text('Broadcasting')))
            .toBeVisible()
            .withTimeout(2000);

        // Step 10: Viewer count updates
        await waitFor(element(by.id('viewer.count')))
            .toBeVisible()
            .withTimeout(3000);

        // Step 11: Provider accepts (mock - wait 10 seconds)
        await waitFor(element(by.text('ACCEPTED')))
            .toBeVisible()
            .withTimeout(15000);

        await detoxExpect(element(by.text('Neeraj Kumar'))).toBeVisible();

        // Step 12: Provider arrives - OTP displayed
        await waitFor(element(by.id('otp.display')))
            .toBeVisible()
            .withTimeout(20000);

        // Step 13: Copy OTP
        await element(by.id('otp.copy')).tap();
        await detoxExpect(element(by.text('OTP Copied'))).toBeVisible();

        // Step 14: Service starts
        await waitFor(element(by.text('Service In Progress')))
            .toBeVisible()
            .withTimeout(10000);

        // Step 15: Service completes
        await waitFor(element(by.text('Service Complete')))
            .toBeVisible()
            .withTimeout(15000);

        // Step 16: Rating screen
        await waitFor(element(by.id('rating.screen')))
            .toBeVisible()
            .withTimeout(3000);

        // Step 17: Select 5 stars (swipe gesture)
        await element(by.id('rating.stars')).swipe('left', 'fast', 0.5);
        await detoxExpect(element(by.id('rating.5stars'))).toBeVisible();

        // Step 18: Add review
        await element(by.id('review.textarea')).typeText('Excellent service! Very professional.');

        // Step 19: Submit rating
        await element(by.text('Submit')).tap();

        // Step 20: Success message
        await waitFor(element(by.text('Thank you for your feedback')))
            .toBeVisible()
            .withTimeout(2000);

        // Step 21: Navigate to bookings history
        await element(by.id('tab.bookings')).tap();

        // Step 22: Verify booking appears in history
        await detoxExpect(element(by.text('Plumbing Medium'))).toBeVisible();
    });

    it('should handle GPS location detection', async () => {
        // Mock different location
        await device.setLocation({
            lat: 28.6139,
            lon: 77.2090 // Delhi
        });

        await device.reloadReactNative();

        // Location should update
        await waitFor(element(by.text(/Delhi/)))
            .toBeVisible()
            .withTimeout(10000);
    });

    it('should allow manual location editing', async () => {
        await element(by.id('service.electrician')).tap();

        // Clear auto-filled location
        await element(by.id('location.input')).clearText();

        // Type custom location
        await element(by.id('location.input')).typeText('Custom Address, Narnaund');

        await detoxExpect(element(by.id('location.input'))).toHaveText('Custom Address, Narnaund');
    });

    it('should validate required fields', async () => {
        await element(by.id('service.ac-repair')).tap();

        // Try to post without selecting variant
        await element(by.text('POST LIVE REQUEST')).tap();

        // Error message should appear
        await detoxExpect(element(by.text('Please select a service variant'))).toBeVisible();

        // Select variant
        await element(by.text('Basic ₹350')).tap();

        // Clear location
        await element(by.id('location.input')).clearText();

        // Try to post without location
        await element(by.text('POST LIVE REQUEST')).tap();

        // Error message
        await detoxExpect(element(by.text('Please provide your location'))).toBeVisible();
    });

    it('should handle service cancellation', async () => {
        // Create request
        await element(by.id('service.plumber')).tap();
        await element(by.text('Basic ₹350')).tap();
        await element(by.text('POST LIVE REQUEST')).tap();

        // On broadcasting screen
        await waitFor(element(by.text('Broadcasting')))
            .toBeVisible()
            .withTimeout(2000);

        // Cancel request
        await element(by.text('Cancel Request')).tap();

        // Confirm cancellation
        await element(by.text('Yes, Cancel')).tap();

        // Should return to home
        await waitFor(element(by.id('home-screen')))
            .toBeVisible()
            .withTimeout(2000);
    });

    it('should display booking history with filters', async () => {
        await element(by.id('tab.bookings')).tap();

        // Active tab selected by default
        await detoxExpect(element(by.id('tab.active'))).toBeVisible();

        // Switch to Past tab
        await element(by.id('tab.past')).tap();

        // Past bookings should be visible
        await detoxExpect(element(by.text('Completed')).atIndex(0)).toBeVisible();

        // Tap on a booking
        await element(by.id('booking.item')).atIndex(0).tap();

        // Booking details screen
        await waitFor(element(by.id('booking.details')))
            .toBeVisible()
            .withTimeout(2000);
    });
});

describe('Mobile Client - Maps Integration', () => {
    it('should show real-time provider location on map', async () => {
        // Create request and wait for acceptance
        await element(by.id('service.plumber')).tap();
        await element(by.text('Medium ₹550')).tap();
        await element(by.text('POST LIVE REQUEST')).tap();

        // Wait for provider acceptance
        await waitFor(element(by.text('ACCEPTED')))
            .toBeVisible()
            .withTimeout(15000);

        // Map should be visible
        await detoxExpect(element(by.id('provider.map'))).toBeVisible();

        // Provider marker should be on map
        await detoxExpect(element(by.id('provider.marker'))).toBeVisible();

        // ETA should be displayed
        await detoxExpect(element(by.id('provider.eta'))).toBeVisible();
    });

    it('should allow pin drop for location selection', async () => {
        await element(by.id('service.electrician')).tap();

        // Open location picker
        await element(by.id('location.picker')).tap();

        // Map should open
        await waitFor(element(by.id('location.map')))
            .toBeVisible()
            .withTimeout(2000);

        // Drag map to adjust pin
        await element(by.id('location.map')).swipe('down', 'slow', 0.3);

        // Confirm location
        await element(by.id('confirm.location')).tap();

        // Address should update
        await detoxExpect(element(by.id('location.input'))).not.toHaveText('');
    });
});

describe('Mobile Client - Edge Cases', () => {
    it('should handle no GPS permission', async () => {
        await device.launchApp({
            permissions: { location: 'never' },
            newInstance: true
        });

        // Should show default location or prompt
        await waitFor(element(by.text('Enable Location')))
            .toBeVisible()
            .withTimeout(5000);
    });

    it('should handle network offline', async () => {
        // Disable network
        await device.setNetworkConditions({
            offline: true
        });

        await element(by.id('service.plumber')).tap();
        await element(by.text('Medium ₹550')).tap();
        await element(by.text('POST LIVE REQUEST')).tap();

        // Error message
        await waitFor(element(by.text('No internet connection')))
            .toBeVisible()
            .withTimeout(3000);

        // Re-enable network
        await device.setNetworkConditions({
            offline: false
        });
    });

    it('should handle service unavailable in location', async () => {
        // Mock location where service is paused
        await device.setLocation({
            lat: 19.0760,
            lon: 72.8777 // Mumbai (service paused)
        });

        await device.reloadReactNative();

        await element(by.id('service.plumber')).tap();

        // Service unavailable message
        await waitFor(element(by.text('Service unavailable in your area')))
            .toBeVisible()
            .withTimeout(3000);
    });
});
