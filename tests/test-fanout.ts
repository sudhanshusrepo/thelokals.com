
// tests/test-fanout.ts
// Use ts-node to run this if env allows, or just reference logic.

import { liveBookingService } from '../packages/platform-core/src/services/liveBookingService';

async function testFanout() {
    console.log("Starting Fan-out Test...");

    // Mock Booking Data
    const mockBooking = {
        clientId: "test-user-uuid",
        serviceId: "test-service-category-uuid",
        requirements: {
            location: { lat: 12.9716, lng: 77.5946 }, // Bangalore
            option: { id: "item-id" }
        }
    };

    try {
        console.log("1. Calling createAndBroadcastBooking...");
        const result = await liveBookingService.createAndBroadcastBooking(mockBooking);
        console.log("Booking Created:", result.id);

        // At this point:
        // - Booking row exists
        // - Provider rows found (simulated)
        // - Booking Requests rows inserted

        console.log("Fan-out logic executed. Check database tables 'bookings' and 'booking_requests'.");

    } catch (e) {
        console.error("Test Failed:", e);
    }
}

// testFanout(); 
