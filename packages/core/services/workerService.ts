import { supabase } from './supabase';
import { WorkerProfile } from '../types';

export const workerService = {
  async getWorkers(): Promise<WorkerProfile[]> {
    const { data, error } = await supabase
      .from('workers')
      .select('*');

    if (error) {
      console.error("Error fetching workers:", error);
      throw error;
    }

    return data.map((w: any) => ({ ...w, location: { lat: w.location_lat, lng: w.location_lng } }));
  }
};
