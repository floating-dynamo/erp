import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { QueryKeyString } from '@/lib/types';

interface UseGetWorkOrderDetailsProps {
  id: string;
}

export const useGetWorkOrderDetails = ({ id }: UseGetWorkOrderDetailsProps) => {
  const query = useQuery({
    queryKey: [QueryKeyString.WORK_ORDERS, id],
    queryFn: () => APIService.getWorkOrderById({ id }),
    enabled: !!id,
    staleTime: 30000, // 30 seconds
  });

  return query;
};
