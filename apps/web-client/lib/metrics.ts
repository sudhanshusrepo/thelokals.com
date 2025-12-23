/**
 * Metrics and Performance Tracking
 * 
 * Defines onboarding funnel metrics and Web Vitals tracking.
 */

import { analytics } from './analytics';

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
            analytics.track('web_vitals', {
                metric: 'CLS',
                value: metric.value,
                rating: metric.rating,
            });
        });

        onFID((metric) => {
            analytics.track('web_vitals', {
                metric: 'FID',
                value: metric.value,
                rating: metric.rating,
            });
        });

        onFCP((metric) => {
            analytics.track('web_vitals', {
                metric: 'FCP',
                value: metric.value,
                rating: metric.rating,
            });
        });

        onLCP((metric) => {
            analytics.track('web_vitals', {
                metric: 'LCP',
                value: metric.value,
                rating: metric.rating,
            });
        });

        onTTFB((metric) => {
            analytics.track('web_vitals', {
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
