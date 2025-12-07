
import { supabase } from './supabase';
import { Booking, BookingStatus, LiveBooking, Service } from '../types';
import { DbNearbyProviderResponse } from '../databaseTypes';
import { logger } from './logger';

/**
 * @module bookingService
 * @description A service for managing bookings, payments, and reviews.
 */
export const bookingService = {
  /**
   * Validates if a status transition is allowed.
   */
  validateTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
    const allowedTransitions: Record<string, string[]> = {
      'REQUESTED': ['PENDING', 'CANCELLED'],
      'PENDING': ['CONFIRMED', 'CANCELLED', 'EXPIRED'],
      'CONFIRMED': ['EN_ROUTE', 'IN_PROGRESS', 'CANCELLED'],
      'EN_ROUTE': ['IN_PROGRESS', 'CANCELLED'],
      'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
      'COMPLETED': [],
      'CANCELLED': [],
      'EXPIRED': []
    };

    const allowed = allowedTransitions[currentStatus] || [];
    return allowed.includes(newStatus);
  },

  /**
   * Creates a new AI-enhanced booking.
   */
  async createAIBooking(params: {
    clientId: string;
    serviceCategory: string;
    serviceCategoryId?: string;
    deliveryMode?: 'LOCAL' | 'ONLINE';
    requirements: object;
    aiChecklist: string[];
    estimatedCost: number;
    location: { lat: number; lng: number };
    address: object;
    notes?: string;
  }): Promise<{ bookingId: string }> {
    // Check service availability before creating booking
    const city = (params.address as any)?.city;
    if (city) {
      const isAvailable = await this.checkServiceAvailability(params.serviceCategory, city);
      if (!isAvailable) {
        throw new Error(`${params.serviceCategory} is currently unavailable in ${city}. Please try again later or contact support.`);
      }
    }

    const { data, error } = await supabase.rpc('create_ai_booking', {
      p_client_id: params.clientId,
      p_service_category: params.serviceCategory,
      p_requirements: params.requirements,
      p_ai_checklist: params.aiChecklist,
      p_estimated_cost: params.estimatedCost,
      p_location: `POINT(${params.location.lng} ${params.location.lat})`,
      p_address: params.address,
      p_notes: params.notes,
      p_service_category_id: params.serviceCategoryId,
      p_delivery_mode: params.deliveryMode || 'LOCAL',
    });

    if (error) {
      logger.error('Error creating AI booking', { error, params });
      throw error;
    }
    return { bookingId: data };
  },

  /**
   * Retrieves a specific booking by its ID.
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
   */
  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        providers(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user bookings', { error, userId });
      throw error;
    }

    // Map the nested provider data to match WorkerProfile structure
    return (data as any[]).map((b) => ({
      ...b,
      worker: b.providers ? {
        id: b.providers.id,
        name: b.providers.name || 'Provider',
        category: b.providers.services?.[0] || 'General',
        description: b.providers.description || '',
        price: 0,
        priceUnit: 'hr',
        rating: 4.5,
        status: b.providers.is_active ? 'AVAILABLE' : 'OFFLINE',
        imageUrl: b.providers.avatar_url,
        expertise: b.providers.services,
        reviewCount: 0,
        isVerified: true,
        location: {
          lat: b.providers.location?.coordinates?.[1] || 0,
          lng: b.providers.location?.coordinates?.[0] || 0
        }
      } : undefined
    }));
  },

  /**
   * Retrieves all bookings for a specific worker.
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
   */
  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    // Validate Transition (Fetch current first)
    const currentBooking = await this.getBooking(bookingId);
    if (currentBooking && !this.validateTransition(currentBooking.status, status)) {
      logger.warn(`Invalid status transition from ${currentBooking.status} to ${status}`);
    }

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

    await this.updateBookingStatus(bookingId, 'COMPLETED');
  },

  /**
   * Process payment for a booking
   */
  async processPayment(bookingId: string) {
    const { error } = await supabase
      .from('bookings')
      .update({ payment_status: 'PAID' })
      .eq('id', bookingId);

    if (error) {
      logger.error('Error processing payment', { error, bookingId });
      throw error;
    }
  },

  /**
   * Finds nearby providers for a given service and location.
   */
  async findNearbyProviders(serviceId: string, lat: number, lng: number, distance: number): Promise<DbNearbyProviderResponse[]> {
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
    return data as DbNearbyProviderResponse[];
  },

  /**
   * Creates a new live booking request.
   * Simple wrapper for createAIBooking logic or direct insert if simpler.
   */
  async createLiveBooking(service: Service, clientId: string, requirements: object): Promise<LiveBooking> {
    const { data, error } = await supabase
      .from('bookings')
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
   * Accepts a booking (Provider Side).
   */
  async acceptBooking(bookingId: string, providerId: string): Promise<void> {
    const { data, error } = await supabase
      .rpc('accept_booking', { booking_id: bookingId, provider_id: providerId });

    if (error) {
      logger.error('Error accepting booking', { error, bookingId, providerId });
      throw error;
    }
    return data;
  },

  /**
   * Rejects a booking (Provider Side).
   */
  async rejectBooking(bookingId: string, providerId: string): Promise<void> {
    const { error } = await supabase
      .from('booking_requests')
      .update({ status: 'REJECTED' })
      .eq('booking_id', bookingId)
      .eq('provider_id', providerId);

    if (error) {
      logger.error('Error rejecting booking', { error, bookingId, providerId });
      throw error;
    }
  },

  /**
   * Checks if a service is available in a given location
   */
  async checkServiceAvailability(serviceCategoryId: string, city: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('service_availability')
      .select('status')
      .eq('service_category_id', serviceCategoryId)
      .eq('location_value', city)
      .eq('location_type', 'city')
      .single();

    if (error || !data) {
      return true;
    }

    return data.status === 'ENABLED';
  }
};
