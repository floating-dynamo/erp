import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { WorkOrder } from '../schemas';
import { QueryKeyString } from '@/lib/types';

export const useEditWorkOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: WorkOrder }) => {
      const response = await APIService.updateWorkOrder(id, data);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Work Order updated',
        description: 'The work order has been updated successfully',
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.WORK_ORDERS],
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update the work order',
        description: 'An error occurred while updating the work order',
        variant: 'destructive',
      });
      console.error('Failed to update the work order: ', err);
    },
  });

  return mutation;
};
