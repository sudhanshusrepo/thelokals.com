
import { supabase } from './supabase';
import { logger } from './logger';

// Types for notification data
export interface NotificationPreferences {
    id: string;
    user_id: string;
    push_enabled: boolean;
    new_job_request: boolean;
    job_accepted: boolean;
    provider_en_route: boolean;
    job_started: boolean;
    job_completed: boolean;
    payment_received: boolean;
    payment_required: boolean;
    new_review: boolean;
    job_cancelled: boolean;
    email_enabled: boolean;
    email_booking_summary: boolean;
    email_weekly_summary: boolean;
    email_promotional: boolean;
    sms_enabled: boolean;
    sms_critical_only: boolean;
    created_at: string;
    updated_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    type: string;
    title: string;
    body: string;
    data: Record<string, any>;
    sent_via: string[];
    read: boolean;
    read_at: string | null;
    booking_id: string | null;
    created_at: string;
}

export interface Message {
    id: string;
    booking_id: string;
    sender_id: string;
    receiver_id: string;
    message: string;
    message_type: 'text' | 'image' | 'location' | 'system';
    metadata: Record<string, any>;
    created_at: string;
    read_at: string | null;
    delivered_at: string | null;
}

export const notificationService = {
    // Legacy method for backward compatibility
    async notifyProviders(providerIds: string[], title: string, message: string, data?: any) {
        if (!providerIds || providerIds.length === 0) return;

        logger.info('Sending notifications to providers', { providerIds, title, message });
        console.log(`[NotificationService] Sending "${title}" to [${providerIds.length}] providers:`, providerIds);

        try {
            const notifications = providerIds.map(pid => ({
                user_id: pid,
                type: 'system',
                title: title,
                body: message,
                data: data || {},
                sent_via: ['in-app']
            }));

            const { error } = await supabase.from('notifications').insert(notifications);
            if (error) {
                console.warn('[NotificationService] Failed to insert notification', error.message);
            }
        } catch (e) {
            console.error('[NotificationService] Error:', e);
        }
    },

    // FCM Token Management (Neutralized - will be implemented later)
    async registerToken(token: string, platform: 'web' | 'ios' | 'android'): Promise<void> {
        // TODO: Implement FCM token registration when Firebase is set up
        logger.info('FCM token registration pending implementation', { token, platform });
        console.log('[NotificationService] FCM not configured yet. Token:', token);
        return;
    },

    // Notification Preferences
    async getPreferences(): Promise<NotificationPreferences | null> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notification_preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            logger.error('Error fetching notification preferences', error);
            throw error;
        }
        return data;
    },

    async updatePreferences(
        preferences: Partial<Omit<NotificationPreferences, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
    ): Promise<NotificationPreferences> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notification_preferences')
            .update({
                ...preferences,
                updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) {
            logger.error('Error updating notification preferences', error);
            throw error;
        }
        return data;
    },

    // Notifications
    async getNotifications(limit: number = 50): Promise<Notification[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            logger.error('Error fetching notifications', error);
            throw error;
        }
        return data || [];
    },

    async markAsRead(notificationId: string): Promise<boolean> {
        const { data, error } = await supabase.rpc('mark_notification_read', {
            p_notification_id: notificationId
        });

        if (error) {
            logger.error('Error marking notification as read', error);
            throw error;
        }
        return data;
    },

    async markAllAsRead(): Promise<number> {
        const { data, error } = await supabase.rpc('mark_all_notifications_read');

        if (error) {
            logger.error('Error marking all notifications as read', error);
            throw error;
        }
        return data;
    },

    async getUnreadCount(): Promise<number> {
        const { data, error } = await supabase.rpc('get_unread_notification_count');

        if (error) {
            logger.error('Error fetching unread count', error);
            throw error;
        }
        return data || 0;
    },

    // Subscribe to new notifications
    subscribeToNotifications(callback: (notification: Notification) => void) {
        return supabase
            .channel('notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications'
                },
                (payload: any) => {
                    callback(payload.new as Notification);
                }
            )
            .subscribe();
    },

    // In-App Messaging
    async sendMessage(
        bookingId: string,
        receiverId: string,
        message: string,
        messageType: 'text' | 'image' | 'location' | 'system' = 'text'
    ): Promise<Message> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
            .from('messages')
            .insert({
                booking_id: bookingId,
                sender_id: user.id,
                receiver_id: receiverId,
                message,
                message_type: messageType,
                metadata: {}
            })
            .select()
            .single();

        if (error) {
            logger.error('Error sending message', error);
            throw error;
        }
        return data;
    },

    async getMessages(bookingId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('booking_id', bookingId)
            .order('created_at', { ascending: true });

        if (error) {
            logger.error('Error fetching messages', error);
            throw error;
        }
        return data || [];
    },

    async markMessageAsRead(messageId: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
            .from('messages')
            .update({ read_at: new Date().toISOString() })
            .eq('id', messageId)
            .eq('receiver_id', user.id);

        if (error) {
            logger.error('Error marking message as read', error);
            throw error;
        }
    },

    // Subscribe to new messages for a booking
    subscribeToMessages(bookingId: string, callback: (message: Message) => void) {
        return supabase
            .channel(`messages:${bookingId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `booking_id=eq.${bookingId}`
                },
                (payload: any) => {
                    callback(payload.new as Message);
                }
            )
            .subscribe();
    }
};
