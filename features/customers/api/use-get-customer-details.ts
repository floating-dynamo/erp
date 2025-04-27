import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetCustomerDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: [QueryKeyString.CUSTOMERS, id],
    queryFn: async () => {
      const customer = await APIService.getCustomerById({ id });

      return customer;
    },
    enabled: !!id,
  });

  return query;
};
