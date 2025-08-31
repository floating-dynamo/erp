// Work Order API response types
import { WorkOrder } from '@/features/work-orders/schemas';

export interface GetWorkOrdersResponse {
  workOrders: WorkOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AddWorkOrderResponse {
  message: string;
  success: boolean;
  workOrderNumber: string;
}

export interface EditWorkOrderResponse {
  message: string;
  success: boolean;
}

export interface WorkOrderStatsResponse {
  totalWorkOrders: number;
  plannedWorkOrders: number;
  inProgressWorkOrders: number;
  completedWorkOrders: number;
  overdueWorkOrders: number;
  totalPlannedCost: number;
  totalActualCost: number;
  averageCompletionTime: number;
  efficiencyPercentage: number;
}
