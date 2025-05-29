import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useCustomers = (filters?: {
  country?: string;
  state?: string;
  city?: string;
  page?: number;
  limit?: number;
  searchQuery?: string;
}) => {
  const query = useQuery({
    queryKey: [QueryKeyString.CUSTOMERS, filters],
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

      if (filters?.country) {
        queryParams.append('country', filters.country);
      }
      if (filters?.state) {
        queryParams.append('state', filters.state);
      }
      if (filters?.city) {
        queryParams.append('city', filters.city);
      }

      const queryString = `?${queryParams.toString()}`;

      const response = await APIService.getCustomers(queryString);

      if (!response) {
        return null;
      }

      const { customers, total, limit, page, totalPages } = response;
      return { customers, total, limit, page, totalPages };
    },
  });

  return query;
};
