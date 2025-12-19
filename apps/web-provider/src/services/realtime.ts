import { supabase } from '@thelocals/core/services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface BookingRequest {
    id: string;
    client_id: string;
    provider_id: string;
    service_category: string;
    status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    requirements: any;
    ai_checklist: string[];
    estimated_cost: number;
    location: { lat: number; lng: number };
    created_at: string;
    updated_at: string;
}

export interface ProviderNotification {
    id: string;
    provider_id: string;
    type: 'booking_request' | 'booking_update' | 'payment' | 'system' | 'promotion';
    title: string;
    message: string;
    data: any;
    read: boolean;
    action_url?: string;
    created_at: string;
}

class RealtimeService {
    private bookingChannel: RealtimeChannel | null = null;
    private notificationChannel: RealtimeChannel | null = null;

    /**
     * Subscribe to booking requests for a provider
     */
    subscribeToBookingRequests(
        providerId: string,
        onNewBooking: (booking: BookingRequest) => void,
        onBookingUpdate: (booking: BookingRequest) => void
    ) {
        // Unsubscribe from existing channel if any
        if (this.bookingChannel) {
            this.bookingChannel.unsubscribe();
        }

        this.bookingChannel = supabase
            .channel(`bookings:provider:${providerId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'bookings',
                    filter: `provider_id=eq.${providerId}`,
                },
                (payload: any) => {

                    onNewBooking(payload.new as BookingRequest);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'bookings',
                    filter: `provider_id=eq.${providerId}`,
                },
                (payload: any) => {

                    onBookingUpdate(payload.new as BookingRequest);
                }
            )
            .subscribe((status: any) => {

            });

        return () => {
            this.bookingChannel?.unsubscribe();
            this.bookingChannel = null;
        };
    }

    /**
     * Subscribe to notifications for a provider
     */
    subscribeToNotifications(
        providerId: string,
        onNewNotification: (notification: ProviderNotification) => void,
        onNotificationUpdate: (notification: ProviderNotification) => void
    ) {
        // Unsubscribe from existing channel if any
        if (this.notificationChannel) {
            this.notificationChannel.unsubscribe();
        }

        this.notificationChannel = supabase
            .channel(`notifications:provider:${providerId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'provider_notifications',
                    filter: `provider_id=eq.${providerId}`,
                },
                (payload: any) => {

                    onNewNotification(payload.new as ProviderNotification);
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'provider_notifications',
                    filter: `provider_id=eq.${providerId}`,
                },
                (payload: any) => {

                    onNotificationUpdate(payload.new as ProviderNotification);
                }
            )
            .subscribe((status: any) => {

            });

        return () => {
            this.notificationChannel?.unsubscribe();
            this.notificationChannel = null;
        };
    }

    /**
     * Unsubscribe from all channels
     */
    unsubscribeAll() {
        if (this.bookingChannel) {
            this.bookingChannel.unsubscribe();
            this.bookingChannel = null;
        }
        if (this.notificationChannel) {
            this.notificationChannel.unsubscribe();
            this.notificationChannel = null;
        }
    }

    /**
     * Fetch existing notifications
     */
    async getNotifications(providerId: string): Promise<ProviderNotification[]> {
        const { data, error } = await supabase
            .from('provider_notifications')
            .select('*')
            .eq('provider_id', providerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
        return data || [];
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string) {
        return await supabase
            .from('provider_notifications')
            .update({ read: true })
            .eq('id', notificationId);
    }

    /**
     * Mark all notifications as read
     */
    async markAllAsRead(providerId: string) {
        return await supabase
            .from('provider_notifications')
            .update({ read: true })
            .eq('provider_id', providerId)
            .eq('read', false);
    }

    /**
     * Delete notification
     */
    async deleteNotification(notificationId: string) {
        return await supabase
            .from('provider_notifications')
            .delete()
            .eq('id', notificationId);
    }
}

export const realtimeService = new RealtimeService();
