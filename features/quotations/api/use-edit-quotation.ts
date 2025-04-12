import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { EditQuotationSchema } from '../schemas';

export const useEditQuotation = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<
    { message: string; success: boolean },
    Error,
    { id: string; quotation: EditQuotationSchema }
  >({
    mutationFn: async ({ id, quotation }) => {
      const response = await APIService.editQuotation({ id, data: quotation });
      return response;
    },
    onSuccess: (_, { id }) => {
      toast({
        title: 'Quotation updated',
        description: 'The quotation has been edited successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotations', id] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update the quotation',
        description: 'An error occurred while updating the quotation',
        variant: 'destructive',
      });
      console.error('Failed to update the quotation: ', err);
    },
  });

  return mutation;
};