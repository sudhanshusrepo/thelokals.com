
import { workerService } from './workerService';
import { WorkerCategory } from '../types';
import { supabase } from './supabase';

jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(),
        })),
      })),
    })),
  },
}));

jest.mock('./logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

jest.mock('./bookingService', () => ({
  bookingService: {
    findNearbyProviders: jest.fn(),
  },
}));

describe('workerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
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
        },
      ];

      const limitMock = jest.fn().mockResolvedValue({ data: mockWorkers, error: null });
      const orderMock = jest.fn(() => ({ limit: limitMock }));
      const selectMock = jest.fn(() => ({ order: orderMock }));
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

      const workers = await workerService.getTopWorkers();

      expect(supabase.from).toHaveBeenCalledWith('workers');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(orderMock).toHaveBeenCalledWith('rating', { ascending: false });
      expect(limitMock).toHaveBeenCalledWith(20);
      expect(workers).toHaveLength(1);
      expect(workers[0].name).toBe('Test Worker 1');
    });
  });
});
