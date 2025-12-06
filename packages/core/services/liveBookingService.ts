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
      lat: booking.requirements.location.lat,
      lng: booking.requirements.location.lng,
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
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        client_id: bookingData.clientId,
        service_category: bookingData.serviceId, // Mapping serviceId to category for now
        booking_type: 'LIVE',
        status: 'PENDING', // Initial status in DB
        requirements: bookingData.requirements,
        location: `POINT(${bookingData.requirements?.location.lng} ${bookingData.requirements?.location.lat})`,
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
      clientId: data.client_id,
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
