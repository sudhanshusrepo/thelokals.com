/**
 * Analytics Abstraction Layer with Google Analytics 4
 * 
 * Provides a unified interface for tracking events.
 * Currently supports Google Analytics 4.
 */

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag?: (
            command: 'config' | 'event' | 'set' | 'js',
            targetIdOrDate: string | Date,
            config?: Record<string, any>
        ) => void;
        dataLayer?: any[];
    }
}

export type AnalyticsEvent =
    // Auth events
    | 'user_signup'
    | 'user_signin'
    | 'user_signout'
    | 'auth_error'
    // Onboarding funnel
    | 'service_search_initiated'
    | 'service_selected'
    | 'booking_started'
    | 'booking_details_entered'
    | 'booking_confirmed'
    | 'booking_abandoned'
    // User interactions
    | 'category_clicked'
    | 'chat_message_sent'
    | 'voice_recording_started'
    | 'video_recording_started'
    // Performance
    | 'page_load'
    | 'web_vitals';

export interface AnalyticsProperties {
    [key: string]: string | number | boolean | undefined;
}

class Analytics {
    private isEnabled: boolean;
    private userId: string | null = null;
    private gaId: string | null = null;
    private initialized: boolean = false;

    constructor() {
        this.isEnabled = typeof window !== 'undefined';
        this.gaId = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null : null;
    }

    /**
     * Initialize Google Analytics 4 (lazy initialization)
     */
    private initializeGA() {
        if (this.initialized || !this.gaId || !this.isEnabled) return;

        // Load gtag.js script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${this.gaId}`;
        document.head.appendChild(script);

        // Initialize dataLayer
        window.dataLayer = window.dataLayer || [];
        window.gtag = function gtag(...args: any[]) {
            window.dataLayer!.push(args);
        };
        window.gtag('js', new Date());
        window.gtag('config', this.gaId, {
            send_page_view: false, // We'll handle page views manually
        });

        this.initialized = true;
    }

    /**
     * Initialize analytics with user context
     */
    identify(userId: string, traits?: AnalyticsProperties) {
        this.userId = userId;

        if (!this.isEnabled) return;

        // Initialize GA on first use
        this.initializeGA();

        // Google Analytics
        if (window.gtag && this.gaId) {
            window.gtag('set', this.gaId, {
                user_id: userId,
                ...traits,
            });
        }

        console.log('[Analytics] Identify:', userId, traits);
    }

    /**
     * Track an event
     */
    track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
        if (!this.isEnabled) return;

        // Initialize GA on first use
        this.initializeGA();

        const eventData = {
            ...properties,
            userId: this.userId,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            path: window.location.pathname,
        };

        // Google Analytics
        if (window.gtag && this.gaId) {
            window.gtag('event', event, eventData);
        }

        console.log('[Analytics] Track:', event, eventData);
    }

    /**
     * Track a page view
     */
    page(name?: string, properties?: AnalyticsProperties) {
        if (!this.isEnabled) return;

        // Initialize GA on first use
        this.initializeGA();

        const pageData = {
            page_title: name || document.title,
            page_location: window.location.href,
            page_path: window.location.pathname,
            ...properties,
            userId: this.userId,
        };

        // Google Analytics
        if (window.gtag && this.gaId) {
            window.gtag('event', 'page_view', pageData);
        }

        console.log('[Analytics] Page:', pageData);
    }

    /**
     * Clear user context (on logout)
     */
    reset() {
        this.userId = null;

        if (!this.isEnabled) return;

        // Google Analytics - clear user_id
        if (window.gtag && this.gaId) {
            window.gtag('set', this.gaId, {
                user_id: null,
            });
        }

        console.log('[Analytics] Reset');
    }
}

// Singleton instance
export const analytics = new Analytics();

/**
 * Track conversion funnel step
 */
export function trackFunnelStep(
    funnelName: string,
    step: number,
    stepName: string,
    properties?: AnalyticsProperties
) {
    analytics.track('booking_started', {
        funnel: funnelName,
        step,
        stepName,
        ...properties,
    });
}

/**
 * Track funnel abandonment
 */
export function trackFunnelAbandonment(
    funnelName: string,
    step: number,
    stepName: string,
    reason?: string
) {
    analytics.track('booking_abandoned', {
        funnel: funnelName,
        step,
        stepName,
        reason,
    });
}
