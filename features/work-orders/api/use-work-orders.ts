import APIService from '@/services/api';
import { useQuery } from '@tanstack/react-query';
import { QueryKeyString } from '@/lib/types';

interface UseWorkOrdersProps {
  page?: number;
  limit?: number;
  searchQuery?: string;
  workOrderTypeFilter?: string;
  statusFilter?: string;
  priorityFilter?: string;
  customerIdFilter?: string;
  departmentFilter?: string;
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  costFrom?: string;
  costTo?: string;
}

export const useWorkOrders = (params?: UseWorkOrdersProps) => {
  const query = useQuery({
    queryKey: [QueryKeyString.WORK_ORDERS, params],
    queryFn: () => APIService.getWorkOrders(params),
    staleTime: 30000, // 30 seconds
  });

  return query;
};
