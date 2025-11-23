
import { supabase } from './supabase';
import { WorkerProfile, WorkerCategory, WorkerStatus } from '../types';
import { MOCK_WORKERS } from '../constants';

export const workerService = {
  async getWorkers(): Promise<WorkerProfile[]> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*');

      if (error) {
        console.warn("Error fetching workers from DB, using mocks:", error.message);
        return MOCK_WORKERS;
      }

      if (!data || data.length === 0) {
        // If DB is empty, return mocks (in a real app, you might seed the DB)
        return MOCK_WORKERS;
      }

      // Transform DB structure to frontend structure if needed
      return data.map((w: any) => ({
        ...w,
        reviewCount: w.review_count,
        experienceYears: w.experience_years,
        priceUnit: w.price_unit,
        imageUrl: w.image_url,
        isVerified: w.is_verified,
        status: w.status || 'OFFLINE', // Default if missing
        location: {
            lat: w.location_lat,
            lng: w.location_lng
        }
      }));
    } catch (e) {
      console.error("Worker service error", e);
      return MOCK_WORKERS;
    }
  },

  async getWorkerById(id: string): Promise<WorkerProfile | undefined> {
    const workers = await this.getWorkers();
    return workers.find(w => w.id === id);
  },

  async updateWorkerStatus(workerId: string, status: WorkerStatus) {
    try {
        const { error } = await supabase
            .from('workers')
            .update({ status })
            .eq('id', workerId);
        
        // Update local mock if DB fails or is empty (for demo persistence in session)
        const mockIndex = MOCK_WORKERS.findIndex(w => w.id === workerId);
        if (mockIndex >= 0) {
            MOCK_WORKERS[mockIndex].status = status;
        }
        
        if (error) throw error;
    } catch (e) {
        console.warn("Failed to update status in DB (expected in demo mode w/o write policies), updating local mock:", e);
    }
  },

  async updateWorkerProfile(workerId: string, updates: Partial<WorkerProfile>) {
    // Map frontend keys to DB snake_case keys
    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.category !== undefined) dbPayload.category = updates.category;
    if (updates.price !== undefined) dbPayload.price = updates.price;
    if (updates.priceUnit !== undefined) dbPayload.price_unit = updates.priceUnit;
    if (updates.description !== undefined) dbPayload.description = updates.description;
    
    try {
        const { error } = await supabase
            .from('workers')
            .update(dbPayload)
            .eq('id', workerId);

        // Update local mock for immediate feedback in demo/offline mode
        const mockIndex = MOCK_WORKERS.findIndex(w => w.id === workerId);
        if (mockIndex >= 0) {
            MOCK_WORKERS[mockIndex] = { ...MOCK_WORKERS[mockIndex], ...updates };
        }

        if (error) throw error;
    } catch (e) {
         console.warn("Failed to update profile in DB (expected in demo mode), updating local mock:", e);
         // Fallback update local mock again just in case
         const mockIndex = MOCK_WORKERS.findIndex(w => w.id === workerId);
         if (mockIndex >= 0) {
             MOCK_WORKERS[mockIndex] = { ...MOCK_WORKERS[mockIndex], ...updates };
         }
    }
  }
};
