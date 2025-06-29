import { QueryKeyString } from '@/lib/types';
import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import type { Bom } from '../schemas';
import type { UseBomDetailsOptions } from '../types';

export const useGetBomDetails = (options: UseBomDetailsOptions) => {
  const { id, enabled = true } = options;

  const query = useQuery<Bom | null>({
    queryKey: [QueryKeyString.BOMS, id],
    queryFn: async (): Promise<Bom | null> => {
      if (!id) return null;

      const bom = await APIService.getBomById({ id });
      return bom as Bom | null;
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return query;
};