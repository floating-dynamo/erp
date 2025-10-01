import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { DeleteOperationResponse } from '../types';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useDeleteOperation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<DeleteOperationResponse, Error, string>({
    mutationFn: async (id: string) => {
      const response = await APIService.deleteOperation({ id });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Operation deleted',
        description: 'The operation has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.OPERATIONS] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to delete the operation',
        description: 'An error occurred while deleting the operation',
        variant: 'destructive',
      });
      console.error('Failed to delete the operation: ', err);
    },
  });

  return mutation;
};