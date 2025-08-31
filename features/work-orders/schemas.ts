import { z } from "zod";

// Define the work order resource schema
export const workOrderResourceSchema = z.object({
  resourceType: z.enum(["MATERIAL", "LABOR", "EQUIPMENT", "OVERHEAD"]),
  resourceName: z.string().trim().min(1, "Resource name is required"),
  resourceCode: z.string().trim().optional(),
  plannedQuantity: z.number().min(0, "Planned quantity must be positive"),
  actualQuantity: z.number().min(0, "Actual quantity must be positive").optional().default(0),
  uom: z.string().min(1, "Unit of measurement is required"),
  standardCost: z.number().min(0, "Standard cost must be positive"),
  actualCost: z.number().min(0, "Actual cost must be positive").optional().default(0),
  currency: z.string().optional().default("INR"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(["PLANNED", "ALLOCATED", "IN_USE", "COMPLETED", "RETURNED"]).default("PLANNED"),
  remarks: z.string().optional(),
});

// Define the quality check schema
export const qualityCheckSchema = z.object({
  checkPoint: z.string().min(1, "Check point is required"),
  specification: z.string().optional(),
  actualValue: z.string().optional(),
  status: z.enum(["PASS", "FAIL", "PENDING"]).default("PENDING"),
  checkedBy: z.string().optional(),
  checkedAt: z.string().optional(),
  remarks: z.string().optional(),
});

// Define the work order operation schema
export const workOrderOperationSchema = z.object({
  operationSequence: z.number().min(1, "Operation sequence must be at least 1"),
  operationName: z.string().trim().min(1, "Operation name is required"),
  operationCode: z.string().trim().optional(),
  workCenter: z.string().trim().min(1, "Work center is required"),
  setupTime: z.number().min(0, "Setup time must be positive").optional().default(0),
  runTime: z.number().min(0, "Run time must be positive"),
  totalPlannedTime: z.number().min(0, "Total planned time must be positive"),
  actualTime: z.number().min(0, "Actual time must be positive").optional().default(0),
  operator: z.string().trim().optional(),
  status: z.enum(["PLANNED", "STARTED", "PAUSED", "COMPLETED", "SKIPPED"]).default("PLANNED"),
  startDateTime: z.string().optional(),
  endDateTime: z.string().optional(),
  qualityChecks: z.array(qualityCheckSchema).optional().default([]),
  notes: z.string().optional(),
});

// Define the work order attachment schema
export const workOrderAttachmentSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  filename: z.string(),
  mimetype: z.string(),
  size: z.number(),
  uploadedAt: z.string().optional(),
  uploadedBy: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(["DRAWING", "SPECIFICATION", "PHOTO", "REPORT", "OTHER"]).default("OTHER"),
});

// Define the main work order schema
export const createWorkOrderSchema = z.object({
  id: z.string().optional(),
  workOrderNumber: z.string().optional(), // Auto-generated on server
  workOrderName: z.string().trim().min(1, "Work order name is required"),
  workOrderType: z.enum(["PRODUCTION", "MAINTENANCE", "REWORK", "PROTOTYPE", "REPAIR"]).default("PRODUCTION"),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  status: z.enum(["PLANNED", "RELEASED", "STARTED", "PAUSED", "COMPLETED", "CANCELLED", "CLOSED"]).default("PLANNED"),
  
  // References
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  customerOrderId: z.string().optional(),
  bomId: z.string().optional(),
  bomNumber: z.string().optional(),
  enquiryId: z.string().optional(),
  quotationId: z.string().optional(),
  
  // Product Information
  productName: z.string().trim().min(1, "Product name is required"),
  productCode: z.string().trim().min(1, "Product code is required"),
  productDescription: z.string().optional(),
  drawingNumber: z.string().trim().optional(),
  revision: z.string().optional().default("1.0"),
  
  // Quantities
  plannedQuantity: z.number().min(1, "Planned quantity must be at least 1"),
  completedQuantity: z.number().min(0, "Completed quantity must be positive").optional().default(0),
  rejectedQuantity: z.number().min(0, "Rejected quantity must be positive").optional().default(0),
  scrapQuantity: z.number().min(0, "Scrap quantity must be positive").optional().default(0),
  reworkQuantity: z.number().min(0, "Rework quantity must be positive").optional().default(0),
  uom: z.string().min(1, "Unit of measurement is required"),
  
  // Dates
  plannedStartDate: z.string().min(1, "Planned start date is required"),
  plannedEndDate: z.string().min(1, "Planned end date is required"),
  actualStartDate: z.string().optional(),
  actualEndDate: z.string().optional(),
  dueDate: z.string().optional(),
  
  // Resources and Operations
  operations: z.array(workOrderOperationSchema).min(1, "At least one operation is required"),
  resources: z.array(workOrderResourceSchema).optional().default([]),
  
  // Costs
  plannedCost: z.number().min(0, "Planned cost must be positive").optional().default(0),
  actualCost: z.number().min(0, "Actual cost must be positive").optional().default(0),
  materialCost: z.number().min(0, "Material cost must be positive").optional().default(0),
  laborCost: z.number().min(0, "Labor cost must be positive").optional().default(0),
  overheadCost: z.number().min(0, "Overhead cost must be positive").optional().default(0),
  currency: z.string().optional().default("INR"),
  
  // Additional Information
  department: z.string().trim().optional(),
  workCenter: z.string().trim().optional(),
  shift: z.enum(["DAY", "NIGHT", "GENERAL"]).default("DAY"),
  specialInstructions: z.string().optional(),
  routingInstructions: z.string().optional(),
  qualityPlan: z.string().optional(),
  
  // Tracking
  progressPercentage: z.number().min(0).max(100).optional().default(0),
  lastOperationCompleted: z.string().optional(),
  currentOperation: z.string().optional(),
  nextOperation: z.string().optional(),
  
  // Attachments
  attachments: z.array(workOrderAttachmentSchema).optional().default([]),
  
  // Audit fields
  createdBy: z.string().optional(),
  approvedBy: z.string().optional(),
  approvalDate: z.string().optional(),
  closedBy: z.string().optional(),
  closedDate: z.string().optional(),
  
  // Company reference
  myCompanyName: z.string().optional(),
});

// Define the schema for editing work orders
export const editWorkOrderSchema = createWorkOrderSchema.extend({
  id: z.string().min(1, "Work order ID is required"),
});

// Define schema for work order status updates
export const updateWorkOrderStatusSchema = z.object({
  id: z.string().min(1, "Work order ID is required"),
  status: z.enum(["PLANNED", "RELEASED", "STARTED", "PAUSED", "COMPLETED", "CANCELLED", "CLOSED"]),
  remarks: z.string().optional(),
  updatedBy: z.string().optional(),
});

// Define schema for operation updates
export const updateOperationSchema = z.object({
  workOrderId: z.string().min(1, "Work order ID is required"),
  operationSequence: z.number().min(1, "Operation sequence is required"),
  status: z.enum(["PLANNED", "STARTED", "PAUSED", "COMPLETED", "SKIPPED"]),
  actualTime: z.number().min(0, "Actual time must be positive").optional(),
  operator: z.string().optional(),
  startDateTime: z.string().optional(),
  endDateTime: z.string().optional(),
  notes: z.string().optional(),
  qualityChecks: z.array(qualityCheckSchema).optional(),
});

// Define schema for resource consumption updates
export const updateResourceConsumptionSchema = z.object({
  workOrderId: z.string().min(1, "Work order ID is required"),
  resourceIndex: z.number().min(0, "Resource index is required"),
  actualQuantity: z.number().min(0, "Actual quantity must be positive"),
  actualCost: z.number().min(0, "Actual cost must be positive"),
  status: z.enum(["PLANNED", "ALLOCATED", "IN_USE", "COMPLETED", "RETURNED"]),
  remarks: z.string().optional(),
});

// Export the types for usage
export type WorkOrder = z.infer<typeof createWorkOrderSchema>;
export type EditWorkOrderSchema = z.infer<typeof editWorkOrderSchema>;
export type WorkOrderResource = z.infer<typeof workOrderResourceSchema>;
export type WorkOrderOperation = z.infer<typeof workOrderOperationSchema>;
export type QualityCheck = z.infer<typeof qualityCheckSchema>;
export type WorkOrderAttachment = z.infer<typeof workOrderAttachmentSchema>;
export type UpdateWorkOrderStatus = z.infer<typeof updateWorkOrderStatusSchema>;
export type UpdateOperation = z.infer<typeof updateOperationSchema>;
export type UpdateResourceConsumption = z.infer<typeof updateResourceConsumptionSchema>;
