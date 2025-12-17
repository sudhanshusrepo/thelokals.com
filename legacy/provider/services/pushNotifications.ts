import { supabase } from '@thelocals/core/services/supabase';
import { logger } from '@thelocals/core/services/logger';

export interface PushNotificationToken {
    token: string;
    deviceId?: string;
    platform: 'ios' | 'android' | 'web';
}

class PushNotificationService {
    private token: string | null = null;

    /**
     * Request permission and get push notification token
     * For web, this would use service workers and Web Push API
     * For mobile (Expo), this would use Expo's push notification API
     */
    async requestPermission(): Promise<boolean> {
        try {
            // Check if we're in a browser environment
            if (typeof window === 'undefined' || !('Notification' in window)) {
                // console.log('Push notifications not supported in this environment');
                return false;
            }

            // Request permission
            const permission = await Notification.requestPermission();

            if (permission === 'granted') {
                // console.log('Notification permission granted');
                return true;
            } else {
                // console.log('Notification permission denied');
                return false;
            }
        } catch (error) {
            logger.error('Error requesting notification permission:', error);
            return false;
        }
    }

    /**
     * Register push notification token with backend
     */
    async registerToken(providerId: string, tokenData: PushNotificationToken): Promise<void> {
        try {
            const { error } = await supabase
                .from('provider_push_tokens')
                .upsert({
                    provider_id: providerId,
                    push_token: tokenData.token,
                    device_id: tokenData.deviceId,
                    platform: tokenData.platform,
                    last_used_at: new Date().toISOString(),
                }, {
                    onConflict: 'provider_id,push_token'
                });

            if (error) {
                logger.error('Error registering push token:', error);
                throw error;
            }

            this.token = tokenData.token;
            // console.log('Push token registered successfully');
        } catch (error) {
            logger.error('Failed to register push token:', error);
            throw error;
        }
    }

    /**
     * Unregister push notification token
     */
    async unregisterToken(providerId: string): Promise<void> {
        if (!this.token) {
            return;
        }

        try {
            const { error } = await supabase
                .from('provider_push_tokens')
                .delete()
                .match({
                    provider_id: providerId,
                    push_token: this.token,
                });

            if (error) {
                logger.error('Error unregistering push token:', error);
                throw error;
            }

            this.token = null;
            // console.log('Push token unregistered successfully');
        } catch (error) {
            logger.error('Failed to unregister push token:', error);
            throw error;
        }
    }

    /**
     * Show a local notification (for testing)
     */
    showLocalNotification(title: string, body: string, data?: any): void {
        if (typeof window === 'undefined' || !('Notification' in window)) {
            // console.log('Notifications not supported');
            return;
        }

        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/logo.png',
                badge: '/badge.png',
                data,
                tag: data?.id || 'default',
                requireInteraction: true,
            });

            notification.onclick = () => {
                window.focus();
                if (data?.action_url) {
                    window.location.href = data.action_url;
                }
                notification.close();
            };
        }
    }

    /**
     * Initialize push notifications for the provider
     * This should be called when the provider logs in
     */
    async initialize(providerId: string): Promise<void> {
        try {
            // Request permission
            const hasPermission = await this.requestPermission();

            if (!hasPermission) {
                // console.log('Push notifications not enabled - permission denied');
                return;
            }

            // For web, we would generate a token using service worker
            // For now, we'll use a placeholder
            // In production, you would:
            // 1. Register a service worker
            // 2. Get the push subscription
            // 3. Send the subscription to your backend

            // Placeholder token for web
            const webToken = `web-${providerId}-${Date.now()}`;

            await this.registerToken(providerId, {
                token: webToken,
                platform: 'web',
            });

            // console.log('Push notifications initialized');
        } catch (error) {
            logger.error('Failed to initialize push notifications:', error);
        }
    }

    /**
     * Cleanup push notifications
     */
    async cleanup(providerId: string): Promise<void> {
        try {
            await this.unregisterToken(providerId);
            // console.log('Push notifications cleaned up');
        } catch (error) {
            logger.error('Failed to cleanup push notifications:', error);
        }
    }
}

export const pushNotificationService = new PushNotificationService();

/**
 * Service Worker Registration (for Web Push)
 * This should be called in your app initialization
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        // console.log('Service workers not supported');
        return null;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        // console.log('Service worker registered:', registration);
        return registration;
    } catch (error) {
        logger.error('Service worker registration failed:', error);
        return null;
    }
}
