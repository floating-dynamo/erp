import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateOperationResponse } from '../types';
import { Operation } from '../schemas';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useEditOperation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<UpdateOperationResponse, Error, { id: string; data: Partial<Operation> }>({
    mutationFn: async ({ id, data }) => {
      const response = await APIService.editOperation({ id, data });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'Operation updated',
        description: 'The operation has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.OPERATIONS] });
      
      // Also invalidate specific operation details
      if (data.operationId) {
        queryClient.invalidateQueries({ 
          queryKey: [QueryKeyString.OPERATIONS, data.operationId] 
        });
      }
    },
    onError: (err) => {
      toast({
        title: 'Failed to update the operation',
        description: 'An error occurred while updating the operation',
        variant: 'destructive',
      });
      console.error('Failed to update the operation: ', err);
    },
  });

  return mutation;
};