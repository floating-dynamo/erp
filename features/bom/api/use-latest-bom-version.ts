import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { QueryKeyString } from '@/lib/types';
import type { Bom } from '../schemas';

interface UseLatestBomVersionParams {
  baseId: string;
  enabled?: boolean;
}

export const useLatestBomVersion = ({ baseId, enabled = true }: UseLatestBomVersionParams) => {
  return useQuery<Bom, Error>({
    queryKey: [QueryKeyString.BOMS, 'latest', baseId],
    queryFn: async (): Promise<Bom> => {
      const response = await APIService.getLatestBomByBaseId({ baseId });
      return response;
    },
    enabled: enabled && !!baseId,
  });
};
