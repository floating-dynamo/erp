import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { UserFiltersParams } from '@/lib/types/user';

export const useUsers = (filters: UserFiltersParams = {}) => {
  const { 
    role,
    isActive,
    companyId,
    page,
    limit,
    searchQuery,
    lastLoginFrom,
    lastLoginTo,
    createdFrom,
    createdTo
  } = filters;
  
  const query = useQuery({
    queryKey: [
      QueryKeyString.USERS,
      role,
      isActive,
      companyId,
      page,
      limit,
      searchQuery,
      lastLoginFrom,
      lastLoginTo,
      createdFrom,
      createdTo
    ],
    queryFn: async () => {
      // Convert filters to the expected format
      const filterParams: Record<string, string | number | boolean> = {};
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          filterParams[key] = value;
        }
      });

      const response = await APIService.getUsers(filterParams);

      if (!response) {
        return null;
      }

      const { users, total, limit: responseLimit, page: responsePage, totalPages } = response;
      return { users, total, limit: responseLimit, page: responsePage, totalPages };
    },
  });

  return query;
};
