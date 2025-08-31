import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useUpdateWorkOrderStatus = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      status,
      actualStartDate,
      actualEndDate,
      remarks,
    }: {
      id: string;
      status: string;
      actualStartDate?: string;
      actualEndDate?: string;
      remarks?: string;
    }) => {
      const response = await APIService.updateWorkOrderStatus({
        id,
        status,
        actualStartDate,
        actualEndDate,
        remarks,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Work Order status updated',
        description: 'The work order status has been updated successfully',
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.WORK_ORDERS],
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update work order status',
        description: 'An error occurred while updating the work order status',
        variant: 'destructive',
      });
      console.error('Failed to update work order status: ', err);
    },
  });

  return mutation;
};
