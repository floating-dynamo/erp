import APIService from '@/services/api';
import { useMutation, QueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { WorkOrder } from '../schemas';
import { QueryKeyString } from '@/lib/types';

export const useAddWorkOrder = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation({
    mutationFn: async (workOrder: WorkOrder) => {
      const response = await APIService.addWorkOrder({ workOrder });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Work Order created',
        description: 'The work order has been created successfully',
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.WORK_ORDERS],
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the work order',
        description: 'An error occurred while creating the work order',
        variant: 'destructive',
      });
      console.error('Failed to create the work order: ', err);
    },
  });

  return mutation;
};
