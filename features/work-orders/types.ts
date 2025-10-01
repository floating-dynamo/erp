import { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * MongoDB filter interface for Work Order queries
 */
export interface WorkOrderFilter {
  workOrderId?: string;
  projectName?: string;
  status?: string;
  customerId?: string;
  customerName?: string;
  orderType?: string;
  targetDate?: {
    $gte?: string;
    $lte?: string;
  };
  startDate?: {
    $gte?: string;
    $lte?: string;
  };
  $or?: {
    workOrderId?: { $regex: string; $options: string };
    projectName?: { $regex: string; $options: string };
    customerId?: { $regex: string; $options: string };
    customerName?: { $regex: string; $options: string };
  }[];
}

/**
 * Work Order sort options
 */
export interface WorkOrderSort {
  field: 'workOrderId' | 'projectName' | 'status' | 'targetDate' | 'createdAt' | 'progress';
  direction: 'asc' | 'desc';
}

/**
 * Work Order search parameters
 */
export interface WorkOrderSearchParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  statusFilter?: string;
  orderTypeFilter?: string;
  customerId?: string;
  startDate?: string;
  endDate?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

/**
 * Work Order dashboard statistics
 */
export interface WorkOrderStats {
  totalWorkOrders: number;
  openWorkOrders: number;
  closedWorkOrders: number;
  onHoldWorkOrders: number;
  shortClosedWorkOrders: number;
  averageProgress: number;
  totalPlannedQty: number;
  totalCompletedQty: number;
  pendingWorkOrders: number;
}

/**
 * Work Order form props interface
 */
export interface WorkOrderFormProps {
  isEdit?: boolean;
  workOrderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Work Order form return type
 */
export type WorkOrderFormReturn = UseFormReturn<FieldValues>;

/**
 * Work Order item for field array
 */
export interface WorkOrderItemFormData {
  itemNo: string;
  itemName: string;
  revisionLevel?: string;
  qty: number;
}

/**
 * Work Order bulk operations
 */
export interface BulkWorkOrderOperation {
  workOrderIds: string[];
  operation: 'updateStatus' | 'delete' | 'export';
  data?: {
    status?: string;
    updatedBy?: string;
  };
}

/**
 * Work Order export options
 */
export interface WorkOrderExportOptions {
  format: 'excel' | 'csv' | 'pdf';
  includeItems: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  statusFilter?: string[];
  customFields?: string[];
}
