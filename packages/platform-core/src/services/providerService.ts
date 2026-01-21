
import { supabase } from './supabase';
import { WorkerProfile, Booking, BookingStatus, DbBookingRequest } from '../types';

export const providerService = {

    /**
     * Get provider profile by User ID (Auth ID)
     */
    async getProfile(userId: string): Promise<WorkerProfile | null> {
        const { data, error } = await supabase
            .from('providers')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching provider profile:', error);
            return null;
        }

        // Map DB fields to WorkerProfile interface
        return {
            ...data,
            name: data.full_name,
            imageUrl: data.profile_image_url,
            category: data.category,
            // Ensure other fields are passed through or mapped as needed
        } as any;
    },

    /**
     * Get dashboard statistics
     */
    async getDashboardStats(providerId: string): Promise<{
        currentBalance: number;
        monthlyEarnings: number;
        activeJobs: number;
        completedToday: number;
        rating: number;
        trend: number; // Percentage growth
    }> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        // Parallel queries for performance
        const [earningsData, activeJobsData, todayJobsData, providerData] = await Promise.all([
            // Monthly Earnings
            supabase
                .from('bookings')
                .select('provider_earnings')
                .eq('provider_id', providerId)
                .eq('status', 'COMPLETED')
                .gte('created_at', startOfMonth),

            // Active Jobs
            supabase
                .from('bookings')
                .select('count', { count: 'exact', head: true })
                .eq('provider_id', providerId)
                .in('status', ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS']),

            // Completed Today
            supabase
                .from('bookings')
                .select('count', { count: 'exact', head: true })
                .eq('provider_id', providerId)
                .eq('status', 'COMPLETED')
                .gte('created_at', startOfDay),

            // Rating
            supabase
                .from('providers')
                .select('rating')
                .eq('id', providerId)
                .single()
        ]);

        const monthlyEarnings = earningsData.data?.reduce((sum: number, b: { provider_earnings: any }) => sum + (Number(b.provider_earnings) || 0), 0) || 0;

        return {
            currentBalance: monthlyEarnings, // Placeholder for wallet balance
            monthlyEarnings,
            activeJobs: activeJobsData.count || 0,
            completedToday: todayJobsData.count || 0,
            rating: providerData.data?.rating || 5.0,
            trend: 15 // Mock trend for now
        };
    },

    /**
     * Get jobs with optional status filter
     */
    async getJobs(providerId: string, status?: BookingStatus[]): Promise<Booking[]> {
        let query = supabase
            .from('bookings')
            .select(`
        *,
        user:user_id (*)
      `)
            .eq('provider_id', providerId)
            .order('created_at', { ascending: false });

        if (status && status.length > 0) {
            query = query.in('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }

        return data as any;
    },

    async getRequests(providerId: string): Promise<DbBookingRequest[]> {
        // Uses bookingService's underlying query but types it for Provider use
        const { data, error } = await supabase
            .from('booking_requests')
            .select(`
         *,
         id:request_id,
         bookings:booking_id (*, user:user_id(*))
       `)
            .eq('provider_id', providerId)
            .eq('status', 'PENDING')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching requests:', error);
            return [];
        }
        return data as any;
    },

    async acceptBooking(requestId: string, providerId: string): Promise<boolean> {
        const { data, error } = await supabase.rpc('accept_live_booking', {
            p_request_id: requestId,
            p_provider_id: providerId
        });
        if (error) throw error;
        return data;
    },

    async rejectBooking(requestId: string): Promise<void> {
        const { error } = await supabase
            .from('booking_requests')
            .update({ status: 'REJECTED' })
            .eq('id', requestId);
        if (error) throw error;
    },

    async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId);
        if (error) throw error;
    },

    /**
     * Toggle availability
     */
    async updateAvailability(providerId: string, status: 'AVAILABLE' | 'OFFLINE'): Promise<void> {
        // Delegate to updateProfile which now handles upsert/row creation
        const { error } = await supabase
            .from('providers')
            .upsert({
                id: providerId,
                is_active: status === 'AVAILABLE',
                status: status === 'AVAILABLE' ? 'AVAILABLE' : 'OFFLINE',
                updated_at: new Date().toISOString()
            })
            .select();

        if (error) {
            console.error('Error updating availability:', error);
            throw error;
        }
    },

    async getEarningsHistory(providerId: string, period: 'week' | 'month' = 'week'): Promise<{ date: string; amount: number }[]> {
        // In a real app, this would be a Postgres aggregation query.
        // For now, we fetch completed bookings and aggregate in JS.
        const { data, error } = await supabase
            .from('bookings')
            .select('created_at, provider_earnings')
            .eq('provider_id', providerId)
            .eq('status', 'COMPLETED')
            // .gte('created_at', period === 'week' ? sevenDaysAgo : thirtyDaysAgo) // optimization
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching earnings history:', error);
            return [];
        }

        // Aggregate by Date
        const earningsMap = new Map<string, number>();

        data.forEach((b: any) => {
            const date = new Date(b.created_at).toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon"
            const amount = Number(b.provider_earnings) || 0;
            earningsMap.set(date, (earningsMap.get(date) || 0) + amount);
        });

        // Ideally fill in missing days with 0, but for MVP just returning what we have or a mock for demo if empty
        if (earningsMap.size === 0) {
            // Return dummy data for demo visualization if no real data
            return [
                { date: 'Mon', amount: 0 },
                { date: 'Tue', amount: 1500 },
                { date: 'Wed', amount: 3200 },
                { date: 'Thu', amount: 2100 },
                { date: 'Fri', amount: 4500 },
                { date: 'Sat', amount: 6000 },
                { date: 'Sun', amount: 3000 },
            ];
        }

        return Array.from(earningsMap.entries()).map(([date, amount]) => ({ date, amount }));
    },

    async getTransactions(providerId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select('id, created_at, service_category, provider_earnings, status, payment_status')
            .eq('provider_id', providerId)
            .eq('status', 'COMPLETED')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) return [];
        return data;
    },

    async updateProfile(providerId: string, updates: Partial<WorkerProfile>): Promise<void> {
        // Map frontend fields (camelCase) to DB fields (snake_case)
        const dbUpdates: any = {};

        if (updates.name) dbUpdates.full_name = updates.name;
        if (updates.description) dbUpdates.description = updates.description; // Matches
        if (updates.price) dbUpdates.price = updates.price; // We added this column
        if (updates.imageUrl) dbUpdates.profile_image_url = updates.imageUrl;
        if (updates.category) dbUpdates.category = updates.category;

        // Handle JSONB fields
        if (updates.documents) {
            dbUpdates.documents = updates.documents;
            // FLAGGING LOGIC: If documents are updated, reset verification to pending
            dbUpdates.verification_status = 'pending';
        }
        if (updates.bank_details) dbUpdates.bank_details = updates.bank_details;
        if (updates.availabilitySchedule) dbUpdates.availabilitySchedule = updates.availabilitySchedule;

        // Handle explicitly passed fields that match (e.g. from partials)
        if (updates.is_active !== undefined) dbUpdates.is_active = updates.is_active;
        if (updates.status !== undefined) dbUpdates.status = updates.status;

        if (Object.keys(dbUpdates).length === 0) return;

        // Use upsert to handle missing rows (e.g. if registration didn't create it)
        dbUpdates.id = providerId;
        dbUpdates.updated_at = new Date().toISOString();

        const { error } = await supabase
            .from('providers')
            .upsert(dbUpdates)
            .select();

        if (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
};
