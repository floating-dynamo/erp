import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetOperationDetails = (id: string) => {
  const query = useQuery({
    queryKey: [QueryKeyString.OPERATIONS, id],
    queryFn: async () => {
      const response = await APIService.getOperationById({ id });
      return response;
    },
    enabled: !!id,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
};