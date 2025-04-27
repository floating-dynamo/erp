import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const usePurchaseOrders = ({ customerId }: { customerId?: string }) => {
  const query = useQuery({
    queryKey: ['purchase-orders', customerId],
    queryFn: async () => {
      const response = await APIService.getPurchaseOrders({ customerId });

      if (!response) {
        return null;
      }

      const { purchaseOrders } = response;
      return purchaseOrders;
    },
  });

  return query;
};
