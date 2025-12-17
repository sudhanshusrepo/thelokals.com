import { geoService } from './geoService';
import { supabase } from './supabase';

jest.mock('./supabase', () => ({
    supabase: {
        rpc: jest.fn()
    }
}));

describe('geoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getLocationId', () => {
        it('should return location ID when RPC returns data', async () => {
            const mockId = '123-abc';
            (supabase.rpc as any).mockResolvedValue({ data: mockId, error: null });

            const result = await geoService.getLocationId(12.9716, 77.5946);
            expect(result).toBe(mockId);
            expect(supabase.rpc).toHaveBeenCalledWith('get_location_from_coords', {
                p_lat: 12.9716,
                p_lng: 77.5946
            });
        });

        it('should return null when RPC returns null', async () => {
            (supabase.rpc as any).mockResolvedValue({ data: null, error: null });

            const result = await geoService.getLocationId(0, 0);
            expect(result).toBeNull();
        });

        it('should return null on error', async () => {
            (supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'RPC Error' } });

            // Spy on console.error to avoid cluttering test output
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

            const result = await geoService.getLocationId(0, 0);
            expect(result).toBeNull();
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });
    });

    describe('calculateDistanceKm', () => {
        it('should calculate precise distance', () => {
            const loc1 = { lat: 12.9716, lng: 77.5946 }; // Bangalore
            const loc2 = { lat: 13.0827, lng: 80.2707 }; // Chennai

            const dist = geoService.calculateDistanceKm(loc1, loc2);
            // Approx 290km
            expect(dist).toBeGreaterThan(280);
            expect(dist).toBeLessThan(300);
        });
    });
});
