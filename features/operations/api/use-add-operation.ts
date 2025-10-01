import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AddOperationResponse } from '../types';
import { Operation } from '../schemas';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useAddOperation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<AddOperationResponse, Error, Operation>({
    mutationFn: async (operation) => {
      const response = await APIService.addOperation({ operation });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Operation created',
        description: 'The operation has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.OPERATIONS] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the operation',
        description: 'An error occurred while creating the operation',
        variant: 'destructive',
      });
      console.error('Failed to create the operation: ', err);
    },
  });

  return mutation;
};