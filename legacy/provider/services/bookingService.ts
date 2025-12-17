import { supabase } from '@core/services/supabase';
import { logger } from '@thelocals/core/services/logger';
import { Booking, BookingStatus } from '@core/types';

export const bookingService = {

  async getProviderBookings(workerId: string): Promise<Booking[]> {
    // This uses the SQL function you created in the Supabase dashboard.
    const { data, error } = await supabase.rpc('get_provider_dashboard_data', { p_worker_id: workerId });

    if (error) {
      logger.error("Error calling get_provider_dashboard_data:", error);
      throw error;
    }
    if (!data) return [];

    // Map the flat response from the RPC to our nested Booking type
    return data.map((b: any) => ({
      id: b.id,
      note: b.note,
      status: b.status,
      date: b.date,
      total_price: b.total_price,
      payment_status: b.payment_status,
      user: b.user_id ? {
        id: b.user_id,
        // Be aware that raw_user_meta_data might not be exposed to your RLS policies
        // You might need to create a `profiles` table to store public user info
        name: b.user_name,
        avatar_url: b.user_avatar_url,
      } : undefined,
    }));
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<any> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      logger.error("Error updating booking status:", error);
      throw error;
    }
    return data;
  },
};
