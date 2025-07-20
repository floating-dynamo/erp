import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';
import type { Bom } from '../schemas';
import type { BomUpdateResponse, UseBomMutationOptions } from '../types';

interface UpdateBomParams {
  id: string;
  bom: Bom;
}

export const useUpdateBom = (options: UseBomMutationOptions = {}) => {
  const queryClient = new QueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<BomUpdateResponse, Error, UpdateBomParams>({
    mutationFn: async ({ id, bom }: UpdateBomParams): Promise<BomUpdateResponse> => {
      const response = await APIService.updateBom({ id, data: bom });
      return response as BomUpdateResponse;
    },
    onSuccess: (data: BomUpdateResponse, { id }: UpdateBomParams) => {
      toast({
        title: 'BOM updated successfully',
        description: 'The BOM has been updated with your changes',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.BOMS] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.BOMS, id],
      });
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      toast({
        title: 'Failed to update BOM',
        description: 'An error occurred while updating the BOM',
        variant: 'destructive',
      });
      console.error('Failed to update BOM: ', err);
      onError?.(err);
    },
  });

  return mutation;
};
