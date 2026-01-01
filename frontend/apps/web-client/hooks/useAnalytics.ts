import { useEffect, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Analytics } from '../lib/analytics';

export interface AnalyticsProperties {
    [key: string]: string | number | boolean | undefined;
}

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
            // @ts-ignore
            Analytics.track('page_view', {
                path: pathname,
                search: searchParams?.toString(),
            });
        }
    }, [pathname, searchParams]);

    // Track event
    const track = useCallback((event: any, properties?: AnalyticsProperties) => {
        Analytics.track(event, properties);
    }, []);

    // Identify user
    const identify = useCallback((userId: string) => {
        Analytics.identify(userId);
    }, []);

    return {
        track,
        identify
    };
}
