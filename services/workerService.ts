
import { supabase } from './supabase';
import { WorkerProfile, WorkerCategory, WorkerStatus } from '../types';

export const workerService = {
  async getWorkers(): Promise<WorkerProfile[]> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select('*');

      if (error) {
        console.error("Error fetching workers from DB:", error.message);
        throw error;
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
      return [];
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
        
        if (error) throw error;
    } catch (e) {
        console.warn("Failed to update status in DB:", e);
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

        if (error) throw error;
    } catch (e) {
         console.warn("Failed to update profile in DB:", e);
    }
  }
};
