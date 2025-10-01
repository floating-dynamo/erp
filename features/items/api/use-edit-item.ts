import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { UpdateItem } from '../schemas';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useEditItem = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<
    {
      success: boolean;
      message: string;
      data: UpdateItem;
    },
    Error,
    { id: string; item: UpdateItem }
  >({
    mutationFn: async ({ id, item }: { id: string; item: UpdateItem }) => {
      const response = await APIService.updateItem(id, item);
      return response;
    },
    onSuccess: (_, { id }) => {
      toast({
        title: 'Item updated',
        description: 'The item has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ITEMS] });
      queryClient.invalidateQueries({
        queryKey: [QueryKeyString.ITEMS, id],
      });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update the item',
        description: 'An error occurred while updating the item',
        variant: 'destructive',
      });
      console.error('Failed to update the item: ', err);
    },
  });

  return mutation;
};