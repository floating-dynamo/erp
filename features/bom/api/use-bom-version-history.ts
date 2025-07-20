import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { QueryKeyString } from '@/lib/types';
import type { BomVersionHistoryResponse } from '../types';

interface UseBomVersionHistoryParams {
  id: string;
  enabled?: boolean;
}

export const useBomVersionHistory = ({ id, enabled = true }: UseBomVersionHistoryParams) => {
  return useQuery<BomVersionHistoryResponse, Error>({
    queryKey: [QueryKeyString.BOMS, id, 'history'],
    queryFn: async (): Promise<BomVersionHistoryResponse> => {
      const response = await APIService.getBomVersionHistory({ id });
      return response;
    },
    enabled: enabled && !!id,
  });
};
