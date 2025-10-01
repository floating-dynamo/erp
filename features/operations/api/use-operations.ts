import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useOperations = (filters?: {
  page?: number;
  limit?: number;
  searchTerm?: string;
  processFilter?: string;
  workCenterFilter?: string;
}) => {
  const query = useQuery({
    queryKey: [QueryKeyString.OPERATIONS, filters],
    queryFn: async () => {
      const response = await APIService.getOperations(filters);

      if (!response) {
        return null;
      }

      return response;
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
};