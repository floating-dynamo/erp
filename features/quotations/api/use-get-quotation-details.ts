import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetQuotationDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: [QueryKeyString.QUOTATIONS, id],
    queryFn: async () => {
      const quotation = await APIService.getQuotationById({ id });

      return quotation;
    },
    enabled: !!id,
  });

  return query;
};
