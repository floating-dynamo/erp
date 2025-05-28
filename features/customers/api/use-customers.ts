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

      // If we have a search query, request all records for client-side searching
      const isSearching = !!filters?.searchQuery?.trim();

      if (filters?.page && !isSearching) {
        queryParams.append('page', filters.page.toString());
      }

      if (filters?.limit && !isSearching) {
        queryParams.append('limit', filters.limit.toString());
      } else if (isSearching) {
        // If searching, request all records
        queryParams.append('limit', '10000'); // Set a high limit to get all records
        queryParams.append('page', '1');
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
