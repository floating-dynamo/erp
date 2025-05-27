import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';
import { PurchaseOrder } from '../schemas';

export const useEditPurchaseOrder = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, purchaseOrder }: { id: string; purchaseOrder: PurchaseOrder }) => {
      const response = await APIService.editPurchaseOrder({ id, data: purchaseOrder });
      return response;
    },
    onSuccess: (_, { id }) => {
      toast({
        title: 'Purchase Order edited',
        description: 'The purchase order has been edited successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.PURCHASE_ORDERS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.PURCHASE_ORDERS, id] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update the purchase order',
        description: 'An error occurred while updating the purchase order',
        variant: 'destructive',
      });
      console.error('Failed to update the purchase order: ', err);
    },
  });

  return mutation;
};