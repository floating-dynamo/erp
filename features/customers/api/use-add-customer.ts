import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { AddCustomerResponse } from '@/lib/types/customer';
import { Customer } from '../schemas';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useAddCustomer = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<AddCustomerResponse, Error, Customer>({
    mutationFn: async (customer) => {
      const response = await APIService.addCustomer({ customer });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Customer created',
        description: 'The customer has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.CUSTOMERS] });
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
