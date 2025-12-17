
import { useQuery } from '@tanstack/react-query';
import { workerService } from '@thelocals/core/services/workerService';

export const useWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: () => workerService.getWorkers(),
  });
};
