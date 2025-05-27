import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetPurchaseOrderDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: [QueryKeyString.PURCHASE_ORDERS, id],
    queryFn: async () => {
      const purchaseOrder = await APIService.getPurchaseOrderDetails({ id });

      return purchaseOrder;
    },
    enabled: !!id,
  });

  return query;
};