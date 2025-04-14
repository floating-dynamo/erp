import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useSupplierDcs = () => {
  const query = useQuery({
    queryKey: ['supplierDcs'],
    queryFn: async () => {
      const response = await APIService.getSupplierDcs();

      if (!response) {
        return null;
      }

      const { supplierDcs } = response;
      return supplierDcs;
    },
  });

  return query;
};
