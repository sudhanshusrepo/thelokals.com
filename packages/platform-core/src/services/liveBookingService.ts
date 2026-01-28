import { supabase } from './supabase';
import { LiveBooking, NearbyProviderResponse } from '../types';
import { logger } from './logger';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

const GEOGRAPHY_PROXIMITY_THRESHOLD = 10000; // 10km in meters

/**
 * @module liveBookingService
 * @description Handles real-time booking operations, including finding nearby providers, creating booking requests, and managing real-time subscriptions.
 */
export const liveBookingService = {
  /**
   * Finds nearby providers for a given booking.
   * @param {LiveBooking} booking - The booking to find providers for.
   * @returns {Promise<NearbyProviderResponse[]>} A list of nearby providers.
   */
  async findNearbyProviders(booking: LiveBooking): Promise<NearbyProviderResponse[]> {
    const { data, error } = await supabase.rpc('find_nearby_providers', {
      lat: (booking.requirements as any)?.location?.lat,
      lng: (booking.requirements as any)?.location?.lng,
      service_id: booking.serviceId,
      max_distance: GEOGRAPHY_PROXIMITY_THRESHOLD
    });

    if (error) {
      logger.error('Error finding nearby providers', { error, booking });
      throw error;
    }
    return data as NearbyProviderResponse[] || [];
  },

  /**
   * Creates a new live booking.
   * @param {Partial<LiveBooking>} bookingData - The booking data.
   * @returns {Promise<LiveBooking>} The created booking.
   */
  async createLiveBooking(bookingData: Partial<LiveBooking>): Promise<LiveBooking> {
    const requirements = bookingData.requirements as any;
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        user_id: bookingData.clientId,
        service_category: bookingData.serviceId, // Mapping serviceId to category for now
        booking_type: 'LIVE',
        status: 'PENDING', // Initial status in DB
        requirements: bookingData.requirements,
        location: `POINT(${requirements?.location?.lng} ${requirements?.location?.lat})`,
        service_item_id: requirements?.option?.id,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating live booking', { error, bookingData });
      throw error;
    }

    // Map DB response to LiveBooking type
    return {
      id: data.id,
      clientId: data.user_id,
      serviceId: data.service_category,
      providerId: data.provider_id,
      status: 'REQUESTED', // Client-side status mapping
      requirements: data.requirements,
      otp: '', // OTP generated later
      createdAt: data.created_at,
      acceptedAt: null,
      startedAt: data.started_at,
      completedAt: data.completed_at
    } as LiveBooking;
  },

  /**
   * Creates booking requests for a list of providers.
   * @param {string} bookingId - The ID of the booking.
   * @param {string[]} providerIds - A list of provider IDs to create requests for.
   * @throws {Error} If the insert fails.
   */
  async createBookingRequests(bookingId: string, providerIds: string[]) {
    // strict remote procedure call for atomic/bulk insertion
    const { error } = await supabase.rpc('create_booking_requests', {
      p_booking_id: bookingId,
      p_provider_ids: providerIds
    });

    if (error) {
      logger.error('Error creating booking requests', { error, bookingId, providerIds });
      throw error;
    }
  },

  /**
   * Orchestrates the search: Finds providers and sends requests.
   */
  async startSearching(booking: LiveBooking): Promise<void> {
    // 1. Find Nearby
    const providers = await this.findNearbyProviders(booking);
    if (!providers || providers.length === 0) {
       throw new Error("No nearby providers found");
    }

    const providerIds = providers.map(p => p.provider_id);

    // 2. Create Requests
    await this.createBookingRequests(booking.id, providerIds);
  },

  /**
   * Sends notifications to a list of providers.
   * This is a placeholder for the actual FCM implementation.
   * @param {string[]} providerIds - A list of provider IDs to send notifications to.
   * @param {LiveBooking} booking - The booking to notify providers about.
   */
  async sendNotifications(providerIds: string[], booking: LiveBooking) {
    logger.info('Sending notifications to providers', { providerIds, booking });
    // In a real implementation, this would call Firebase Cloud Messaging (FCM)
    // to send push notifications to the providers.
  },

  /**
   * A provider accepts a booking request.
   * @param {string} bookingId - The ID of the booking.
   * @param {string} providerId - The ID of the provider accepting the booking.
   * @returns {Promise<LiveBooking>} The updated booking.
   * @throws {Error} If the RPC call fails.
   */
  async acceptBooking(bookingId: string, providerId: string): Promise<LiveBooking> {
    const { data, error } = await supabase.rpc('accept_live_booking', {
      p_request_id: bookingId, // Note: Schema expects p_request_id, but here it might be bookingId. Let's verify usage.
      p_provider_id: providerId
    });

    if (error) {
      logger.error('Error accepting booking', { error, bookingId, providerId });
      throw error;
    }

    return data as LiveBooking;
  },

  /**
   * Cancels a live booking.
   * @param {string} bookingId - The ID of the booking to cancel.
   * @returns {Promise<void>}
   */
  async cancelBooking(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId);

    if (error) {
      logger.error('Error canceling booking', { error, bookingId });
      throw error;
    }
  },

  /**
   * Subscribes to real-time updates for a specific booking.
   * @param {string} bookingId - The ID of the booking to listen to.
   * @param {(payload: RealtimePostgresChangesPayload<{ [key: string]: any; }>) => void} callback - The function to call with the update payload.
   * @returns {RealtimeChannel} The Supabase Realtime channel.
   */
  subscribeToBookingUpdates(
    bookingId: string,
    onStatusUpdate: (payload: RealtimePostgresChangesPayload<{ [key: string]: any; }>) => void,
    onLocationUpdate?: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`booking-updates:${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        onStatusUpdate
      )
      .on(
        'broadcast',
        { event: 'provider_location' },
        (payload: any) => {
          if (onLocationUpdate) onLocationUpdate(payload.payload);
        }
      )
      .subscribe();

    return channel;
  },

  /**
   * Rejects a booking request (Provider Side).
   * @param {string} bookingId - The ID of the booking.
   * @param {string} providerId - The ID of the provider rejecting the booking.
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
   * Broadcasts provider location to the booking channel.
   * @param {string} bookingId - The booking ID.
   * @param {object} location - { lat, lng }
   */
  async broadcastProviderLocation(bookingId: string, location: { lat: number; lng: number }) {
    await supabase.channel(`booking-updates:${bookingId}`).send({
      type: 'broadcast',
      event: 'provider_location',
      payload: location
    });
  },

  /**
   * Completes a booking (Provider Side).
   * @param {string} bookingId - The ID of the booking.
   * @param {string} providerId - The ID of the provider.
   * @returns {Promise<void>}
   */
  async completeBooking(bookingId: string, providerId: string): Promise<void> {
    const { error } = await supabase.rpc('complete_booking', {
      p_booking_id: bookingId,
      p_provider_id: providerId
    });

    if (error) {
      logger.error('Error completing booking', { error, bookingId, providerId });
      throw error;
    }
  },

  /**
   * Processes a payment (Client Side - Mock).
   * @param {string} bookingId - The ID of the booking.
   * @param {number} amount - The amount to pay.
   * @param {string} method - 'CARD', 'UPI', or 'CASH'.
   * @returns {Promise<void>}
   */
  async processPayment(bookingId: string, amount: number, method: string): Promise<void> {
    const { error } = await supabase.rpc('process_payment', {
      p_booking_id: bookingId,
      p_amount: amount,
      p_method: method
    });

    if (error) {
      logger.error('Error processing payment', { error, bookingId });
      throw error;
    }
  },

  /**
   * Subscribes to new booking requests for a specific provider.
   * @param {string} providerId - The ID of the provider.
   * @param {function} onNewRequest - Callback when a new request is received.
   * @returns {RealtimeChannel}
   */
  subscribeToProviderRequests(
    providerId: string,
    onNewRequest: (payload: any) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`provider-requests:${providerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booking_requests',
          filter: `provider_id=eq.${providerId}`
        },
        onNewRequest
      )
      .subscribe();

    return channel;
  },

  /**
   * Updates the status of a booking (Provider Side).
   * @param {string} bookingId - The Booking ID.
   * @param {string} status - New status.
   */
  async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    // Using the Admin RPC wrapper if strictly needed, or direct update if policy allows.
    // Let's force use of RPC we created `update_booking_status_admin` OR assume RLS works.
    // Ideally we should have `update_booking_status_provider` RPC.
    // For this sprint, reusing the admin/god RPC if possible? No, strictly RLS.
    // Let's try direct update.
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) {
      // If direct update fails (likely RLS), try the RPC approach or log error.
      console.error("Direct update failed, checking RLS policies.", error);
      throw error;
    }
  },

  async getBookingById(bookingId: string) {
    return await supabase.from('bookings').select('*').eq('id', bookingId).single();
  },

  /**
   * Unsubscribes from a Realtime channel.
   * @param {RealtimeChannel} channel - The channel to unsubscribe from.
   */
  unsubscribeFromChannel(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  }
};
