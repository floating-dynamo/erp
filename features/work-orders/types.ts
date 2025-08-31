import { FieldValues, UseFormReturn } from "react-hook-form";

/**
 * MongoDB filter interface for Work Order queries
 */
export interface WorkOrderFilter {
  workOrderName?: string;
  workOrderType?: string;
  status?: string;
  priority?: string;
  customerId?: string;
  customerName?: string;
  productName?: string;
  department?: string;
  workCenter?: string;
  plannedStartDate?: {
    $gte?: string;
    $lte?: string;
  };
  dueDate?: {
    $gte?: string;
    $lte?: string;
  };
  plannedCost?: {
    $gte?: number;
    $lte?: number;
  };
  $or?: {
    workOrderName?: { $regex: string; $options: string };
    workOrderNumber?: { $regex: string; $options: string };
    productName?: { $regex: string; $options: string };
    productCode?: { $regex: string; $options: string };
    customerName?: { $regex: string; $options: string };
  }[];
}

/**
 * Work Order query parameters for API requests
 */
export interface WorkOrderQueryParams {
  page?: number;
  limit?: number;
  searchQuery?: string;
  workOrderTypeFilter?: string;
  statusFilter?: string;
  priorityFilter?: string;
  customerIdFilter?: string;
  departmentFilter?: string;
  workCenterFilter?: string;
  startDateFrom?: string;
  startDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  costFrom?: string;
  costTo?: string;
}

/**
 * Work Order API response interfaces
 */
export interface WorkOrderListResponse {
  workOrders: import('./schemas').WorkOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface WorkOrderCreateResponse {
  message: string;
  success: boolean;
  workOrderNumber: string;
}

export interface WorkOrderUpdateResponse {
  message: string;
  success: boolean;
}

/**
 * Work Order form interfaces
 */
export interface WorkOrderFormData {
  workOrderName: string;
  workOrderType: 'PRODUCTION' | 'MAINTENANCE' | 'REWORK' | 'PROTOTYPE' | 'REPAIR';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PLANNED' | 'RELEASED' | 'STARTED' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';
  customerId?: string;
  customerName?: string;
  customerOrderId?: string;
  bomId?: string;
  bomNumber?: string;
  enquiryId?: string;
  quotationId?: string;
  productName: string;
  productCode: string;
  productDescription?: string;
  drawingNumber?: string;
  revision?: string;
  plannedQuantity: number;
  uom: string;
  plannedStartDate: string;
  plannedEndDate: string;
  dueDate?: string;
  operations: WorkOrderOperationFormData[];
  resources: WorkOrderResourceFormData[];
  department?: string;
  workCenter?: string;
  shift: 'DAY' | 'NIGHT' | 'GENERAL';
  specialInstructions?: string;
  routingInstructions?: string;
  qualityPlan?: string;
}

export interface WorkOrderResourceFormData {
  resourceType: 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'OVERHEAD';
  resourceName: string;
  resourceCode?: string;
  plannedQuantity: number;
  uom: string;
  standardCost: number;
  currency?: string;
  startDate?: string;
  endDate?: string;
  status: 'PLANNED' | 'ALLOCATED' | 'IN_USE' | 'COMPLETED' | 'RETURNED';
  remarks?: string;
}

export interface WorkOrderOperationFormData {
  operationSequence: number;
  operationName: string;
  operationCode?: string;
  workCenter: string;
  setupTime?: number;
  runTime: number;
  totalPlannedTime: number;
  operator?: string;
  status: 'PLANNED' | 'STARTED' | 'PAUSED' | 'COMPLETED' | 'SKIPPED';
  notes?: string;
  qualityChecks?: QualityCheckFormData[];
}

export interface QualityCheckFormData {
  checkPoint: string;
  specification?: string;
  actualValue?: string;
  status: 'PASS' | 'FAIL' | 'PENDING';
  checkedBy?: string;
  checkedAt?: string;
  remarks?: string;
}

/**
 * Work Order table interfaces
 */
export interface WorkOrderTableRow {
  id: string;
  workOrderNumber: string;
  workOrderName: string;
  workOrderType: string;
  priority: string;
  status: string;
  productName: string;
  productCode: string;
  plannedQuantity: number;
  completedQuantity: number;
  uom: string;
  plannedStartDate: string;
  plannedEndDate: string;
  dueDate?: string;
  progressPercentage: number;
  customerName?: string;
  plannedCost: number;
  actualCost: number;
  currency: string;
  department?: string;
  workCenter?: string;
  createdBy: string;
  createdAt: string;
}

/**
 * Work Order statistics interfaces
 */
export interface WorkOrderStats {
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

/**
 * Work Order dashboard interfaces
 */
export interface WorkOrderDashboardData {
  stats: WorkOrderStats;
  recentWorkOrders: WorkOrderTableRow[];
  urgentWorkOrders: WorkOrderTableRow[];
  overdueWorkOrders: WorkOrderTableRow[];
  upcomingWorkOrders: WorkOrderTableRow[];
  workOrdersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
  workOrdersByType: {
    type: string;
    count: number;
    percentage: number;
  }[];
  resourceUtilization: {
    resourceType: string;
    plannedHours: number;
    actualHours: number;
    utilizationPercentage: number;
  }[];
}

/**
 * Work Order validation interfaces
 */
export interface WorkOrderValidationError {
  field: string;
  message: string;
  path?: string;
}

export interface WorkOrderValidationResult {
  isValid: boolean;
  errors: WorkOrderValidationError[];
}

/**
 * Work Order progress tracking interfaces
 */
export interface WorkOrderProgress {
  workOrderId: string;
  progressPercentage: number;
  currentOperation?: string;
  nextOperation?: string;
  lastOperationCompleted?: string;
  operationsProgress: {
    operationSequence: number;
    operationName: string;
    status: string;
    startDateTime?: string;
    endDateTime?: string;
    progressPercentage: number;
  }[];
  resourcesProgress: {
    resourceName: string;
    resourceType: string;
    plannedQuantity: number;
    actualQuantity: number;
    utilizationPercentage: number;
    status: string;
  }[];
}

/**
 * Work Order search interfaces
 */
export interface WorkOrderSearchOptions {
  keys: string[];
  threshold: number;
  includeScore?: boolean;
  ignoreLocation?: boolean;
}

export interface WorkOrderSearchResult {
  item: import('./schemas').WorkOrder;
  score?: number;
}

/**
 * Work Order export interfaces
 */
export interface WorkOrderExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeOperations: boolean;
  includeResources: boolean;
  includeProgress: boolean;
  fileName?: string;
}

export interface WorkOrderExportData {
  headers: string[];
  rows: (string | number)[][];
  metadata: {
    exportedAt: Date;
    totalRecords: number;
    filters?: WorkOrderQueryParams;
  };
}

/**
 * Work Order component props interfaces
 */
export interface WorkOrderTableProps {
  data?: WorkOrderListResponse;
  isLoading?: boolean;
  onRefresh?: () => void;
  onWorkOrderSelect?: (workOrderId: string) => void;
}

export interface WorkOrderFormProps {
  workOrderId?: string;
  initialData?: WorkOrderFormData;
  onSubmit?: (data: WorkOrderFormData) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export interface WorkOrderDetailsProps {
  workOrderId: string;
  workOrder?: import('./schemas').WorkOrder;
  isLoading?: boolean;
  onEdit?: (workOrderId: string) => void;
  onDelete?: (workOrderId: string) => void;
  onStatusUpdate?: (workOrderId: string, status: string) => void;
}

export interface WorkOrderProgressProps {
  workOrderId: string;
  progress?: WorkOrderProgress;
  isLoading?: boolean;
  onOperationUpdate?: (operationSequence: number, status: string) => void;
  onResourceUpdate?: (resourceIndex: number, actualQuantity: number) => void;
}

export interface OperationFormProps<T extends FieldValues = FieldValues> {
  operationIndex: number;
  form: UseFormReturn<T>;
  onRemove?: () => void;
  canRemove?: boolean;
  isReadOnly?: boolean;
}

export interface ResourceFormProps<T extends FieldValues = FieldValues> {
  resourceIndex: number;
  form: UseFormReturn<T>;
  onRemove?: () => void;
  canRemove?: boolean;
  isReadOnly?: boolean;
}

/**
 * Work Order scheduling interfaces
 */
export interface WorkOrderSchedule {
  workOrderId: string;
  workOrderName: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status: string;
  priority: string;
  workCenter: string;
  dependencies?: string[];
  conflicts?: {
    type: 'RESOURCE' | 'SCHEDULE' | 'DEPENDENCY';
    description: string;
    conflictWith?: string;
  }[];
}

export interface WorkOrderGanttData {
  workOrders: WorkOrderSchedule[];
  timeline: {
    start: string;
    end: string;
    milestones: {
      date: string;
      description: string;
      type: 'DEADLINE' | 'MILESTONE' | 'HOLIDAY';
    }[];
  };
}

/**
 * Work Order cost tracking interfaces
 */
export interface WorkOrderCostBreakdown {
  workOrderId: string;
  materialCosts: {
    resourceName: string;
    plannedCost: number;
    actualCost: number;
    variance: number;
    variancePercentage: number;
  }[];
  laborCosts: {
    operation: string;
    plannedHours: number;
    actualHours: number;
    hourlyRate: number;
    plannedCost: number;
    actualCost: number;
    variance: number;
  }[];
  overheadCosts: {
    category: string;
    plannedCost: number;
    actualCost: number;
    variance: number;
  }[];
  totalCosts: {
    plannedTotal: number;
    actualTotal: number;
    totalVariance: number;
    variancePercentage: number;
  };
}

/**
 * Work Order reporting interfaces
 */
export interface WorkOrderReport {
  reportType: 'EFFICIENCY' | 'COST_VARIANCE' | 'SCHEDULE_PERFORMANCE' | 'QUALITY' | 'RESOURCE_UTILIZATION';
  dateRange: {
    startDate: string;
    endDate: string;
  };
  filters?: WorkOrderQueryParams;
  data: {
    summary: Record<string, number | string>;
    details: Record<string, string | number | boolean>[];
    charts?: {
      type: 'BAR' | 'LINE' | 'PIE' | 'AREA';
      title: string;
      data: Record<string, string | number>[];
    }[];
  };
}

/**
 * Utility types
 */
export type WorkOrderType = 'PRODUCTION' | 'MAINTENANCE' | 'REWORK' | 'PROTOTYPE' | 'REPAIR';
export type WorkOrderStatus = 'PLANNED' | 'RELEASED' | 'STARTED' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'CLOSED';
export type WorkOrderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
export type ResourceType = 'MATERIAL' | 'LABOR' | 'EQUIPMENT' | 'OVERHEAD';
export type OperationStatus = 'PLANNED' | 'STARTED' | 'PAUSED' | 'COMPLETED' | 'SKIPPED';
export type QualityStatus = 'PASS' | 'FAIL' | 'PENDING';

/**
 * Constants
 */
export const WORK_ORDER_TYPES: Record<WorkOrderType, string> = {
  PRODUCTION: 'Production',
  MAINTENANCE: 'Maintenance',
  REWORK: 'Rework',
  PROTOTYPE: 'Prototype',
  REPAIR: 'Repair',
} as const;

export const WORK_ORDER_STATUSES: Record<WorkOrderStatus, string> = {
  PLANNED: 'Planned',
  RELEASED: 'Released',
  STARTED: 'Started',
  PAUSED: 'Paused',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  CLOSED: 'Closed',
} as const;

export const WORK_ORDER_PRIORITIES: Record<WorkOrderPriority, string> = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

export const RESOURCE_TYPES: Record<ResourceType, string> = {
  MATERIAL: 'Material',
  LABOR: 'Labor',
  EQUIPMENT: 'Equipment',
  OVERHEAD: 'Overhead',
} as const;

export const WORK_ORDER_STATUS_COLORS: Record<WorkOrderStatus, string> = {
  PLANNED: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  RELEASED: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  STARTED: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  PAUSED: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  COMPLETED: 'bg-green-100 text-green-800 hover:bg-green-200',
  CANCELLED: 'bg-red-100 text-red-800 hover:bg-red-200',
  CLOSED: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
} as const;

export const WORK_ORDER_PRIORITY_COLORS: Record<WorkOrderPriority, string> = {
  LOW: 'bg-green-100 text-green-800 hover:bg-green-200',
  NORMAL: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  HIGH: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  URGENT: 'bg-red-100 text-red-800 hover:bg-red-200',
} as const;

export const WORK_ORDER_TYPE_COLORS: Record<WorkOrderType, string> = {
  PRODUCTION: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  MAINTENANCE: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  REWORK: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  PROTOTYPE: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  REPAIR: 'bg-red-100 text-red-800 hover:bg-red-200',
} as const;
