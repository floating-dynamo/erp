import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Company } from '../schemas';
import { QueryKeyString } from '@/lib/types';

export const useAddCompany = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation({
    mutationFn: async (company: Company) => {
      const response = await APIService.addCompany({ company });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Company created',
        description: 'The company has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.COMPANIES] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the company',
        description: 'An error occurred while creating the company',
        variant: 'destructive',
      });
      console.error('Failed to create the company: ', err);
    },
  });

  return mutation;
};
