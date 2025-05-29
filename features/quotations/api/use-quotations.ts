import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useQuotations = ({
  page,
  limit,
  searchQuery,
}: {
  page?: number;
  limit?: number;
  searchQuery?: string;
} = {}) => {
  const query = useQuery({
    queryKey: [QueryKeyString.QUOTATIONS, page, limit, searchQuery],
    queryFn: async () => {
      const response = await APIService.getQuotations({
        page,
        limit,
        searchQuery,
      });

      if (!response) {
        return null;
      }

      return response;
    },
  });

  return query;
};
