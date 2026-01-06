
import useSWR from 'swr';
import { providerService } from '@thelocals/core/services/providerService';
import { BookingStatus, DbBookingRequest } from '@thelocals/core/types';

export function useJobsData(userId: string | undefined, activeTab: string) {
    const shouldFetchRequests = userId && activeTab === 'requests';
    const shouldFetchActive = userId && activeTab === 'active';
    const shouldFetchHistory = userId && activeTab === 'history';

    // Requests
    const { data: requests, error: requestsError, isLoading: requestsLoading, mutate: mutateRequests } = useSWR(
        shouldFetchRequests ? ['requests', userId] : null,
        () => providerService.getRequests(userId!)
    );

    // Active Jobs
    const { data: activeJobs, error: activeError, isLoading: activeLoading, mutate: mutateActive } = useSWR(
        shouldFetchActive ? ['jobs-active', userId] : null,
        () => providerService.getJobs(userId!, ['CONFIRMED', 'EN_ROUTE', 'IN_PROGRESS'])
    );

    // History
    const { data: historyJobs, error: historyError, isLoading: historyLoading } = useSWR(
        shouldFetchHistory ? ['jobs-history', userId] : null,
        () => providerService.getJobs(userId!, ['COMPLETED', 'CANCELLED', 'EXPIRED'])
    );

    return {
        requests: requests || [],
        activeJobs: activeJobs || [],
        historyJobs: historyJobs || [],
        isLoading: requestsLoading || activeLoading || historyLoading,
        error: requestsError || activeError || historyError,
        mutateRequests,
        mutateActive
    };
}
