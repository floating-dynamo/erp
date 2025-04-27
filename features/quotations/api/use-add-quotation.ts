import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { Quotation } from '../schemas';
import { toast } from '@/hooks/use-toast';
import { AddQuotationResponse } from '@/lib/types/quotation';
import { QueryKeyString } from '@/lib/types';

export const useAddQuotation = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<AddQuotationResponse, Error, Quotation>({
    mutationFn: async (quotation) => {
      const response = await APIService.addQuotation({ quotation });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: 'Quotation created',
        description: `The quotation has been created successfully - ${data?.quoteNumber}`,
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ENQUIRIES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.QUOTATIONS] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the quotation',
        description: 'An error occurred while creating the quotation',
        variant: 'destructive',
      });
      console.error('Failed to create the quotation: ', err);
    },
  });

  return mutation;
};
