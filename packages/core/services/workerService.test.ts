
import { workerService } from './workerService';
import { WorkerCategory } from '../types';
import { supabase } from './supabase';

jest.mock('./supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(),
    })),
  },
}));

describe('workerService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWorkers', () => {
    it('should return a list of workers', async () => {
      const mockWorkers: any[] = [
        {
          id: '1',
          name: 'Test Worker 1',
          category: WorkerCategory.PLUMBER,
          description: 'A test worker',
          price: 100,
          priceUnit: 'hr',
          rating: 4.5,
          status: 'AVAILABLE',
          imageUrl: 'http://example.com/worker1.png',
          expertise: ['plumbing'],
          reviewCount: 10,
          isVerified: true,
          location_lat: 12.34,
          location_lng: 56.78,
        },
      ];

      const selectMock = jest.fn().mockResolvedValue({ data: mockWorkers, error: null });
      (supabase.from as jest.Mock).mockReturnValue({ select: selectMock });

      const workers = await workerService.getWorkers();

      expect(supabase.from).toHaveBeenCalledWith('workers');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(workers).toEqual(mockWorkers.map((w: any) => ({ ...w, location: { lat: w.location_lat, lng: w.location_lng } })));
    });
  });
});
