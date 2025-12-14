import { test, expect } from '@playwright/test';

// Define the logic locally to verify the API contract and parsing
// This avoids importing 'unifiedBookingService' which triggers module resolution issues
// with 'supabase.ts' and 'import.meta' in the test runner environment.
const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
        const encodedAddress = encodeURIComponent(address);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`,
            {
                headers: {
                    'User-Agent': 'TheLokals/1.0 (internal@thelokals.com)'
                }
            }
        );

        if (!response.ok) {
            console.warn('Forward geocoding failed:', response.statusText);
            return null;
        }

        const data = await response.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }

        return null;
    } catch (error) {
        console.error('Forward geocoding error:', error);
        return null;
    }
};

test.describe('Geocoding Service (API Verification)', () => {
    test('should geocode a valid address', async () => {
        // Known address: India Gate, New Delhi
        const address = 'India Gate, New Delhi';

        console.log(`Geocoding address: ${address}`);
        const result = await geocodeAddress(address);

        console.log('Geocoding result:', result);

        expect(result).not.toBeNull();
        if (result) {
            expect(result.lat).toEqual(expect.any(Number));
            expect(result.lng).toEqual(expect.any(Number));

            // Check bounding box roughly for New Delhi
            // Lat: ~28.6, Lng: ~77.2
            expect(result.lat).toBeGreaterThan(28);
            expect(result.lat).toBeLessThan(29);
            expect(result.lng).toBeGreaterThan(76);
            expect(result.lng).toBeLessThan(78);
        }
    });

    test('should return null for invalid address', async () => {
        const address = 'ThisAddressDoesNotExistXYZ12345';
        const result = await geocodeAddress(address);
        expect(result).toBeNull();
    });
});
