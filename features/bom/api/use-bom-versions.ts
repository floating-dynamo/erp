import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { QueryKeyString } from '@/lib/types';
import type { BomVersionsResponse } from '../types';

interface UseBomVersionsParams {
  id: string;
  enabled?: boolean;
}

export const useBomVersions = ({ id, enabled = true }: UseBomVersionsParams) => {
  return useQuery<BomVersionsResponse, Error>({
    queryKey: [QueryKeyString.BOMS, id, 'versions'],
    queryFn: async (): Promise<BomVersionsResponse> => {
      const response = await APIService.getBomVersions({ id });
      return response;
    },
    enabled: enabled && !!id,
  });
};
