import useSWR, { SWRConfiguration } from 'swr';
import { adminService, Booking, Dispute, SystemConfig, MarketingBanner } from "@thelocals/platform-core";

// Keys for cache invalidation
export const ADMIN_KEYS = {
    BOOKINGS: 'bookings',
    DISPUTES: 'disputes',
    STATS: 'financial_stats',
    PAYOUTS: 'payouts',
    CONFIGS: 'system_configs',
    BANNERS: 'marketing_banners',
    REPORTS: 'analytics_overview'
};

const swrConfig: SWRConfiguration = {
    revalidateOnFocus: false, // Don't aggressive revalidate for admin panels
    dedupingInterval: 5000,
    shouldRetryOnError: false
};

export function useBookings(status?: string) {
    const { data, error, mutate, isLoading } = useSWR(
        [ADMIN_KEYS.BOOKINGS, status],
        () => adminService.getAllBookings(status ? { status } : undefined),
        swrConfig
    );
    return { bookings: data || [], isLoading, error, mutate };
}

export function useDisputes(status: 'OPEN' | 'RESOLVED' | 'DISMISSED' = 'OPEN') {
    const { data, error, mutate, isLoading } = useSWR(
        [ADMIN_KEYS.DISPUTES, status],
        () => adminService.getDisputes(status),
        swrConfig
    );
    return { disputes: data || [], isLoading, error, mutate };
}

export function useFinancials() {
    const { data: stats, error: statsError, isLoading: statsLoading } = useSWR(
        ADMIN_KEYS.STATS,
        () => adminService.getFinancialStats(),
        swrConfig
    );

    const { data: payouts, error: payoutsError, isLoading: payoutsLoading, mutate: mutatePayouts } = useSWR(
        ADMIN_KEYS.PAYOUTS,
        () => adminService.getPayouts(),
        swrConfig
    );

    return {
        stats: stats || { totalRevenue: 0, totalCommission: 0, pendingPayouts: 0 },
        payouts: payouts || [],
        isLoading: statsLoading || payoutsLoading,
        error: statsError || payoutsError,
        mutatePayouts
    };
}

export function useConfigs() {
    const { data, error, mutate, isLoading } = useSWR(
        ADMIN_KEYS.CONFIGS,
        () => adminService.getSystemConfigs(),
        swrConfig
    );
    return { configs: data || [], isLoading, error, mutate };
}

export function useVerifications() {
    const { data, error, isLoading, mutate } = useSWR(
        'verifications-pending',
        () => adminService.getAllProviders('pending'),
        swrConfig
    );

    return {
        pendingProviders: data || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useAuditLogs(limit: number = 50) {
    const { data, error, isLoading, mutate } = useSWR(
        `audit-logs-${limit}`,
        () => adminService.getAuditLogs({ limit }),
        swrConfig
    );

    return {
        logs: data || [],
        isLoading,
        isError: error,
        mutate
    };
}

export function useBanners() {
    const { data, error, mutate, isLoading } = useSWR(
        ADMIN_KEYS.BANNERS,
        () => adminService.getMarketingBanners(),
        swrConfig
    );
    return { banners: data || [], isLoading, error, mutate };
}

export function useAnalytics() {
    const { data, error, isLoading } = useSWR(
        ADMIN_KEYS.REPORTS,
        () => adminService.getAnalyticsOverview(),
        { ...swrConfig, refreshInterval: 60000 } // Refresh every minute
    );
    return { analytics: data, isLoading, error };
}
