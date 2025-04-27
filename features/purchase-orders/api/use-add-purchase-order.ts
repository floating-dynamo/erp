import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { AddPurchaseOrderResponse } from '@/lib/types/purchase-order';
import { toast } from '@/hooks/use-toast';
import { PurchaseOrder } from '../schemas';
import { QueryKeyString } from '@/lib/types';

export const useAddPurchaseOrder = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<AddPurchaseOrderResponse, Error, PurchaseOrder>({
    mutationFn: async (purchaseOrder) => {
      const response = await APIService.addPurchaseOrder({ purchaseOrder });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'PO created',
        description: 'The purchase order has been created successfully',
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.PURCHASE_ORDERS],
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the PO',
        description: 'An error occurred while creating the purchase order',
        variant: 'destructive',
      });
      console.error('Failed to create the purchase order: ', err);
    },
  });

  return mutation;
};
