
import { supabase } from './supabase';
import { logger } from './logger';

export const notificationService = {
    /**
     * Sends a notification to a list of providers.
     * @param providerIds Array of provider IDs
     * @param title Notification title
     * @param message Notification body
     * @param data Optional data payload
     */
    async notifyProviders(providerIds: string[], title: string, message: string, data?: any) {
        if (!providerIds || providerIds.length === 0) return;

        logger.info('Sending notifications to providers', { providerIds, title, message });

        // 1. Log to Console (for Dev)
        console.log(`[NotificationService] Sending "${title}" to [${providerIds.length}] providers:`, providerIds);

        // 2. Try to Insert into Notifications Table (if exists)
        try {
            const notifications = providerIds.map(pid => ({
                user_id: pid,
                title: title,
                message: message,
                data: data,
                is_read: false,
                created_at: new Date().toISOString()
            }));

            const { error } = await supabase.from('notifications').insert(notifications);
            if (error) {
                // Ignore error strictly for now as table might not exist
                console.warn('[NotificationService] Failed to insert DB notification (table might be missing)', error.message);
            }
        } catch (e) {
            // Fallback
        }

        // 3. Trigger Edge Function for Push Notifications (Placeholder)
        // await supabase.functions.invoke('send-push-notification', { body: { providerIds, title, message } });
    }
};
