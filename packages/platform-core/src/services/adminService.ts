import { supabase } from './supabase';
import { AdminRole, AdminUser, ServiceAvailability, ActiveSession, AdminAuditLog } from '../types';

// Removed local AdminUser/AdminRole/ServiceAvailability definitions to use shared types




/**
 * Admin Service - Handles all admin panel operations
 */
export const adminService = {
    // ============ Audit Logging ============



    // ============ Service Availability ============

    /**
     * Get service availability for all or specific location
     */
    async getServiceAvailability(filters?: {
        city?: string;
        status?: 'ENABLED' | 'DISABLED'
    }): Promise<ServiceAvailability[]> {
        let query = supabase
            .from('service_availability')
            .select('*')
            .order('location_value', { ascending: true });

        if (filters?.city) {
            query = query.eq('location_value', filters.city);
        }
        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch service availability: ${error.message}`);
        return data || [];
    },

    /**
     * Toggle service availability for a location
     */
    async toggleServiceAvailability(
        serviceId: string,
        locationValue: string,
        status: 'ENABLED' | 'DISABLED',
        adminId: string,
        reason?: string
    ): Promise<void> {
        const { error } = await supabase
            .from('service_availability')
            .upsert({
                service_category_id: serviceId,
                location_type: 'city',
                location_value: locationValue,
                status,
                reason,
                disabled_by: status === 'DISABLED' ? adminId : null,
                disabled_at: status === 'DISABLED' ? new Date().toISOString() : null,
            });

        if (error) throw new Error(`Failed to update service availability: ${error.message}`);

        // Log the action
        await this.logAction(
            adminId,
            `${status.toLowerCase()}_service`,
            'service_availability',
            `${serviceId}:${locationValue}`,
            { status, reason }
        );
    },

    /**
     * Bulk enable/disable services for a location
     */
    async bulkToggleServices(
        serviceIds: string[],
        locationValue: string,
        status: 'ENABLED' | 'DISABLED',
        adminId: string,
        reason?: string
    ): Promise<void> {
        const updates = serviceIds.map(serviceId => ({
            service_category_id: serviceId,
            location_type: 'city' as const,
            location_value: locationValue,
            status,
            reason,
            disabled_by: status === 'DISABLED' ? adminId : null,
            disabled_at: status === 'DISABLED' ? new Date().toISOString() : null,
        }));

        const { error } = await supabase
            .from('service_availability')
            .upsert(updates);

        if (error) throw new Error(`Failed to bulk update services: ${error.message}`);

        await this.logAction(
            adminId,
            `bulk_${status.toLowerCase()}_services`,
            'service_availability',
            locationValue,
            { count: serviceIds.length, status, reason }
        );
    },

    // ============ Active Sessions ============

    /**
     * Get active sessions (last 5 minutes)
     */
    async getActiveSessions(filters?: {
        city?: string;
        userType?: 'customer' | 'provider';
    }): Promise<ActiveSession[]> {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

        let query = supabase
            .from('active_sessions')
            .select('*')
            .gte('last_activity', fiveMinutesAgo)
            .order('last_activity', { ascending: false });

        if (filters?.city) {
            query = query.eq('city', filters.city);
        }
        if (filters?.userType) {
            query = query.eq('user_type', filters.userType);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch active sessions: ${error.message}`);
        return data || [];
    },

    /**
     * Get active session counts
     */
    async getActiveSessionCounts(): Promise<{
        total: number;
        customers: number;
        providers: number;
    }> {
        const sessions = await this.getActiveSessions();
        return {
            total: sessions.length,
            customers: sessions.filter(s => s.user_type === 'customer').length,
            providers: sessions.filter(s => s.user_type === 'provider').length,
        };
    },

    /**
     * Subscribe to active sessions changes (WebSocket)
     */
    subscribeToActiveSessions(callback: (payload: any) => void) {
        return supabase
            .channel('active-sessions-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'active_sessions' },
                callback
            )
            .subscribe();
    },

    /**
     * Update user session activity
     */
    async updateSessionActivity(
        userId: string,
        userType: 'customer' | 'provider',
        sessionState?: string,
        city?: string,
        bookingId?: string
    ): Promise<void> {
        const { error } = await supabase
            .from('active_sessions')
            .upsert({
                user_id: userId,
                user_type: userType,
                session_state: sessionState,
                city,
                current_booking_id: bookingId,
                last_activity: new Date().toISOString(),
            });

        if (error) console.error('Failed to update session:', error);
    },

    // ============ Audit Logging ============

    /**
     * Log an admin action
     */
    async logAction(
        adminId: string,
        action: string,
        resourceType: string,
        resourceId?: string,
        changes?: Record<string, any>
    ): Promise<void> {
        const { error } = await supabase
            .from('admin_activity_logs')
            .insert({
                admin_id: adminId,
                action,
                target_type: resourceType,
                target_id: resourceId,
                details: changes,
            });

        if (error) {
            console.error('Failed to log admin action:', error);
        }
    },

    /**
     * Get audit logs
     */
    async getAuditLogs(filters?: {
        adminId?: string;
        action?: string;
        limit?: number;
    }): Promise<AdminAuditLog[]> {
        let query = supabase
            .from('admin_audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(filters?.limit || 100);

        if (filters?.adminId) {
            query = query.eq('admin_id', filters.adminId);
        }
        if (filters?.action) {
            query = query.eq('action', filters.action);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch audit logs: ${error.message}`);
        return data || [];
    },

    // ============ Admin Users ============

    /**
     * Get admin user by ID (more robust for auth checks)
     */
    async getAdminById(id: string): Promise<AdminUser | null> {
        // Direct query to admin_users table (No Join initially to utilize Public Read Active Admins policy)
        const { data: adminData, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', id)
            .eq('is_active', true)
            .maybeSingle();

        if (error) {
            console.error('Admin check failed (Core):', error);
            return null;
        }

        if (!adminData) {
            // Not found or not active
            return null;
        }

        // Attempt to fetch profile details (might fail if RLS is strict and session is missing)
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', id)
            .maybeSingle();

        return {
            id: adminData.id,
            email: profile?.email || '',
            full_name: profile?.full_name || 'Admin',
            role: adminData.role as AdminRole,
            created_at: adminData.created_at
        };
    },

    /**
     * Get admin user by email
     */
    async getAdminByEmail(email: string): Promise<AdminUser | null> {
        // First get profile by email to get ID
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .eq('email', email)
            .single();

        if (!profile) return null;

        // Then check if this user is an admin
        const { data: adminData, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', profile.id)
            .eq('is_active', true) // Only active admins
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not an admin
            console.error('Admin check failed:', error);
            return null;
        }

        return {
            id: profile.id,
            email: profile.email!,
            full_name: profile.full_name || 'Admin',
            role: adminData.role as AdminRole,
            created_at: adminData.created_at
        };
    },

    /**
     * Create or update admin user
     */
    async upsertAdminUser(user: Partial<AdminUser>): Promise<AdminUser> {
        const { data, error } = await supabase
            .from('admin_users')
            .upsert(user)
            .select()
            .single();

        if (error) throw new Error(`Failed to upsert admin user: ${error.message}`);
        return data;
    },
    /**
     * Get dashboard metrics
     */
    /**
     * Get dashboard metrics
     */
    async getDashboardMetrics(period: 'today' | '7d' | '30d' | 'custom' = '7d'): Promise<import('../types').AdminDashboardMetrics> {
        const now = new Date();
        let startDate = new Date();
        let previousStartDate = new Date();

        // Calculate date ranges
        switch (period) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                previousStartDate.setDate(previousStartDate.getDate() - 1);
                previousStartDate.setHours(0, 0, 0, 0);
                break;
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                previousStartDate.setDate(previousStartDate.getDate() - 14);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                previousStartDate.setDate(previousStartDate.getDate() - 60);
                break;
            case 'custom':
                // Default to 30 days if custom logic not fully implemented yet
                startDate.setDate(startDate.getDate() - 30);
                previousStartDate.setDate(previousStartDate.getDate() - 60);
                break;
        }

        const isoStart = startDate.toISOString();
        const isoPrevStart = previousStartDate.toISOString();

        // queries
        const [
            currentBookings,
            previousBookings,
            activeListings,
            prevActiveListings,
            newUsers,
            prevNewUsers
        ] = await Promise.all([
            // Current Bookings & Revenue
            supabase.from('bookings').select('id, created_at, final_cost, status').gte('created_at', isoStart),
            // Previous Bookings
            supabase.from('bookings').select('id, final_cost').gte('created_at', isoPrevStart).lt('created_at', isoStart),
            // Active Listings (Providers)
            supabase.from('providers').select('count', { count: 'exact', head: true }).eq('is_active', true),
            // Prev Listings (Snapshot hard to get without history table, assuming static for now or checking created_at)
            supabase.from('providers').select('count', { count: 'exact', head: true }).eq('is_active', true).lt('created_at', isoStart),
            // New Users
            supabase.from('profiles').select('count', { count: 'exact', head: true }).gte('created_at', isoStart),
            supabase.from('profiles').select('count', { count: 'exact', head: true }).gte('created_at', isoPrevStart).lt('created_at', isoStart)
        ]);

        // Aggregations
        const totalBookings = currentBookings.data?.length || 0;
        const prevTotalBookings = previousBookings.data?.length || 0;

        const totalRevenue = currentBookings.data?.reduce((sum: number, b: any) => sum + (Number(b.final_cost) || 0), 0) || 0;
        const prevRevenue = previousBookings.data?.reduce((sum: number, b: any) => sum + (Number(b.final_cost) || 0), 0) || 0;

        const activeListingsCount = activeListings.count || 0;
        const prevActiveListingsCount = prevActiveListings.count || 0;

        const newUsersCount = newUsers.count || 0;
        const prevNewUsersCount = prevNewUsers.count || 0;

        // Calculations
        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        // Chart Data Generation (Daily grouping)
        const chartDataMap = new Map<string, { bookings: number; revenue: number }>();

        // Initialize days
        const days = period === 'today' ? 1 : period === '7d' ? 7 : 30;
        for (let i = 0; i < days; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toLocaleDateString('en-US', { weekday: 'short' }); // Mon, Tue
            if (!chartDataMap.has(key)) {
                chartDataMap.set(key, { bookings: 0, revenue: 0 });
            }
        }

        currentBookings.data?.forEach((b: any) => {
            const d = new Date(b.created_at);
            const key = d.toLocaleDateString('en-US', { weekday: 'short' });
            if (chartDataMap.has(key)) {
                const curr = chartDataMap.get(key)!;
                curr.bookings++;
                curr.revenue += (Number(b.final_cost) || 0);
            }
        });

        const chartData = Array.from(chartDataMap.entries()).map(([name, data]) => ({
            name,
            ...data
        })).reverse(); // Show oldest to newest

        return {
            totalRevenue,
            activeListings: activeListingsCount,
            totalBookings,
            newUsers: newUsersCount,
            revenueChangePercentage: calculateChange(totalRevenue, prevRevenue),
            bookingsChangePercentage: calculateChange(totalBookings, prevTotalBookings),
            newUsersChangePercentage: calculateChange(newUsersCount, prevNewUsersCount),
            activeListingsChangePercentage: calculateChange(activeListingsCount, prevActiveListingsCount),
            chartData
        };
    },

    // ============ Provider Verification ============

    /**
     * Get pending providers
     */
    async getPendingProviders(): Promise<import('../types').WorkerProfile[]> {
        const { data, error } = await supabase
            .from('providers')
            .select('*, name:full_name')
            .eq('verification_status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch pending providers: ${error.message}`);
        return (data || []) as unknown as import('../types').WorkerProfile[];
    },

    /**
     * Verify or reject a provider
     */
    async verifyProvider(
        providerId: string,
        status: 'approved' | 'rejected',
        adminId: string,
        reason?: string
    ): Promise<void> {
        const updates: any = {
            verification_status: status,
            is_verified: status === 'approved',
        };

        if (status === 'rejected') {
            updates.rejection_reason = reason;
        }

        const { error } = await supabase
            .from('providers')
            .update(updates)
            .eq('id', providerId);

        if (error) throw new Error(`Failed to update provider verification: ${error.message}`);

        // Log the action
        await this.logAction(
            adminId,
            `verify_provider_${status}`,
            'provider',
            providerId,
            { status, reason }
        );
    },

    /**
     * Get all providers (optional filter)
     */
    async getAllProviders(status?: 'pending' | 'approved' | 'rejected'): Promise<import('../types').WorkerProfile[]> {
        let query = supabase
            .from('providers')
            .select('*, name:full_name') // Alias full_name to name for consistency if needed, though type has full_name
            .order('created_at', { ascending: false });

        if (status) {
            if (status === 'approved') {
                query = query.eq('is_verified', true);
            } else if (status === 'pending') {
                query = query.eq('verification_status', 'pending');
            } else if (status === 'rejected') {
                query = query.eq('verification_status', 'rejected');
            }
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch providers: ${error.message}`);
        return (data || []) as unknown as import('../types').WorkerProfile[];
    },

    /**
     * Get all customers
     */
    async getAllCustomers(): Promise<import('../types').Customer[]> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch customers: ${error.message}`);
        return data || [];
    },

    /**
     * Get all admin users
     */
    async getAdminUsers(): Promise<import('../types').AdminUser[]> {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw new Error(`Failed to fetch admin users: ${error.message}`);
        return data || [];
    },

    // ============ Service Catalogue ============

    /**
     * Get all service categories
     */
    async getServiceCategories(): Promise<import('../types').ServiceCategory[]> {
        const { data, error } = await supabase
            .from('service_categories')
            .select('*, service_pricing(base_price, currency)')
            .order('name');

        if (error) throw new Error(`Failed to fetch service categories: ${error.message}`);

        return (data || []).map((cat: any) => ({
            ...cat,
            base_price: cat.service_pricing?.[0]?.base_price || cat.base_price || 0, // No magic number
            currency: cat.service_pricing?.[0]?.currency || 'INR'
        }));
    },

    /**
     * Create or update a service category
     */
    async upsertServiceCategory(category: Partial<import('../types').ServiceCategory>): Promise<void> {
        // 1. Upsert Category
        const { data: catData, error } = await supabase
            .from('service_categories')
            .upsert({
                id: category.id,
                name: category.name,
                type: category.type,
                description: category.description,
                image_url: category.image_url || undefined
            })
            .select()
            .single();

        if (error) throw new Error(`Failed to save service category: ${error.message}`);

        // 2. Upsert Pricing if provided
        if (category.base_price && catData) {
            await this.upsertServicePricing({
                service_category_id: catData.id,
                base_price: category.base_price,
                currency: 'INR'
            });
        }
    },

    /**
     * Delete a service category
     */
    async deleteServiceCategory(id: string): Promise<void> {
        const { error } = await supabase
            .from('service_categories')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete service category: ${error.message}`);
    },

    /**
     * Get service items by category
     */
    async getServiceItems(categoryId: string): Promise<import('../types').ServiceItem[]> {
        const { data, error } = await supabase
            .from('service_items')
            .select('*')
            .eq('category_id', categoryId)
            .order('name');

        if (error) throw new Error(`Failed to fetch service items: ${error.message}`);
        return data || [];
    },

    /**
     * Get single service item
     */
    async getServiceItem(id: string): Promise<import('../types').ServiceItem | null> {
        const { data, error } = await supabase
            .from('service_items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw new Error(`Failed to fetch service item: ${error.message}`);
        return data;
    },

    /**
     * Upsert service item
     */
    async upsertServiceItem(item: Partial<import('../types').ServiceItem>): Promise<void> {
        const { error } = await supabase
            .from('service_items')
            .upsert(item);

        if (error) throw new Error(`Failed to save service item: ${error.message}`);
    },

    /**
     * Delete service item
     */
    async deleteServiceItem(id: string): Promise<void> {
        const { error } = await supabase
            .from('service_items')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete service item: ${error.message}`);
    },

    // ============ Service Pricing ============

    /**
     * Get pricing for a service category
     */
    async getServicePricing(serviceCategoryId: string): Promise<{ base_price: number; currency: string } | null> {
        const { data, error } = await supabase
            .from('service_pricing')
            .select('base_price, currency')
            .eq('service_category_id', serviceCategoryId)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore not found error
            console.error('Failed to fetch service pricing:', error);
            return null;
        }
        return data;
    },

    /**
     * Upsert service pricing
     */
    async upsertServicePricing(pricing: {
        service_category_id: string;
        base_price: number;
        currency?: string;
    }): Promise<void> {
        const { error } = await supabase
            .from('service_pricing')
            .upsert({
                service_category_id: pricing.service_category_id,
                base_price: pricing.base_price,
                currency: pricing.currency || 'INR',
                is_active: true
            }, { onConflict: 'service_category_id' });

        if (error) throw new Error(`Failed to save service pricing: ${error.message}`);
    },

    // ============ Service Locations (City-Based Availability) ============

    /**
     * Get service locations filtered by city
     */
    async getServiceLocations(city?: string): Promise<import('../types').ServiceLocation[]> {
        let query = supabase
            .from('services_locations')
            .select('*');

        if (city) {
            query = query.eq('city', city);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch service locations: ${error.message}`);
        return data || [];
    },

    /**
     * Upsert a service location configuration
     */
    async upsertServiceLocation(location: Partial<import('../types').ServiceLocation>): Promise<void> {
        const { error } = await supabase
            .from('services_locations')
            .upsert(location, { onConflict: 'service_category_id, location_name' });

        if (error) throw new Error(`Failed to save service location: ${error.message}`);
    },

    // ============ Booking Management ============

    /**
     * Get bookings with filters
     */
    async getBookings(filters?: {
        status?: string;
        dateRange?: { start: string; end: string };
        limit?: number;
        page?: number;
    }): Promise<{ data: import('../types').Booking[]; count: number }> {
        let query = supabase
            .from('bookings')
            .select(`
                *,
                user:profiles!client_id(*),
                worker:providers!provider_id(*)
            `, { count: 'exact' });

        if (filters?.status) {
            query = query.eq('status', filters.status);
        }

        if (filters?.dateRange) {
            query = query.gte('created_at', filters.dateRange.start)
                .lte('created_at', filters.dateRange.end);
        }

        query = query.order('created_at', { ascending: false });

        if (filters?.limit) {
            const from = (filters.page || 0) * filters.limit;
            query = query.range(from, from + filters.limit - 1);
        }

        const { data, error, count } = await query;
        if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);

        return { data: data as any[], count: count || 0 };
    },

    /**
     * Get full booking details
     */
    async getBookingDetails(id: string): Promise<import('../types').Booking> {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                *,
                user:profiles!client_id(*),
                worker:providers!provider_id(*)
            `)
            .eq('id', id)
            .single();

        if (error) throw new Error(`Failed to fetch booking details: ${error.message}`);
        return data as any;
    },

    /**
     * Update booking status (Admin Override)
     */
    async updateBookingStatus(
        bookingId: string,
        status: string,
        adminId: string,
        reason?: string
    ): Promise<void> {
        const { error } = await supabase
            .from('bookings')
            .update({ status })
            .eq('id', bookingId);

        if (error) throw new Error(`Failed to update booking status: ${error.message}`);

        await this.logAction(
            adminId,
            'update_booking_status',
            'booking',
            bookingId,
            { status, reason }
        );
    },

    // ============ Financial Management ============

    /**
     * Get aggregated financial metrics
     */
    async getFinancialMetrics(): Promise<import('../types').FinancialMetrics> {
        // Calculate Total Revenue (Commission) & Earnings
        // In a real app, this would be a materialized view or performant RPC
        const { data: bookings } = await supabase
            .from('bookings')
            .select('platform_commission, provider_earnings, payment_status, status')
            .eq('status', 'COMPLETED')
            .eq('payment_status', 'PAID');

        const metrics = (bookings || []).reduce((acc: any, curr: any) => ({
            totalRevenue: acc.totalRevenue + (curr.platform_commission || 0),
            totalEarnings: acc.totalEarnings + (curr.provider_earnings || 0),
            pendingPayouts: acc.pendingPayouts + (curr.provider_earnings || 0), // Assuming no payout mechanism yet, so all earnings are pending
            completedPayouts: 0
        }), { totalRevenue: 0, totalEarnings: 0, pendingPayouts: 0, completedPayouts: 0 } as import('../types').FinancialMetrics);

        return metrics;
    },

    /**
     * Get Provider Payouts Summary
     */
    async getProviderPayouts(): Promise<import('../types').ProviderPayoutSummary[]> {
        const { data: bookings } = await supabase
            .from('bookings')
            .select(`
                provider_earnings,
                status,
                payment_status,
                worker:providers!provider_id(id, name)
            `)
            .eq('status', 'COMPLETED')
            .eq('payment_status', 'PAID')
            .not('provider_id', 'is', null);

        const payoutMap = new Map<string, import('../types').ProviderPayoutSummary>();

        bookings?.forEach((booking: any) => {
            if (!booking.worker) return;

            const providerId = booking.worker.id;
            const earnings = booking.provider_earnings || 0;

            if (!payoutMap.has(providerId)) {
                payoutMap.set(providerId, {
                    provider_id: providerId,
                    provider_name: booking.worker.name || 'Unknown',
                    total_earnings: 0,
                    paid_amount: 0,
                    pending_amount: 0
                });
            }

            const current = payoutMap.get(providerId)!;
            current.total_earnings += earnings;
            current.pending_amount += earnings; // All pending for now
        });

        return Array.from(payoutMap.values());
    },

    // ============ Location Management ============

    /**
     * Get all locations (filtered by level)
     */
    async getLocations(level: 'L3_CITY' | 'L4_AREA' | 'L5_PINCODE' = 'L3_CITY', parentId?: string): Promise<import('../types').LocationConfig[]> {
        let query = supabase
            .from('locations')
            .select('*')
            .eq('hierarchy_level', level)
            .order('name');

        if (parentId) {
            query = query.eq('parent_id', parentId);
        }

        const { data, error } = await query;

        if (error) throw new Error(`Failed to fetch locations: ${error.message}`);
        return data || [];
    },

    /**
     * Create or update a location
     */
    async upsertLocation(location: Partial<import('../types').LocationConfig>): Promise<void> {
        const { error } = await supabase
            .from('locations')
            .upsert(location);

        if (error) throw new Error(`Failed to save location: ${error.message}`);
    },

    // ============ Reports ============

    async getReportData(type: import('../types').ReportType, filters: import('../types').ReportFilter): Promise<any[]> {
        let query = supabase.from('bookings').select('*, user:profiles!user_id(*), worker:profiles!worker_id(*)');

        if (filters.dateRange) {
            query = query
                .gte('created_at', filters.dateRange.start)
                .lte('created_at', filters.dateRange.end);
        }

        if (filters.status && filters.status !== 'ALL') {
            query = query.eq('status', filters.status);
        }

        // Optimize selection based on report type
        if (type === 'FINANCIAL') {
            query = query.in('status', ['COMPLETED', 'CANCELLED']); // Only relevant statuses
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw new Error(`Report generation failed: ${error.message}`);

        // Transform data based on report type
        if (type === 'BOOKINGS') {
            return (data || []).map((b: any) => ({
                ID: b.id,
                Date: new Date(b.created_at).toLocaleDateString(),
                Customer: b.user?.full_name || 'Unknown',
                Provider: b.worker?.full_name || 'Unassigned',
                Service: b.service_id, // Ideally join service name
                Status: b.status,
                Amount: b.total_amount
            }));
        } else if (type === 'FINANCIAL') {
            return (data || []).map((b: any) => ({
                ID: b.id,
                Date: new Date(b.created_at).toLocaleDateString(),
                Status: b.status,
                TotalAmount: b.total_amount,
                PlatformFee: b.platform_commission,
                ProviderEarnings: b.provider_earnings,
                PayoutStatus: b.payment_status || 'PENDING'
            }));
        } else if (type === 'PROVIDERS') {
            // Basic provider activity from bookings
            return (data || []).map((b: any) => ({
                Provider: b.worker?.full_name || 'Unassigned',
                BookingID: b.id,
                Date: new Date(b.created_at).toLocaleDateString(),
                Service: b.service_id,
                Earnings: b.provider_earnings,
                Rating: 0 // Placeholder
            }));
        }

        return data || [];
    },



    /**
     * Get all bookings with filtering
     */
    async getAllBookings(filters?: { status?: string; limit?: number }): Promise<import('../types').Booking[]> {
        let query = supabase
            .from('bookings')
            .select(`
                *,
                client:profiles!client_id(*),
                provider:providers!provider_id(*)
            `)
            .order('created_at', { ascending: false });

        if (filters?.status && filters.status !== 'ALL') {
            query = query.eq('status', filters.status);
        }

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch bookings: ${error.message}`);

        // Map joined data to expected Type structure
        return (data || []).map((b: any) => ({
            ...b,
            user: b.client ? { ...b.client, name: b.client.full_name, avatarUrl: b.client.avatar_url } : undefined,
            worker: b.provider ? { ...b.provider, name: b.provider.full_name || b.provider.name } : undefined
        }));
    },

    /**
     * Update booking status or details
     */
    async updateBooking(id: string, updates: Partial<import('../types').Booking>): Promise<void> {
        // Strip out joined fields if passed back
        const { user, worker, client, provider, ...cleanUpdates } = updates as any;

        const { error } = await supabase
            .from('bookings')
            .update(cleanUpdates)
            .eq('id', id);

        if (error) throw new Error(`Failed to update booking: ${error.message}`);
    },

    // ============ Financial Operations ============

    /**
     * Get aggregated financial stats
     */
    async getFinancialStats() {
        // This would ideally be a dedicated RPC function for performance
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('final_cost, provider_earnings, platform_commission, payment_status, payout_status');

        if (error) throw new Error(`Failed to fetch financial stats: ${error.message}`);

        const totalRevenue = bookings?.reduce((sum: number, b: any) => sum + (b.payment_status === 'PAID' ? (b.final_cost || 0) : 0), 0) || 0;
        const totalCommission = bookings?.reduce((sum: number, b: any) => sum + (b.payment_status === 'PAID' ? (b.platform_commission || 0) : 0), 0) || 0;
        const pendingPayouts = bookings?.reduce((sum: number, b: any) => sum + (b.payment_status === 'PAID' && b.payout_status !== 'PAID' ? (b.provider_earnings || 0) : 0), 0) || 0;

        return {
            totalRevenue,
            totalCommission,
            pendingPayouts
        };
    },

    /**
     * Get pending payouts grouped by provider
     */
    async getPayouts(): Promise<{ provider: import('../types').WorkerProfile, amount: number, count: number, bookingIds: string[] }[]> {
        const { data, error } = await supabase
            .from('bookings')
            .select(`
                id,
                provider_earnings,
                payout_status,
                payment_status,
                provider:providers!provider_id(*)
            `)
            .eq('payment_status', 'PAID')
            .neq('payout_status', 'PAID');

        if (error) throw new Error(`Failed to fetch payouts: ${error.message}`);

        const payouts = new Map<string, { provider: any, amount: number, count: number, bookingIds: string[] }>();

        data?.forEach((b: any) => {
            if (!b.provider) return;
            const pid = b.provider.id;
            if (!payouts.has(pid)) {
                payouts.set(pid, {
                    provider: { ...b.provider, name: b.provider.full_name || b.provider.name }, // map name
                    amount: 0,
                    count: 0,
                    bookingIds: []
                });
            }
            const p = payouts.get(pid)!;
            p.amount += (b.provider_earnings || 0);
            p.count += 1;
            p.bookingIds.push(b.id);
        });

        return Array.from(payouts.values());
    },

    /**
     * Mark bookings as paid out
     */
    async processPayout(bookingIds: string[], adminId: string): Promise<void> {
        const { error } = await supabase
            .from('bookings')
            .update({ payout_status: 'PAID' })
            .in('id', bookingIds);

        if (error) throw new Error(`Failed to process payout: ${error.message}`);

        await this.logAction(
            adminId,
            'PROCESS_PAYOUT',
            'booking_batch',
            undefined,
            { count: bookingIds.length, bookingIds }
        );
    },

    // ============ Dispute Resolution ============

    /**
     * Get all disputes
     */
    async getDisputes(status?: 'OPEN' | 'RESOLVED' | 'DISMISSED'): Promise<import('../types').Dispute[]> {
        let query = supabase
            .from('disputes')
            .select(`
                *,
                booking:bookings!booking_id(*),
                reporter:profiles!reporter_id(*)
            `)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;
        if (error) throw new Error(`Failed to fetch disputes: ${error.message}`);

        return data || [];
    },

    /**
     * Resolve a dispute
     */
    async resolveDispute(id: string, resolution: { status: 'RESOLVED' | 'DISMISSED', notes: string, adminId: string }): Promise<void> {
        const { error } = await supabase
            .from('disputes')
            .update({
                status: resolution.status,
                resolution_notes: resolution.notes,
                resolved_by: resolution.adminId,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw new Error(`Failed to resolve dispute: ${error.message}`);

        await this.logAction(
            resolution.adminId,
            'RESOLVE_DISPUTE',
            'dispute',
            id,
            { status: resolution.status, notes: resolution.notes }
        );
    },

    // ============ Analytics ============

    async getAnalyticsOverview() {
        // Fetch bookings for aggregation
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('id, status, final_cost, created_at, address');

        if (error) throw new Error(`Failed to fetch analytics: ${error.message}`);

        const totalBookings = bookings?.length || 0;
        const totalGMV = bookings?.reduce((sum: number, b: any) => sum + (b.final_cost || 0), 0) || 0;
        const completedBookings = bookings?.filter((b: any) => b.status === 'COMPLETED').length || 0;
        const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

        // Group by Month (Last 6 Months)
        const months: Record<string, number> = {};
        bookings?.forEach((b: any) => {
            const date = new Date(b.created_at);
            const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`; // e.g., "Jan 2026"
            months[key] = (months[key] || 0) + (b.final_cost || 0);
        });

        // Group by City
        const cities: Record<string, number> = {};
        bookings?.forEach((b: any) => {
            // Assuming formatted address strings or joined data, fallback to 'Unknown'
            const city = (b.address as any)?.city || 'Unknown';
            cities[city] = (cities[city] || 0) + 1;
        });

        return {
            kpis: {
                totalBookings,
                totalGMV,
                completionRate,
                avgOrderValue: totalBookings > 0 ? totalGMV / totalBookings : 0
            },
            revenueTrend: Object.entries(months).map(([name, value]) => ({ name, value })).slice(-6),
            topCities: Object.entries(cities).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5)
        };
    },

    // ============ System Config & Banners ============

    async getSystemConfigs() {
        const { data, error } = await supabase
            .from('system_configs')
            .select('*')
            .order('key');

        if (error) throw new Error(`Failed to fetch configs: ${error.message}`);
        return data || [];
    },

    async updateSystemConfig(key: string, value: any, adminId: string) {
        const { error } = await supabase
            .from('system_configs')
            .update({ value, updated_at: new Date().toISOString() })
            .eq('key', key);

        if (error) throw new Error(`Failed to update config: ${error.message}`);

        await this.logAction(adminId, 'UPDATE_CONFIG', 'system_config', key, { value });
    },

    async getMarketingBanners() {
        const { data, error } = await supabase
            .from('marketing_banners')
            .select('*')
            .order('position', { ascending: true });

        if (error) throw new Error(`Failed to fetch banners: ${error.message}`);
        return data || [];
    },

    async createMarketingBanner(banner: { title: string; image_url: string; link_url?: string; is_active: boolean; position: number }, adminId: string) {
        const { error } = await supabase
            .from('marketing_banners')
            .insert(banner);

        if (error) throw new Error(`Failed to create banner: ${error.message}`);

        await this.logAction(adminId, 'CREATE_BANNER', 'marketing_banner', undefined, banner);
    },

    async updateMarketingBanner(id: string, updates: any, adminId: string) {
        const { error } = await supabase
            .from('marketing_banners')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id);

        if (error) throw new Error(`Failed to update banner: ${error.message}`);

        await this.logAction(adminId, 'UPDATE_BANNER', 'marketing_banner', id, updates);
    },

    async deleteMarketingBanner(id: string, adminId: string) {
        const { error } = await supabase
            .from('marketing_banners')
            .delete()
            .eq('id', id);

        if (error) throw new Error(`Failed to delete banner: ${error.message}`);

        await this.logAction(adminId, 'DELETE_BANNER', 'marketing_banner', id);
    }
};
