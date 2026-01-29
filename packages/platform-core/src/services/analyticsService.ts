import { supabase } from './supabase';

// Types for analytics data
export interface ProviderAnalytics {
    provider_id: string;
    provider_name: string;
    current_rating: number;
    review_count: number;
    total_jobs: number;
    completed_jobs: number;
    cancelled_jobs: number;
    active_jobs: number;
    total_earnings: number;
    total_commission_paid: number;
    avg_rating: number;
    completion_rate_percent: number;
}

export interface ProviderEarnings {
    period_label: string;
    period_start: string;
    total_earnings: number;
    job_count: number;
    avg_job_value: number;
    commission_paid: number;
}

export interface CategoryPerformance {
    category_id: string;
    category_name: string;
    job_count: number;
    total_earnings: number;
    avg_rating: number;
}

export interface ClientAnalytics {
    user_id: string;
    email: string;
    total_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    total_spent: number;
    avg_booking_value: number;
    unique_providers_used: number;
    unique_services_used: number;
    last_booking_date: string;
    first_booking_date: string;
}

export interface ClientSpending {
    period_label: string;
    period_start: string;
    total_spent: number;
    booking_count: number;
    avg_booking_value: number;
}

export interface PlatformMetrics {
    period: {
        start: string;
        end: string;
    };
    gmv: number;
    total_bookings: number;
    completed_bookings: number;
    cancelled_bookings: number;
    completion_rate_percent: number;
    platform_revenue: number;
    provider_earnings: number;
    avg_booking_value: number;
    unique_clients: number;
    active_providers: number;
}

export const analyticsService = {
    // Provider Analytics
    async getProviderAnalytics(providerId: string): Promise<ProviderAnalytics | null> {
        const { data, error } = await supabase
            .from('provider_analytics')
            .select('*')
            .eq('provider_id', providerId)
            .single();

        if (error) {
            console.error('Error fetching provider analytics:', error);
            throw error;
        }
        return data;
    },

    async getProviderEarnings(
        providerId: string,
        period: 'day' | 'week' | 'month' | 'year' = 'week',
        limit: number = 12
    ): Promise<ProviderEarnings[]> {
        const { data, error } = await supabase.rpc('get_provider_earnings', {
            p_provider_id: providerId,
            p_period: period,
            p_limit: limit
        });

        if (error) {
            console.error('Error fetching provider earnings:', error);
            throw error;
        }
        return data || [];
    },

    async getProviderCategoryPerformance(providerId: string): Promise<CategoryPerformance[]> {
        const { data, error } = await supabase.rpc('get_provider_category_performance', {
            p_provider_id: providerId
        });

        if (error) {
            console.error('Error fetching category performance:', error);
            throw error;
        }
        return data || [];
    },

    // Client Analytics
    async getClientAnalytics(userId: string): Promise<ClientAnalytics | null> {
        const { data, error } = await supabase
            .from('client_analytics')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            console.error('Error fetching client analytics:', error);
            throw error;
        }
        return data;
    },

    async getClientSpending(
        userId: string,
        period: 'day' | 'week' | 'month' | 'year' = 'month',
        limit: number = 12
    ): Promise<ClientSpending[]> {
        const { data, error } = await supabase.rpc('get_client_spending', {
            p_user_id: userId,
            p_period: period,
            p_limit: limit
        });

        if (error) {
            console.error('Error fetching client spending:', error);
            throw error;
        }
        return data || [];
    },

    // Platform Analytics (Admin)
    async getPlatformMetrics(
        startDate?: Date,
        endDate?: Date
    ): Promise<PlatformMetrics> {
        const { data, error } = await supabase.rpc('get_platform_metrics', {
            p_start_date: startDate?.toISOString(),
            p_end_date: endDate?.toISOString()
        });

        if (error) {
            console.error('Error fetching platform metrics:', error);
            throw error;
        }
        return data;
    },

    async getPlatformGrowthMetrics(): Promise<{
        current_month: PlatformMetrics;
        last_month: PlatformMetrics;
        current_week: PlatformMetrics;
        last_week: PlatformMetrics;
    }> {
        const { data, error } = await supabase.rpc('get_platform_growth_metrics');

        if (error) {
            console.error('Error fetching platform growth metrics:', error);
            throw error;
        }
        return data;
    }
};
