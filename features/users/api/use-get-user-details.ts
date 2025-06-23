import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetUserDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: [QueryKeyString.USERS, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await APIService.getUserById({ id });
      return response;
    },
    enabled: !!id,
  });

  return query;
};