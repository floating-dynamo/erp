import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { QueryKeyString } from '@/lib/types';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { success: boolean; message: string },
    Error,
    string
  >({
    mutationFn: async (id) => {
      const response = await APIService.deleteUser({ id });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'User deleted',
        description: 'The user has been deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.USERS] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to delete the user',
        description: 'An error occurred while deleting the user',
        variant: 'destructive',
      });
      console.error('Failed to delete the user: ', err);
    },
  });

  return mutation;
};