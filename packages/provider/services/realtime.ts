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
                (payload) => {
                    // console.log('New booking request:', payload.new);
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
                (payload) => {
                    // console.log('Booking updated:', payload.new);
                    onBookingUpdate(payload.new as BookingRequest);
                }
            )
            .subscribe((status) => {
                // console.log('Booking subscription status:', status);
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
                (payload) => {
                    // console.log('New notification:', payload.new);
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
                (payload) => {
                    // console.log('Notification updated:', payload.new);
                    onNotificationUpdate(payload.new as ProviderNotification);
                }
            )
            .subscribe((status) => {
                // console.log('Notification subscription status:', status);
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
}

export const realtimeService = new RealtimeService();
