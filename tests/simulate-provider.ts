
// tests/simulate-provider.ts
import { liveBookingService } from '../packages/platform-core/src/services/liveBookingService';

const PROVIDER_ID = '00000000-0000-0000-0000-000000000001'; // Replace with actual Provider ID
const BOOKING_ID = process.argv[2]; // Pass booking ID as arg

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function simulate() {
    if (!BOOKING_ID) {
        console.error("Please provide BOOKING_ID as argument");
        return;
    }

    console.log(`Provider ${PROVIDER_ID} accepting booking ${BOOKING_ID}...`);

    try {
        // 1. Accept
        const res = await liveBookingService.acceptBooking(BOOKING_ID, PROVIDER_ID);
        console.log("Accept Response:", res);

        if (!res.success) {
            console.error("Failed to accept:", res.message);
            return;
        }

        console.log("Booking Accepted! Starting navigation simulation...");

        // 2. Simulate Movement (Mumbai Center -> outward)
        let lat = 19.0760;
        let lng = 72.8777;

        for (let i = 0; i < 20; i++) {
            lat += 0.0001; // Move slightly North
            lng += 0.0001; // Move slightly East

            console.log(`Broadcasting location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);

            await liveBookingService.broadcastProviderLocation(BOOKING_ID, { lat, lng });

            await sleep(3000); // Wait 3s
        }

        console.log("Simulation complete.");

    } catch (e) {
        console.error("Simulation failed:", e);
    }
}

simulate();
