import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';

export const useGetCompanies = () => {
  const query = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const response = await APIService.getCompanies();
        return response?.companies || [];
      } catch (error) {
        console.error('Error fetching companies:', error);
        return [];
      }
    },
  });

  return query;
};