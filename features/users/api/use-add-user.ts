import APIService from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { User } from '../schemas';
import { QueryKeyString } from '@/lib/types';

export const useAddUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
    { success: boolean; message: string },
    Error,
    Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLoginAt'>
  >({
    mutationFn: async (user) => {
      const response = await APIService.addUser({ user });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'User created',
        description: 'The user has been created successfully',
      });
      queryClient.invalidateQueries({ queryKey: [QueryKeyString.USERS] });
    },
    onError: (err) => {
      toast({
        title: 'Failed to create the user',
        description: 'An error occurred while creating the user',
        variant: 'destructive',
      });
      console.error('Failed to create the user: ', err);
    },
  });

  return mutation;
};