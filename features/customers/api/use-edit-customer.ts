import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EditCustomerResponse } from '@/lib/types/customer';
import { Customer } from '../schemas';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useEditCustomer = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    EditCustomerResponse,
    Error,
    { id: string; customer: Customer }
  >({
    mutationFn: async ({
      id,
      customer,
    }: {
      id: string;
      customer: Customer;
    }) => {
      console.log('EditCustomer mutation called with:', { id, customer });
      const response = await APIService.editCustomer({ id, data: customer });
      console.log('EditCustomer API response:', response);
      return response;
    },
    onSuccess: (_, { id }) => {
      console.log('EditCustomer mutation success');
      toast({
        title: 'Customer updated',
        description: 'The customer has been edited successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.CUSTOMERS] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.CUSTOMERS, id],
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ENQUIRIES] });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.QUOTATIONS] });
    },
    onError: (err) => {
      console.error('EditCustomer mutation error:', err);
      toast({
        title: 'Failed to update the customer',
        description: 'An error occurred while updating the customer',
        variant: 'destructive',
      });
      console.error('Failed to update the customer: ', err);
    },
  });

  return mutation;
};
