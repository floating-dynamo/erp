import { z } from "zod";

// Define the work order item schema - for Part No/Part Name/Revision Level/Qty
export const workOrderItemSchema = z.object({
  partNo: z.string().trim().min(1, "Part number is required"),
  partName: z.string().trim().min(1, "Part name is required"),
  revisionLevel: z.string().trim().optional().default("A"),
  qty: z.number().min(1, "Quantity must be at least 1"),
});

// Define the main work order schema based on Excel structure
export const createWorkOrderSchema = z.object({
  id: z.string().optional(),
  
  // Core fields based on Excel structure
  status: z.enum(["Open", "Closed", "Short Closed", "On Hold"]).default("Open"),
  customerId: z.string().trim().min(1, "Customer ID is required"),
  customerName: z.string().trim().min(1, "Customer name is required"),
  orderType: z.string().trim().min(1, "Order type is required"),
  POId: z.string().trim().optional(),
  targetDate: z.string().min(1, "Target date is required"),
  
  // Work Order specific fields
  workOrderId: z.string().optional(),
  projectName: z.string().trim().min(1, "Project name is required"),
  companyId: z.string().trim().optional(),
  
  // Items array
  items: z.array(workOrderItemSchema).min(1, "At least one item is required"),
  
  // Progress tracking
  progress: z.number().min(0).max(100).optional().default(0),
  totalPlannedQty: z.number().min(0).optional().default(0),
  completedQty: z.number().min(0).optional().default(0),
  
  // Additional fields
  remarks: z.string().trim().optional(),
  
  // Audit fields
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

// Define the edit schema (includes id)
export const editWorkOrderSchema = createWorkOrderSchema.extend({
  id: z.string().min(1, "ID is required for editing"),
  updatedBy: z.string().optional(),
});

// Define the update status schema
export const updateWorkOrderStatusSchema = z.object({
  id: z.string().min(1, "ID is required"),
  status: z.enum(["Open", "Closed", "Short Closed", "On Hold"]),
  updatedBy: z.string().optional(),
});

// Export types
export type WorkOrder = z.infer<typeof createWorkOrderSchema>;
export type WorkOrderItem = z.infer<typeof workOrderItemSchema>;
export type CreateWorkOrderRequest = z.infer<typeof createWorkOrderSchema>;
export type EditWorkOrderRequest = z.infer<typeof editWorkOrderSchema>;
export type UpdateWorkOrderStatusRequest = z.infer<typeof updateWorkOrderStatusSchema>;
