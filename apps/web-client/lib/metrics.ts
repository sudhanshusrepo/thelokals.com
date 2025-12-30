/**
 * Metrics and Performance Tracking
 * 
 * Defines onboarding funnel metrics and Web Vitals tracking.
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

import { Analytics } from './analytics';

/**
 * Onboarding Funnel Steps
 */
export enum OnboardingStep {
    LANDING = 0,
    SEARCH_INITIATED = 1,
    SERVICE_SELECTED = 2,
    BOOKING_STARTED = 3,
    DETAILS_ENTERED = 4,
    BOOKING_CONFIRMED = 5,
}

export const ONBOARDING_FUNNEL_STEPS = {
    [OnboardingStep.LANDING]: 'Landing Page',
    [OnboardingStep.SEARCH_INITIATED]: 'Search Initiated',
    [OnboardingStep.SERVICE_SELECTED]: 'Service Selected',
    [OnboardingStep.BOOKING_STARTED]: 'Booking Started',
    [OnboardingStep.DETAILS_ENTERED]: 'Details Entered',
    [OnboardingStep.BOOKING_CONFIRMED]: 'Booking Confirmed',
};

/**
 * Track Web Vitals (Core Web Vitals)
 */
export function trackWebVitals() {
    if (typeof window === 'undefined') return;

    // Use Next.js Web Vitals reporting
    // This should be called in _app.tsx or layout.tsx
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS((metric) => {
            // Note: 'web_vitals' is not in the new EventName union, handled via type augmentation or generic casting if stricter enforcement needed
            // For now, trusting Analytics to log whatever is passed
            // @ts-ignore
            Analytics.track('web_vitals', {
                metric: 'CLS',
                value: metric.value,
                rating: metric.rating,
            });
        });

        onFID((metric) => {
            // @ts-ignore
            Analytics.track('web_vitals', {
                metric: 'FID',
                value: metric.value,
                rating: metric.rating,
            });
        });

        onFCP((metric) => {
            // @ts-ignore
            Analytics.track('web_vitals', {
                metric: 'FCP',
                value: metric.value,
                rating: metric.rating,
            });
        });

        onLCP((metric) => {
            // @ts-ignore
            Analytics.track('web_vitals', {
                metric: 'LCP',
                value: metric.value,
                rating: metric.rating,
            });
        });

        onTTFB((metric) => {
            // @ts-ignore
            Analytics.track('web_vitals', {
                metric: 'TTFB',
                value: metric.value,
                rating: metric.rating,
            });
        });
    });
}

/**
 * Track conversion rate for a specific funnel
 */
export function calculateConversionRate(
    startStep: OnboardingStep,
    endStep: OnboardingStep,
    startCount: number,
    endCount: number
): number {
    if (startCount === 0) return 0;
    return (endCount / startCount) * 100;
}
