
// packages/platform-core/src/services/useServiceAvailability.ts
import { useQuery, useQueries, UseQueryOptions } from '@tanstack/react-query'; 
// Note: Depending on repo version, might comprise 'react-query' vs '@tanstack/react-query'
import { isServiceEnabled } from './geoAvailability';

// Helper for single service check
export function useServiceAvailability(serviceCode: string, pincode: string) {
    return useQuery({
        queryKey: ['geo-availability', serviceCode, pincode],
        queryFn: () => isServiceEnabled(serviceCode, pincode),
        staleTime: 5 * 60 * 1000, // 5 minutes
        enabled: !!serviceCode && !!pincode
    });
}

// Helper for list of services (e.g. Home Screen Categories)
export function useServicesAvailability(serviceCodes: string[], pincode: string) {
    return useQueries({
        queries: serviceCodes.map((code) => ({
            queryKey: ['geo-availability', code, pincode],
            queryFn: () => isServiceEnabled(code, pincode),
            staleTime: 5 * 60 * 1000,
            enabled: !!code && !!pincode
        }))
    });
}
