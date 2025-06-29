import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';
import type { Bom } from '../schemas';
import type { BomCreateResponse, UseBomMutationOptions } from '../types';

export const useAddBom = (options: UseBomMutationOptions = {}) => {
  const queryClient = new QueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<BomCreateResponse, Error, Bom>({
    mutationFn: async (bom: Bom): Promise<BomCreateResponse> => {
      const response = await APIService.addBom({ bom });
      return response as BomCreateResponse;
    },
    onSuccess: (data: BomCreateResponse) => {
      toast({
        title: 'BOM created',
        description: `The BOM has been created successfully - ${data?.bomNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.BOMS] });
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      toast({
        title: 'Failed to create the BOM',
        description: 'An error occurred while creating the BOM',
        variant: 'destructive',
      });
      console.error('Failed to create the BOM: ', err);
      onError?.(err);
    },
  });

  return mutation;
};