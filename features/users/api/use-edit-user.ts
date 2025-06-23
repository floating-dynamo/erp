import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { User } from '../schemas';
import { QueryKeyString } from '@/lib/types';

export const useEditUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { success: boolean; message: string },
    Error,
    { id: string; user: Partial<User> }
  >({
    mutationFn: async ({ id, user }) => {
      const response = await APIService.editUser({ id, data: user });
      return response;
    },
    onSuccess: (_, { id }) => {
      toast({
        title: 'User updated',
        description: 'The user has been updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.USERS] });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.USERS, id] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to update the user',
        description: 'An error occurred while updating the user',
        variant: 'destructive',
      });
      console.error('Failed to update the user: ', err);
    },
  });

  return mutation;
};