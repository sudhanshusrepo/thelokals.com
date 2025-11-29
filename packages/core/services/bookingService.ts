
import { supabase } from './supabase';
import { Booking, BookingStatus, LiveBooking, LiveBookingStatus, Service } from '../types';
import { logger } from './logger';

/**
 * @module bookingService
 * @description A service for managing bookings, payments, and reviews.
 */
export const bookingService = {
  /**
   * Creates a new AI-enhanced booking.
   * @param {object} params - The booking parameters.
   * @returns {Promise<{ bookingId: string }>} The newly created booking ID.
   * @throws {Error} If the booking creation fails.
   */
  async createAIBooking(params: {
    clientId: string;
    serviceCategory: string;
    requirements: object;
    aiChecklist: string[];
    estimatedCost: number;
    location: { lat: number; lng: number };
    address: object;
    notes?: string;
  }): Promise<{ bookingId: string }> {
    const { data, error } = await supabase.rpc('create_ai_booking', {
      p_client_id: params.clientId,
      p_service_category: params.serviceCategory,
      p_requirements: params.requirements,
      p_ai_checklist: params.aiChecklist,
      p_estimated_cost: params.estimatedCost,
      p_location: `POINT(${params.location.lng} ${params.location.lat})`,
      p_address: params.address,
      p_notes: params.notes,
    });

    if (error) {
      logger.error('Error creating AI booking', { error, params });
      throw error;
    }
    return { bookingId: data };
  },

  /**
   * Retrieves a specific booking by its ID.
   * @param {string} bookingId - The ID of the booking to retrieve.
   * @returns {Promise<Booking>} The booking object.
   * @throws {Error} If the database query fails.
   */
  async getBooking(bookingId: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (error) {
      logger.error('Error fetching booking', { error, bookingId });
      throw error;
    }
    return data;
  },

  /**
   * Subscribes to real-time updates for a specific booking.
   * @param {string} bookingId - The ID of the booking to subscribe to.
   * @param {function} callback - The function to call with the updated booking data.
   * @returns {() => void} A function to unsubscribe from the channel.
   */
  subscribeToBookingUpdates(bookingId: string, callback: (booking: Booking) => void) {
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      }, (payload) => {
        callback(payload.new as Booking);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  },
  
  /**
   * Creates a new booking.
   * @param {string} workerId - The ID of the worker being booked.
   * @param {string} userId - The ID of the user making the booking.
   * @param {string} note - A note or special instructions for the booking.
   * @param {number} price - The total price of the booking.
   * @returns {Promise<Booking>} The newly created booking object.
   * @throws {Error} If the booking creation fails.
   */
  async createBooking(workerId: string, userId: string, note: string, price: number) {
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        worker_id: workerId,
        user_id: userId,
        status: 'pending',
        note: note,
        total_price: price,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating booking', { error, workerId, userId });
      throw error;
    }
    return data;
  },

  /**
   * Retrieves all bookings for a specific user.
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Booking[]>} A list of bookings for the user.
   * @throws {Error} If the database query fails.
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        workers(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user bookings', { error, userId });
      throw error;
    }

    // Map the nested worker data to match WorkerProfile structure
    return data.map((b: any) => ({
        ...b,
        worker: b.workers ? {
            ...b.workers,
            reviewCount: b.workers.review_count,
            experienceYears: b.workers.experience_years,
            priceUnit: b.workers.price_unit,
            imageUrl: b.workers.image_url,
            isVerified: b.workers.is_verified,
            location: {
                lat: b.workers.location_lat,
                lng: b.workers.location_lng
            }
        } : undefined
    }));
  },

  /**
   * Retrieves all bookings for a specific worker.
   * @param {string} workerId - The ID of the worker.
   * @returns {Promise<Booking[]>} A list of bookings for the worker.
   * @throws {Error} If the database query fails.
   */
  async getWorkerBookings(workerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching worker bookings', { error, workerId });
      throw error;
    }
    return data || [];
  },

  /**
   * Updates the status of a specific booking.
   * @param {string} bookingId - The ID of the booking to update.
   * @param {BookingStatus} status - The new status of the booking.
   * @throws {Error} If the database update fails.
   */
  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
    
    if (error) {
      logger.error('Error updating booking status', { error, bookingId, status });
      throw error;
    }
  },

  /**
   * Submits a review for a booking.
   * @param {string} bookingId - The ID of the booking being reviewed.
   * @param {string} workerId - The ID of the worker being reviewed.
   * @param {string} userId - The ID of the user submitting the review.
   * @param {number} rating - The rating given to the worker (e.g., 1-5).
   * @param {string} comment - A written comment for the review.
   * @throws {Error} If the review submission fails.
   */
  async submitReview(bookingId: string, workerId: string, userId: string, rating: number, comment: string) {
      const { error } = await supabase
        .from('reviews')
        .insert({
            booking_id: bookingId,
            worker_id: workerId,
            user_id: userId,
            rating,
            comment
        });
      
      if (error) {
        logger.error('Error submitting review', { error, bookingId, workerId });
        throw error;
      }

      // Ensure booking is marked as completed if it wasn't already (though flow usually ensures this)
      await this.updateBookingStatus(bookingId, 'completed');
  },

  // NEW LIVE BOOKING SYSTEM FUNCTIONS

  /**
   * Finds nearby providers for a given service and location.
   * @param {string} serviceId - The ID of the service.
   * @param {number} lat - The latitude of the user's location.
   * @param {number} lng - The longitude of the user's location.
   * @param {number} distance - The search radius in meters.
   * @returns {Promise<any[]>} A list of nearby providers.
   * @throws {Error} If the database query fails.
   */
  async findNearbyProviders(serviceId: string, lat: number, lng: number, distance: number): Promise<any[]> {
    const { data, error } = await supabase
      .rpc('find_nearby_providers', {
        service_id: serviceId,
        lat: lat,
        lng: lng,
        max_distance: distance,
      });

    if (error) {
      logger.error('Error finding nearby providers', { error, serviceId, lat, lng, distance });
      throw error;
    }
    return data;
  },

  /**
   * Creates a new live booking request.
   * @param {Service} service - The service being requested.
   * @param {string} clientId - The ID of the client making the request.
   * @param {object} requirements - The service-specific requirements.
   * @returns {Promise<LiveBooking>} The newly created live booking object.
   * @throws {Error} If the booking creation fails.
   */
  async createLiveBooking(service: Service, clientId: string, requirements: object): Promise<LiveBooking> {
    const { data, error } = await supabase
      .from('bookings') // Note: Using a single 'bookings' table for simplicity
      .insert({
        serviceId: service.id,
        clientId: clientId,
        status: 'REQUESTED',
        requirements: requirements,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating live booking', { error, service, clientId });
      throw error;
    }
    return data;
  },

  /**
   * Accepts a live booking.
   * @param {string} bookingId - The ID of the booking to accept.
   * @param {string} providerId - The ID of the provider accepting the booking.
   * @returns {Promise<LiveBooking>} The updated live booking object.
   * @throws {Error} If the booking acceptance fails.
   */
  async acceptLiveBooking(bookingId: string, providerId: string): Promise<LiveBooking> {
    const { data, error } = await supabase
      .rpc('accept_booking', { booking_id: bookingId, provider_id: providerId })

    if (error) {
      logger.error('Error accepting live booking', { error, bookingId, providerId });
      throw error;
    }
    return data;
  },

  /**
   * Updates the status of a live booking.
   * @param {string} bookingId - The ID of the booking to update.
   * @param {LiveBookingStatus} status - The new status of the booking.
   * @returns {Promise<LiveBooking>} The updated live booking object.
   * @throws {Error} If the booking status update fails.
   */
  async updateLiveBookingStatus(bookingId: string, status: LiveBookingStatus): Promise<LiveBooking> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      logger.error('Error updating live booking status', { error, bookingId, status });
      throw error;
    }
    return data;
  }
};
