import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useEnquiries = ({
  customerId,
  page,
  limit,
  searchQuery,
}: {
  customerId?: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
} = {}) => {
  const query = useQuery({
    queryKey: [QueryKeyString.ENQUIRIES, customerId, page, limit, searchQuery],
    queryFn: async () => {
      const response = await APIService.getEnquiries({
        customerId,
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
