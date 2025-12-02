import { supabase } from './supabase';

export type AdminRole = 'super_admin' | 'ops_admin' | 'read_only';

export interface AdminUser {
    id: string;
    email: string;
    google_id?: string;
    role: AdminRole;
    full_name?: string;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface ServiceAvailability {
    id: string;
    service_category_id: string;
    location_type: 'city' | 'area' | 'pincode';
    location_value: string;
    status: 'ENABLED' | 'DISABLED';
    reason?: string;
    disabled_by?: string;
    disabled_at?: string;
    created_at: string;
    updated_at: string;
}

export interface ActiveSession {
    id: string;
    user_id: string;
    user_type: 'customer' | 'provider';
    session_state?: string;
    city?: string;
    current_booking_id?: string;
    last_activity: string;
    metadata?: Record<string, any>;
    created_at: string;
}

export interface AdminAuditLog {
    id: string;
    admin_user_id: string;
    action: string;
    resource_type: string;
    resource_id?: string;
    changes?: Record<string, any>;
    ip_address?: string;
    created_at: string;
}

/**
 * Admin Service - Handles all admin panel operations
 */
export const adminService = {
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
            .from('admin_audit_logs')
            .insert({
                admin_id: adminId,
                action,
                resource_type: resourceType,
                resource_id: resourceId,
                changes,
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
     * Get admin user by email
     */
    async getAdminByEmail(email: string): Promise<AdminUser | null> {
        const { data, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw new Error(`Failed to fetch admin user: ${error.message}`);
        }
        return data;
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
};
