import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { EditSupplierDcSchema } from '../schemas';
import { QueryKeyString } from '@/lib/types';

export const useEditSupplierDc = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<
    { message: string; success: boolean },
    Error,
    { id: string; supplierDc: EditSupplierDcSchema }
  >({
    mutationFn: async ({ id, supplierDc }) => {
      const response = await APIService.editSupplierDc({
        id,
        data: supplierDc,
      });
      return response;
    },
    onSuccess: (_, { id }) => {
      toast({
        title: 'Supplier DC is updated',
        description:
          'The supplier delivery challan has been edited successfully',
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.SUPPLIER_DCS],
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.SUPPLIER_DCS, id],
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update the Supplier DC',
        description:
          'An error occurred while updating the supplier delivery challan',
        variant: 'destructive',
      });
      console.error('Failed to update the Supplier DC: ', err);
    },
  });

  return mutation;
};
