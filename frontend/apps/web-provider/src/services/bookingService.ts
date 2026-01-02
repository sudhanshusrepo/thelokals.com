import { supabase } from '@thelocals/core/services/supabase';
import { logger } from '@thelocals/core/services/logger';
import { Booking, BookingStatus } from '@thelocals/core';

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
      notes: b.note, // Mapped to 'notes' to match Booking interface
      status: b.status,
      date: b.date,
      started_at: b.started_at,
      completed_at: b.completed_at,
      address: b.address,
      requirements: b.requirements,
      total_price: b.total_price,
      payment_status: b.payment_status,
      provider_earnings: b.provider_earnings,
      platform_commission: b.platform_commission,
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

  async updateBookingNotes(bookingId: string, notes: string): Promise<any> {
    const { data, error } = await supabase
      .from('bookings')
      .update({ note: notes }) // Using 'note' based on getProviderBookings mapping
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      logger.error("Error updating booking notes:", error);
      throw error;
    }
    return data;
  },
};
