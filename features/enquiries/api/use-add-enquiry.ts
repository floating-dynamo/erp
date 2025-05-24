import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Enquiry } from '../schemas';
import { QueryKeyString } from '@/lib/types';
import { useRouter } from 'next/navigation';

export const useAddEnquiry = () => {
  const queryClient = new QueryClient();
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (enquiry: Enquiry) => {
      const response = await APIService.addEnquiry({ enquiry });
      console.log(response);
      if (!response.success) {
        throw new Error(response.message || 'Failed to create enquiry');
      }
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Enquiry created',
        description: 'The enquiry has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ENQUIRIES] });
      router.push('/enquiries');
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the enquiry',
        description:
          err.message || 'An error occurred while creating the enquiry',
        variant: 'destructive',
      });
      console.error('Failed to create the enquiry: ', err);
      throw new Error(err.message);
    },
  });

  return mutation;
};
