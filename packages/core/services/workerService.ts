
import { supabase } from './supabase';
import { WorkerProfile, WorkerCategory, WorkerStatus } from '../types';
import { logger } from './logger';
import { bookingService } from './bookingService';
import { DatabaseWorker, DbNearbyProviderResponse } from '../databaseTypes';

/**
 * @module workerService
 * @description A service for managing worker profiles and availability.
 */
export const workerService = {
  /**
   * Retrieves a list of top-rated workers, optionally filtered by location and service.
   * @param {number} [lat] - The latitude for location-based filtering.
   * @param {number} [lng] - The longitude for location-based filtering.
   * @param {string} [serviceId] - The ID of the service for filtering.
   * @returns {Promise<WorkerProfile[]>} A list of top-rated worker profiles.
   * @throws {Error} If there is a problem fetching the data.
   */
  async getTopWorkers(lat?: number, lng?: number, serviceId?: string): Promise<WorkerProfile[]> {
    if (lat && lng && serviceId) {
      // Use the new booking service function to find nearby providers
      const nearby = await bookingService.findNearbyProviders(serviceId, lat, lng, 5000); // 5km radius

      // Map DbNearbyProviderResponse to WorkerProfile
      // Note: Some fields are missing in DbNearbyProviderResponse, so we use defaults
      return nearby.map((p: DbNearbyProviderResponse) => ({
        id: p.id,
        name: p.name,
        category: p.category as WorkerCategory, // Assuming category matches enum
        description: '', // Missing in nearby response
        price: p.price,
        priceUnit: 'service', // Default
        rating: p.rating,
        status: 'AVAILABLE' as WorkerStatus, // Default
        imageUrl: p.image_url,
        expertise: [],
        reviewCount: p.review_count,
        isVerified: false, // Default
        location: {
          lat: p.lat,
          lng: p.lng
        }
      }));
    } else {
      const { data, error } = await supabase
        .from('workers')
        .select('*')
        .order('rating', { ascending: false })
        .limit(20);

      if (error) {
        logger.error('Error fetching top workers', { error });
        throw error;
      }
      return (data as unknown as DatabaseWorker[]).map(this.mapToWorkerProfile);
    }
  },

  /**
   * Retrieves the full profile of a specific worker.
   * @param {string} workerId - The ID of the worker.
   * @returns {Promise<WorkerProfile | null>} The worker's profile or null if not found.
   * @throws {Error} If there is a problem fetching the data.
   */
  async getWorkerProfile(workerId: string): Promise<WorkerProfile | null> {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single();

    if (error) {
      logger.error('Error fetching worker profile', { error, workerId });
      throw error;
    }

    if (!data) return null;

    return this.mapToWorkerProfile(data as unknown as DatabaseWorker);
  },

  /**
   * Maps a database worker object to a WorkerProfile object.
   * @param {DatabaseWorker} w - The database worker object.
   * @returns {WorkerProfile} The mapped WorkerProfile object.
   */
  mapToWorkerProfile(w: DatabaseWorker): WorkerProfile {
    return {
      id: w.id,
      name: w.name,
      description: w.description,
      category: w.category as WorkerCategory,
      expertise: w.expertise || [],
      rating: w.rating,
      reviewCount: w.review_count,
      // experienceYears: w.experience_years || 0, // Removed as it's not in WorkerProfile type
      price: w.price || w.price_per_hour || 0,
      priceUnit: w.price_unit,
      status: w.status as WorkerStatus,
      imageUrl: w.image_url,
      isVerified: w.is_verified,
      location: {
        lat: w.location_lat,
        lng: w.location_lng
      }
    };
  }
};
