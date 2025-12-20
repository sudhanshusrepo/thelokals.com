import { workerService } from './workerService';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { WorkerCategory } from '../types';
import { supabase } from './supabase';

vi.mock('./supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('./logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

vi.mock('./bookingService', () => ({
  bookingService: {
    findNearbyProviders: vi.fn(),
  },
}));

describe('workerService', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getTopWorkers', () => {
    it('should return a list of top workers', async () => {
      const mockWorkers: any[] = [
        {
          id: '1',
          name: 'Test Worker 1',
          category: WorkerCategory.PLUMBER,
          description: 'A test worker',
          price_per_hour: 100,
          price_unit: 'hr',
          rating: 4.5,
          status: 'AVAILABLE',
          image_url: 'http://example.com/worker1.png',
          expertise: ['plumbing'],
          review_count: 10,
          is_verified: true,
          location_lat: 12.34,
          location_lng: 56.78,
          location: { coordinates: [56.78, 12.34], type: 'Point' }
        },
      ];

      const limitMock = vi.fn().mockResolvedValue({ data: mockWorkers, error: null });
      const orderMock = vi.fn(() => ({ limit: limitMock }));
      const selectMock = vi.fn(() => ({ order: orderMock }));
      (supabase.from as any).mockReturnValue({ select: selectMock });

      const workers = await workerService.getTopWorkers();

      expect(supabase.from).toHaveBeenCalledWith('providers');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(orderMock).toHaveBeenCalledWith('rating', { ascending: false });
      expect(limitMock).toHaveBeenCalledWith(20);
      expect(workers).toHaveLength(1);
      expect(workers[0].name).toBe('Test Worker 1');
    });
  });
});
