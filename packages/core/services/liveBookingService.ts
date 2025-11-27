
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { LiveBooking, Provider } from '../types';
import { logger } from './logger';

const GEOGRAPHY_PROXIMITY_THRESHOLD = 5000; // 5km

/**
 * @module liveBookingService
 * @description A service for managing real-time booking requests.
 */
export const liveBookingService = {
  /**
   * Creates a new live booking, finds nearby providers, and creates booking requests for them.
   * @param {Omit<LiveBooking, 'id'>} bookingData - The data for the new booking.
   * @returns {Promise<LiveBooking>} The newly created booking.
   * @throws {Error} If any step of the process fails.
   */
  async createLiveBooking(bookingData: Omit<LiveBooking, 'id'>): Promise<LiveBooking> {
    // 1. Create the booking with a 'REQUESTED' status
    const { data: newBooking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
        ...bookingData,
        status: 'REQUESTED',
      }])
      .select()
      .single();

    if (bookingError) {
      logger.error('Error creating booking', { error: bookingError, bookingData });
      throw bookingError;
    }

    // 2. Find nearby providers
    const providers = await this.findNearbyProviders(newBooking as LiveBooking);

    if (providers.length === 0) {
        await supabase
            .from('bookings')
            .update({ status: 'EXPIRED' })
            .eq('id', newBooking.id);
        logger.warn('No nearby providers found for booking', { bookingId: newBooking.id });
        throw new Error('No nearby providers found.');
    }

    // 3. Create booking requests for the providers
    const providerIds = providers.map(p => p.id);
    await this.createBookingRequests(newBooking.id, providerIds);

    // 4. (Future) Send notifications to providers
    await this.sendNotifications(providerIds, newBooking as LiveBooking);

    return newBooking as LiveBooking;
  },

  /**
   * Finds nearby providers for a given booking.
   * @param {LiveBooking} booking - The booking to find providers for.
   * @returns {Promise<Provider[]>} A list of nearby providers.
   * @throws {Error} If the query fails.
   */
  async findNearbyProviders(booking: LiveBooking): Promise<Provider[]> {
    const { data, error } = await supabase.rpc('find_nearby_providers', {
      lat: booking.requirements.location.lat,
      lng: booking.requirements.location.lng,
      service_id: booking.serviceId,
      max_distance: GEOGRAPHY_PROXIMITY_THRESHOLD
    });

    if (error) {
      logger.error('Error finding nearby providers', { error, booking });
      throw error;
    }
    return data || [];
  },

  /**
   * Creates booking requests for a list of providers.
   * @param {string} bookingId - The ID of the booking.
   * @param {string[]} providerIds - A list of provider IDs to create requests for.
   * @throws {Error} If the insert fails.
   */
  async createBookingRequests(bookingId: string, providerIds: string[]) {
    const requests = providerIds.map(providerId => ({
      booking_id: bookingId,
      provider_id: providerId,
      status: 'PENDING'
    }));

    const { error } = await supabase.from('booking_requests').insert(requests);

    if (error) {
      logger.error('Error creating booking requests', { error, bookingId, providerIds });
      throw error;
    }
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
    const { data, error } = await supabase.rpc('accept_booking', {
      p_booking_id: bookingId,
      p_provider_id: providerId
    });

    if (error) {
      logger.error('Error accepting booking', { error, bookingId, providerId });
      throw error;
    }

    return data as LiveBooking;
  },

  /**
   * Subscribes to real-time updates for a specific booking.
   * @param {string} bookingId - The ID of the booking to listen to.
   * @param {(payload: RealtimePostgresChangesPayload<{ [key: string]: any; }>) => void} callback - The function to call with the update payload.
   * @returns {RealtimeChannel} The Supabase Realtime channel.
   */
  subscribeToBookingUpdates(bookingId: string, callback: (payload: RealtimePostgresChangesPayload<{ [key: string]: any; }>) => void): RealtimeChannel {
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
        callback
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribes from a Realtime channel.
   * @param {RealtimeChannel} channel - The channel to unsubscribe from.
   */
  unsubscribeFromChannel(channel: RealtimeChannel) {
    supabase.removeChannel(channel);
  }
};
