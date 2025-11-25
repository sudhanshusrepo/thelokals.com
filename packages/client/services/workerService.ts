
import { supabase } from './supabase';
import { WorkerProfile, WorkerCategory, WorkerStatus } from '../types';

const selectQuery = `
    id, 
    name, 
    category, 
    description, 
    price, 
    price_unit,
    rating,
    status,
    image_url,
    expertise,
    review_count,
    experience_years,
    is_verified,
    location_lat,
    location_lng
`;

// Helper to transform worker data from DB to frontend structure
const transformWorker = (worker: any): WorkerProfile => ({
  id: worker.id,
  name: worker.name,
  category: worker.category,
  description: worker.description,
  price: worker.price,
  priceUnit: worker.price_unit,
  rating: worker.rating,
  status: worker.status || 'OFFLINE',
  imageUrl: worker.image_url,
  expertise: worker.expertise,
  reviewCount: worker.review_count,
  experienceYears: worker.experience_years,
  isVerified: worker.is_verified,
  location: {
    lat: worker.location_lat,
    lng: worker.location_lng,
  },
});

export const workerService = {
  async getWorkers(): Promise<WorkerProfile[]> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select(selectQuery);

      if (error) {
        console.error("Error fetching workers from DB:", error.message);
        throw error;
      }

      return data.map(transformWorker);
    } catch (e) {
      console.error("Worker service error", e);
      return [];
    }
  },

  async getWorkerById(id: string): Promise<WorkerProfile | null> {
    try {
      const { data, error } = await supabase
        .from('workers')
        .select(selectQuery)
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
            console.log(`Worker with id ${id} not found.`);
            return null;
        }
        console.error(`Error fetching worker with id ${id} from DB:`, error.message);
        throw error;
      }
      
      return data ? transformWorker(data) : null;
    } catch (e) {
      console.error("Worker service error", e);
      return null;
    }
  },

  async updateWorkerStatus(workerId: string, status: WorkerStatus) {
    if (!workerId || !status) {
        throw new Error("workerId and status are required.");
    }

    try {
        const { error } = await supabase
            .from('workers')
            .update({ status })
            .eq('id', workerId);
        
        if (error) throw error;
    } catch (e) {
        console.error("Failed to update status in DB:", e);
        throw e;
    }
  },

  async updateWorkerProfile(workerId: string, updates: Partial<WorkerProfile>) {
    if (!workerId || !updates) {
        throw new Error("workerId and updates are required.");
    }
      
    const dbPayload: any = {};
    if (updates.name !== undefined) dbPayload.name = updates.name;
    if (updates.category !== undefined) dbPayload.category = updates.category;
    if (updates.price !== undefined) dbPayload.price = updates.price;
    if (updates.priceUnit !== undefined) dbPayload.price_unit = updates.priceUnit;
    if (updates.description !== undefined) dbPayload.description = updates.description;
    if (updates.location !== undefined) {
        dbPayload.location_lat = updates.location.lat;
        dbPayload.location_lng = updates.location.lng;
    }
    if (updates.imageUrl !== undefined) dbPayload.image_url = updates.imageUrl;
    if (updates.expertise !== undefined) dbPayload.expertise = updates.expertise;
    if (updates.experienceYears !== undefined) dbPayload.experience_years = updates.experienceYears;
    if (updates.isVerified !== undefined) dbPayload.is_verified = updates.isVerified;

    try {
        const { error } = await supabase
            .from('workers')
            .update(dbPayload)
            .eq('id', workerId);

        if (error) throw error;
    } catch (e) {
         console.error("Failed to update profile in DB:", e);
         throw e;
    }
  }
};
