import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useQuotations = ({
  page,
  limit,
  searchQuery,
  customerFilter,
  enquiryNumberFilter,
  amountFrom,
  amountTo,
}: {
  page?: number;
  limit?: number;
  searchQuery?: string;
  customerFilter?: string;
  enquiryNumberFilter?: string;
  amountFrom?: string;
  amountTo?: string;
} = {}) => {
  const query = useQuery({
    queryKey: [
      QueryKeyString.QUOTATIONS,
      page,
      limit,
      searchQuery,
      customerFilter,
      enquiryNumberFilter,
      amountFrom,
      amountTo,
    ],
    queryFn: async () => {
      const response = await APIService.getQuotations({
        page,
        limit,
        searchQuery,
        customerFilter,
        enquiryNumberFilter,
        amountFrom,
        amountTo,
      });

      if (!response) {
        return null;
      }

      return response;
    },
  });

  return query;
};
