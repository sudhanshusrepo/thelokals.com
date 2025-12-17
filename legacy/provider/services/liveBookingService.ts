
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '@core/services/supabase';
import { BookingRequest } from '@core/types';

export const liveBookingService = {
  /**
   * Subscribes to real-time updates for booking requests for a specific provider.
   * @param {string} providerId - The ID of the provider to listen for requests.
   * @param {(payload: RealtimePostgresChangesPayload<{ [key: string]: any; }>) => void} callback - The function to call with the update payload.
   * @returns {RealtimeChannel} The Supabase Realtime channel.
   */
  subscribeToLiveBookingRequests(providerId: string, callback: (payload: RealtimePostgresChangesPayload<{ [key: string]: any; }>) => void): RealtimeChannel {
    const channel = supabase
      .channel(`live-booking-requests:${providerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booking_requests',
          filter: `provider_id=eq.${providerId}`,
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
