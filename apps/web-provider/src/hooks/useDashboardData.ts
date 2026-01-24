
import useSWR, { mutate } from 'swr';
import { providerService } from "@thelocals/platform-core";

export function useDashboardData(userId: string | undefined) {
    const { data: stats, error: statsError, isLoading: statsLoading } = useSWR(
        userId ? ['dashboard-stats', userId] : null,
        () => providerService.getDashboardStats(userId!)
    );

    const { data: jobs, error: jobsError, isLoading: jobsLoading } = useSWR(
        userId ? ['active-jobs', userId] : null,
        () => providerService.getJobs(userId!, ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'])
    );

    const mutateActive = async () => {
        // Revalidate both keys
        if (userId) {
            mutate(['active-jobs', userId]);
            mutate(['dashboard-stats', userId]);
        }
    };

    return {
        stats: stats || { monthlyEarnings: 0, currentBalance: 0, activeJobs: 0, completedToday: 0, rating: 5.0, trend: 0 },
        recentJobs: jobs || [],
        loading: statsLoading || jobsLoading,
        error: statsError || jobsError,
        mutateActive
    };
}
