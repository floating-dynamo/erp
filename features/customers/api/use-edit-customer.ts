import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { EditCustomerResponse } from '@/lib/types/customer';
import { Customer } from '../schemas';
import { toast } from '@/hooks/use-toast';

export const useEditCustomer = () => {
  const queryClient = new QueryClient();

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
      const response = await APIService.editCustomer({ id, data: customer });
      return response;
    },
    onSuccess: (_, { id }) => {
      toast({
        title: 'Customer created',
        description: 'The customer has been edited successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the customer',
        description: 'An error occurred while creating the customer',
        variant: 'destructive',
      });
      console.error('Failed to create the customer: ', err);
    },
  });

  return mutation;
};
