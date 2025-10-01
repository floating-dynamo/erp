import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetItemDetails = ({ id }: { id: string }) => {
  const query = useQuery({
    queryKey: [QueryKeyString.ITEMS, id],
    queryFn: async () => {
      const item = await APIService.getItem(id);
      return item;
    },
    enabled: !!id,
  });

  return query;
};