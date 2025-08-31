import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { QueryKeyString } from '@/lib/types';

export const useWorkOrderStats = () => {
  const query = useQuery({
    queryKey: [QueryKeyString.WORK_ORDERS, 'stats'],
    queryFn: () => APIService.getWorkOrderStats(),
    staleTime: 60000, // 1 minute
  });

  return query;
};
