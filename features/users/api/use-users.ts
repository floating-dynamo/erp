import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useUsers = (filters?: {
  page?: number;
  limit?: number;
  searchQuery?: string;
  role?: string;
  isActive?: boolean;
}) => {
  const query = useQuery({
    queryKey: [QueryKeyString.USERS, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

      // Always send page and limit for server-side pagination
      if (filters?.page) {
        queryParams.append('page', filters.page.toString());
      }

      if (filters?.limit) {
        queryParams.append('limit', filters.limit.toString());
      }

      // Add search query to backend for server-side fuzzy search
      if (filters?.searchQuery?.trim()) {
        queryParams.append('searchQuery', filters.searchQuery.trim());
      }

      if (filters?.role) {
        queryParams.append('role', filters.role);
      }

      if (filters?.isActive !== undefined) {
        queryParams.append('isActive', filters.isActive.toString());
      }

      const queryString = `?${queryParams.toString()}`;

      const response = await APIService.getUsers(queryString);

      if (!response) {
        return null;
      }

      const { users, total, limit, page, totalPages } = response;
      return { users, total, limit, page, totalPages };
    },
  });

  return query;
};