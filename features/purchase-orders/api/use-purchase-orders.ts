import { QueryKeyString } from '@/lib/types';
import { PurchaseOrderFiltersParams } from '../types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const usePurchaseOrders = (filters: PurchaseOrderFiltersParams = {}) => {
  const { 
    customerId,
    buyerNameFilter,
    enquiryId,
    deliveryDateFrom,
    deliveryDateTo,
    totalValueFrom,
    totalValueTo,
    page,
    limit,
    searchQuery
  } = filters;
  
  const query = useQuery({
    queryKey: [
      QueryKeyString.PURCHASE_ORDERS,
      customerId,
      buyerNameFilter,
      enquiryId,
      deliveryDateFrom,
      deliveryDateTo,
      totalValueFrom,
      totalValueTo,
      page,
      limit,
      searchQuery
    ],
    queryFn: async () => {
      const response = await APIService.getPurchaseOrders(filters);

      if (!response) {
        return { purchaseOrders: [], total: 0, totalPages: 0 };
      }

      return response;
    },
  });

  return query;
};
