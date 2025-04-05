import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { EditEnquiryResponse } from '@/lib/types/requirement';
import { Enquiry } from '../schemas';
import { toast } from '@/hooks/use-toast';

export const useEditEnquiry = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<
    EditEnquiryResponse,
    Error,
    { id: string; enquiry: Enquiry }
  >({
    mutationFn: async ({ id, enquiry }: { id: string; enquiry: Enquiry }) => {
      const response = await APIService.editEnquiry({ id, data: enquiry });
      return response;
    },
    onSuccess: (_, { id }) => {
      toast({
        title: 'Enquiry edited',
        description: 'The enquiry has been edited successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
      queryClient.invalidateQueries({ queryKey: ['enquiries'] });
      queryClient.invalidateQueries({ queryKey: ['enquiries', id] });
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update the enquiry',
        description: 'An error occurred while updating the enquiry',
        variant: 'destructive',
      });
      console.error('Failed to create the enquiry: ', err);
    },
  });

  return mutation;
};
