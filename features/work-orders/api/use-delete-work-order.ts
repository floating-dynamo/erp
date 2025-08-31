import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const response = await APIService.deleteWorkOrder({ id });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Work Order deleted',
        description: 'The work order has been deleted successfully',
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.WORK_ORDERS],
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to delete the work order',
        description: 'An error occurred while deleting the work order',
        variant: 'destructive',
      });
      console.error('Failed to delete the work order: ', err);
    },
  });

  return mutation;
};
