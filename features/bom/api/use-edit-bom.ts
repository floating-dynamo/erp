import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';
import type { EditBomSchema } from '../schemas';
import type { BomUpdateResponse, UseBomMutationOptions } from '../types';

interface EditBomParams {
  id: string;
  bom: EditBomSchema;
}

export const useEditBom = (options: UseBomMutationOptions = {}) => {
  const queryClient = new QueryClient();
  const { onSuccess, onError } = options;

  const mutation = useMutation<BomUpdateResponse, Error, EditBomParams>({
    mutationFn: async ({ id, bom }: EditBomParams): Promise<BomUpdateResponse> => {
      const response = await APIService.editBom({ id, data: bom });
      return response as BomUpdateResponse;
    },
    onSuccess: (data: BomUpdateResponse, { id }: EditBomParams) => {
      toast({
        title: 'BOM updated',
        description: 'The BOM has been edited successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.BOMS] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.BOMS, id],
      });
      onSuccess?.(data);
    },
    onError: (err: Error) => {
      toast({
        title: 'Failed to update the BOM',
        description: 'An error occurred while updating the BOM',
        variant: 'destructive',
      });
      console.error('Failed to update the BOM: ', err);
      onError?.(err);
    },
  });

  return mutation;
};