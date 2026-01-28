
import { useQueries, UseQueryResult } from '@tanstack/react-query';
import { UserLocation } from '../maps/types/map';

const GEO_WORKER_URL = process.env.NEXT_PUBLIC_GEO_WORKER_URL || '';

export function useGeoFilteredServices(location: UserLocation | undefined) {
  // Hardcoded for now as per spec "PLUMBING", "CLEANING", ... should ideally come from a constants file or config
  const serviceCodes = ['PLUMBING', 'CLEANING', 'ELECTRICIAN', 'PAINTING'];
  
  const results = useQueries({
    queries: serviceCodes.map(code => ({
      queryKey: ['geo-service', code, location?.pincode],
      queryFn: async (): Promise<any> => {
           if (!GEO_WORKER_URL) return { is_enabled: false }; // Fail safe
           const res = await fetch(
            `${GEO_WORKER_URL}/check?service=${code}&pincode=${location?.pincode}`
          );
          return res.json();
      },
      enabled: !!location?.pincode && !!GEO_WORKER_URL,
      staleTime: 2 * 60 * 1000 // 2min (shorter for location changes)
    }))
  });

  return results;
}
