
import { supabase } from './supabase';
import { Booking, BookingStatus, LiveBooking, Service, DbBookingRequest } from '../types';
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
      'EXPIRED': []
    };

    const allowed = allowedTransitions[currentStatus] || [];
    return allowed.includes(newStatus);
  },

  /**
   * Verifies the booking OTP.
   */
  async verifyOTP(bookingId: string, otp: string): Promise<boolean> {
    const { data, error } = await supabase.rpc('verify_booking_otp', {
      p_booking_id: bookingId,
      p_otp_code: otp
    });

    if (error) {
      logger.error('Error verifying OTP', { error, bookingId });
      throw error;
    }
    return data;
  },

  /**
   * Creates a new AI-enhanced booking.
   */
  async createAIBooking(params: {
    clientId: string;
    serviceCategory: string;
    serviceCategoryId?: string;
    serviceItemId?: string;
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
      p_user_id: params.clientId,
      p_service_category: params.serviceCategory,
      p_requirements: params.requirements,
      p_ai_checklist: params.aiChecklist,
      p_estimated_cost: params.estimatedCost,
      p_location: `POINT(${params.location.lng} ${params.location.lat})`,
      p_address: params.address,
      p_notes: params.notes || null,
      p_service_category_id: params.serviceCategoryId || null,
      p_service_item_id: params.serviceItemId || null,
      p_delivery_mode: params.deliveryMode || 'LOCAL',
    });

    if (error) {
      console.error('CRITICAL: Error creating AI booking via RPC', {
        code: error.code,
        msg: error.message,
        details: error.details,
        hint: error.hint,
        params
      });
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
   * Retrieves a specific booking with full details (provider, etc).
   */
  async getBookingDetails(bookingId: string): Promise<Booking> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        providers(*),
        service_categories(name)
      `)
      .eq('id', bookingId)
      .single();

    if (error) {
      logger.error('Error fetching booking details', { error, bookingId });
      throw error;
    }

    // Map the nested provider data to match WorkerProfile structure
    return {
      ...data,
      worker: data.providers ? {
        id: data.providers.id,
        name: data.providers.full_name || data.providers.name || 'Provider',
        category: data.providers.services?.[0] || 'General',
        description: data.providers.description || '',
        price: 0,
        priceUnit: 'hr',
        rating: 4.5,
        status: data.providers.is_active ? 'AVAILABLE' : 'OFFLINE',
        imageUrl: data.providers.avatar_url,
        expertise: data.providers.services,
        reviewCount: 0,
        isVerified: true,
        location: {
          lat: data.providers.location?.coordinates?.[1] || 0,
          lng: data.providers.location?.coordinates?.[0] || 0
        }
      } : undefined,
      serviceName: data.service_categories?.name
    } as any;
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
      }, (payload: any) => {
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
        provider_id: workerId,
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
        providers(*),
        service_categories(name)
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
        name: b.providers.full_name || b.providers.name || 'Provider',
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
      } : undefined,
      serviceName: b.service_categories?.name
    }));
  },

  /**
   * Retrieves all bookings for a specific worker.
   */
  async getWorkerBookings(workerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('provider_id', workerId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching worker bookings', { error, workerId });
      throw error;
    }
    return data || [];
  },

  /**
   * Retrieves active booking requests for a specific provider.
   */
  async getProviderRequests(providerId: string): Promise<DbBookingRequest[]> {
    const { data, error } = await supabase
      .from('booking_requests')
      .select(`
        *,
        bookings:booking_id (*)
      `)
      .eq('provider_id', providerId)
      .eq('status', 'PENDING')
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching provider requests', { error, providerId });
      throw error;
    }

    // Transform to match structure if needed, or return as is
    return data as any as DbBookingRequest[];
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
        provider_id: workerId,
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
   * Calculates platform commission based on provider tier.
   * Tier 1: 12%
   * Tier 2/3: 15%
   */
  async calculateCommission(providerId: string, amount: number): Promise<{ commission: number; netAmount: number; tier: string }> {
    const { data: provider, error } = await supabase
      .from('providers')
      .select('tier')
      .eq('id', providerId)
      .single();

    if (error || !provider) {
      logger.warn('Could not fetch provider tier, defaulting to Tier 3 (15%)', { providerId, error });
      // Default to 15%
      const commission = amount * 0.15;
      return { commission, netAmount: amount - commission, tier: 'tier3' };
    }

    const rate = provider.tier === 'tier1' ? 0.12 : 0.15;
    const commission = amount * rate;

    return {
      commission: Number(commission.toFixed(2)),
      netAmount: Number((amount - commission).toFixed(2)),
      tier: provider.tier
    };
  },

  /**
   * Process payment for a booking and record earnings
   */
  async processPayment(bookingId: string) {
    // 1. Fetch booking details to get provider and amount
    const booking = await this.getBooking(bookingId);
    if (!booking || !booking.provider_id || !booking.final_cost) {
      throw new Error('Invalid booking data for payment processing');
    }

    // 2. Calculate Commission
    const { commission, netAmount, tier } = await this.calculateCommission(booking.provider_id, booking.final_cost);

    // 3. Update Booking Payment Status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({
        payment_status: 'PAID',
        platform_commission: commission,
        provider_earnings: netAmount
      })
      .eq('id', bookingId);

    if (bookingError) {
      logger.error('Error processing payment', { error: bookingError, bookingId });
      throw bookingError;
    }

    // 4. Update Provider Earnings (Ledger)
    const { error: earningsError } = await supabase
      .rpc('update_provider_earnings', {
        p_provider_id: booking.provider_id,
        p_amount: netAmount
      });

    if (earningsError) {
      logger.error('Error updating provider earnings ledger', { error: earningsError, providerId: booking.provider_id });
      // Non-blocking, can be reconciled later
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
        user_id: clientId,
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
   * Accepts a live booking request (Provider Side).
   */
  async acceptBooking(requestId: string, providerId: string): Promise<boolean> {
    const { data, error } = await supabase
      .rpc('accept_live_booking', {
        p_request_id: requestId,
        p_provider_id: providerId
      });

    if (error) {
      logger.error('Error accepting booking request', { error, requestId, providerId });
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
  },

  /**
   * Retrieves aggregated stats for a provider.
   */
  async getProviderStats(providerId: string) {
    // 1. Get Completed Jobs Count
    const { count: completedCount, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('provider_id', providerId)
      .eq('status', 'COMPLETED');

    // 2. Get Total Earnings
    // Note: In a real app, we'd sum a transaction ledger.
    // Here we sum 'provider_earnings' from bookings.
    const { data: earningsData, error: earningsError } = await supabase
      .from('bookings')
      .select('provider_earnings')
      .eq('provider_id', providerId)
      .eq('status', 'COMPLETED')
      .eq('payment_status', 'PAID');

    let totalEarnings = 0;
    if (earningsData) {
      totalEarnings = earningsData.reduce((sum: number, b: any) => sum + (b.provider_earnings || 0), 0);
    }

    if (countError || earningsError) {
      logger.error('Error fetching provider stats', { countError, earningsError, providerId });
    }

    // 3. Get Rating (Mock or from Providers table)
    // For now, return a static high rating or fetch if available
    const rating = 4.8;

    return {
      totalEarnings,
      jobsCompleted: completedCount || 0,
      rating: rating,
      completionRate: 98 // Hardcoded for now
    };
  },

  /**
   * Retrieves all available service categories.
   */
  async getServiceCategories() {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('is_enabled', true)
      .order('sort_order', { ascending: true });

    if (error) {
      // Fallback for demo if table missing or RLS issue
      logger.warn('Error fetching service categories, returning defaults', { error });
      return [
        { id: '1', name: 'Cleaning', icon: 'Sparkles' },
        { id: '2', name: 'Plumbing', icon: 'Wrench' },
        { id: '3', name: 'Electrician', icon: 'Zap' },
        { id: '4', name: 'Painting', icon: 'Paintbrush' },
      ];
    }
    return data;
  },

  /**
   * Retrieves all service items for a category (Public).
   */
  async getServiceItems(categoryId: string) {
    const { data, error } = await supabase
      .from('service_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('base_price', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) logger.error('Error fetching service items', { error, categoryId });
      // Fallback mocks
      return [
        { id: '1', name: 'Basic Inspection', base_price: 249, description: 'Diagnosis & Minor Fixes', price_unit: 'visit' },
        { id: '2', name: 'Standard Service', base_price: 499, description: 'Deep Cleaning & Maintenance', price_unit: 'fixed' },
        { id: '3', name: 'Premium Service', base_price: 799, description: 'Advanced Repair & Parts', price_unit: 'fixed' },
      ] as any[];
    }
    return data;
  },

  /**
   * Retrieves a single service category by ID.
   */
  async getServiceCategory(id: string) {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching service category', { error, id });
      // Fallback
      return { id, name: 'Service', icon: 'Tool' };
    }
    return data;
  }
};
