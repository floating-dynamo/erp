import APIService from '@/services/api';
import { QueryClient, useMutation } from '@tanstack/react-query';
import { CreateItem } from '../schemas';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useAddItem = () => {
  const queryClient = new QueryClient();

  const mutation = useMutation<
    {
      success: boolean;
      message: string;
      data: CreateItem;
    },
    Error,
    CreateItem
  >({
    mutationFn: async (item: CreateItem) => {
      const response = await APIService.createItem(item);
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Item created',
        description: 'The item has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.ITEMS] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the item',
        description: 'An error occurred while creating the item',
        variant: 'destructive',
      });
      console.error('Failed to create the item: ', err);
    },
  });

  return mutation;
};