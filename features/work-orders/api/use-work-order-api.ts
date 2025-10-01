import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import APIService from '@/services/api/api-service';

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: APIService.createWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to create work order:', error);
    },
  });
};

export const useUpdateWorkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      APIService.updateWorkOrder(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', id] });
      queryClient.invalidateQueries({ queryKey: ['work-order-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update work order:', error);
    },
  });
};

export const useDeleteWorkOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: APIService.deleteWorkOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to delete work order:', error);
    },
  });
};

export const useUpdateWorkOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      APIService.updateWorkOrderStatus(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['work-orders'] });
      queryClient.invalidateQueries({ queryKey: ['work-order', id] });
      queryClient.invalidateQueries({ queryKey: ['work-order-stats'] });
    },
    onError: (error: Error) => {
      console.error('Failed to update work order status:', error);
    },
  });
};

export const useGetWorkOrders = (params?: {
  page?: number;
  limit?: number;
  searchQuery?: string;
  statusFilter?: string;
  orderTypeFilter?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ['work-orders', params],
    queryFn: () => APIService.getWorkOrders(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useGetWorkOrderDetails = ({ id }: { id: string }) => {
  return useQuery({
    queryKey: ['work-order', id],
    queryFn: () => APIService.getWorkOrderDetails(id),
    enabled: !!id,
  });
};

export const useGetWorkOrderStats = () => {
  return useQuery({
    queryKey: ['work-order-stats'],
    queryFn: APIService.getWorkOrderStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
