import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useItems = ({
  page,
  limit,
  searchQuery,
  categoryFilter,
  isActiveFilter,
}: {
  page?: number;
  limit?: number;
  searchQuery?: string;
  categoryFilter?: string;
  isActiveFilter?: boolean;
} = {}) => {
  const query = useQuery({
    queryKey: [QueryKeyString.ITEMS, page, limit, searchQuery, categoryFilter, isActiveFilter],
    queryFn: async () => {
      const response = await APIService.getItems(
        searchQuery,
        page,
        limit,
        isActiveFilter,
        categoryFilter
      );

      if (!response) {
        return null;
      }

      return response;
    },
  });

  return query;
};