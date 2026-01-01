/**
 * Simple Analytics Utility for Lokals Client App
 * Logs events to console for now, replaceable with Mixpanel/Google Analytics later
 */

'use client';

type EventName =
    | 'home_view'
    | 'v2_exposure'
    | 'service_view'
    | 'booking_start'
    | 'booking_step_complete'
    | 'booking_complete'
    | 'booking_error';

interface EventProperties {
    [key: string]: string | number | boolean | undefined;
}

export const Analytics = {
    /**
     * Log an analytics event
     */
    track: (eventName: EventName, properties?: EventProperties) => {
        // In production, this would send data to an external service
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] ${eventName}`, properties);
        }

        // Example integration point:
        // window.gtag?.('event', eventName, properties);
    },

    /**
     * Identify a user (e.g. on login)
     */
    identify: (userId: string) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[Analytics] Identify User: ${userId}`);
        }
    }
};
