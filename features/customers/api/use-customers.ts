import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useCustomers = (filters?: {
  country?: string;
  state?: string;
  city?: string;
}) => {
  const query = useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();

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

      const { customers } = response;
      return customers;
    },
  });

  return query;
};
