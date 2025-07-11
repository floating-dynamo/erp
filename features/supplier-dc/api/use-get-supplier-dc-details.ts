import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetSupplierDCDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: [QueryKeyString.SUPPLIER_DCS, id],
    queryFn: async () => {
      const supplierDC = await APIService.getSupplierDCById({ id });

      return supplierDC;
    },
    enabled: !!id,
  });

  return query;
};
