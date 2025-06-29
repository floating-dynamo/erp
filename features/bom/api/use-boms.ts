import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import type { BomQueryParams, BomListResponse, UseBomListOptions } from '../types';

export const useBoms = (options: UseBomListOptions = {}) => {
  const {
    page,
    limit,
    searchQuery,
    productNameFilter,
    bomTypeFilter,
    statusFilter,
    costFrom,
    costTo,
    enabled = true,
    refetchInterval,
  } = options;

  const query = useQuery<BomListResponse | null>({
    queryKey: [
      QueryKeyString.BOMS,
      page,
      limit,
      searchQuery,
      productNameFilter,
      bomTypeFilter,
      statusFilter,
      costFrom,
      costTo,
    ],
    queryFn: async (): Promise<BomListResponse | null> => {
      const params: BomQueryParams = {
        page,
        limit,
        searchQuery,
        productNameFilter,
        bomTypeFilter,
        statusFilter,
        costFrom,
        costTo,
      };

      const response = await APIService.getBoms(params);

      if (!response) {
        return null;
      }

      return response as BomListResponse;
    },
    enabled,
    refetchInterval,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return query;
};