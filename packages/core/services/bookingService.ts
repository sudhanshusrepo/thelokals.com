
import { supabase } from './supabase';
import { Booking, BookingStatus } from '../types';

export const bookingService = {
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

    if (error) throw error;
    return data;
  },

  async getUserBookings(userId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        workers(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map the nested worker data to match WorkerProfile structure
    return data.map((b: any) => ({
        ...b,
        worker: b.worker ? {
            ...b.worker,
            reviewCount: b.worker.review_count,
            experienceYears: b.worker.experience_years,
            priceUnit: b.worker.price_unit,
            imageUrl: b.worker.image_url,
            isVerified: b.worker.is_verified,
            location: {
                lat: b.worker.location_lat,
                lng: b.worker.location_lng
            }
        } : undefined
    }));
  },

  async getWorkerBookings(workerId: string): Promise<Booking[]> {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('worker_id', workerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus) {
    const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
    
    if (error) throw error;
  },

  async processPayment(bookingId: string) {
    const { error } = await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', bookingId);

    if (error) throw error;
  },

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
      
      if (error) throw error;

      // Ensure booking is marked as completed if it wasn't already (though flow usually ensures this)
      await this.updateBookingStatus(bookingId, 'completed');
  }
};
