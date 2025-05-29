import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useEnquiries = ({
  customerId,
  page,
  limit,
  searchQuery,
  customerFilter,
  dueDateFrom,
  dueDateTo,
  quotationCreated,
}: {
  customerId?: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
  customerFilter?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  quotationCreated?: string;
} = {}) => {
  const query = useQuery({
    queryKey: [QueryKeyString.ENQUIRIES, customerId, page, limit, searchQuery, customerFilter, dueDateFrom, dueDateTo, quotationCreated],
    queryFn: async () => {
      const response = await APIService.getEnquiries({
        customerId,
        page,
        limit,
        searchQuery,
        customerFilter,
        dueDateFrom,
        dueDateTo,
        quotationCreated,
      });

      if (!response) {
        return null;
      }

      return response;
    },
  });

  return query;
};
