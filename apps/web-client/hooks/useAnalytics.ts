import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { analytics, AnalyticsEvent, AnalyticsProperties } from '../lib/analytics';

/**
 * React hook for analytics tracking
 * 
 * Provides convenient methods for tracking events and automatically tracks page views.
 */
export function useAnalytics() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Track page views on route change
    useEffect(() => {
        if (pathname) {
            analytics.page(undefined, {
                search: searchParams?.toString(),
            });
        }
    }, [pathname, searchParams]);

    // Track event
    const track = useCallback((event: AnalyticsEvent, properties?: AnalyticsProperties) => {
        analytics.track(event, properties);
    }, []);

    // Identify user
    const identify = useCallback((userId: string, traits?: AnalyticsProperties) => {
        analytics.identify(userId, traits);
    }, []);

    // Reset on logout
    const reset = useCallback(() => {
        analytics.reset();
    }, []);

    return {
        track,
        identify,
        reset,
    };
}
