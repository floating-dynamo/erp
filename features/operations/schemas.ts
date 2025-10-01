import { z } from 'zod';

// Define the schema for Raw Materials in Operations
export const operationRawMaterialSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  itemCode: z.string().min(1, 'Item code is required'),
  itemDescription: z.string().min(1, 'Item description is required'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  uom: z.string().min(1, 'Unit of measure is required'),
});

// Define the main Operation schema
export const createOperationSchema = z.object({
  id: z.string().optional(),
  process: z.string().trim().min(1, 'Process is required'),
  workCenter: z.string().trim().min(1, 'Work Center is required'),
  rawMaterials: z.array(operationRawMaterialSchema).optional().default([]),
  setupMinutes: z.union([
    z.number().min(0, 'Setup minutes must be non-negative'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    })
  ]).default(0),
  cncMinutesEstimate: z.union([
    z.number().min(0, 'CNC minutes estimate must be non-negative'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    })
  ]).default(0),
  totalMinutesEstimate: z.union([
    z.number().min(0, 'Total minutes estimate must be non-negative'),
    z.string().transform((val) => {
      const num = parseFloat(val);
      return isNaN(num) ? 0 : num;
    })
  ]).default(0),
  description: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.string().or(z.date()).optional(),
  updatedAt: z.string().or(z.date()).optional(),
});

// Schema for updating operations (all fields optional except required business logic)
export const updateOperationSchema = createOperationSchema.partial();

// Common process types that can be used in dropdowns
export const PROCESS_TYPES = [
  'Casting',
  'Machining',
  'CNC Operations',
  'Assembly',
  'Welding',
  'Grinding',
  'Heat Treatment',
  'Surface Treatment',
  'Quality Check',
  'Packaging',
  'Custom Process'
] as const;

// Common work center types
export const WORK_CENTER_TYPES = [
  'Foundry-01',
  'Foundry-02',
  'CNC-Machine-01',
  'CNC-Machine-02',
  'CNC-Machine-03',
  'Assembly-Line-01',
  'Assembly-Line-02',
  'Welding-Station-01',
  'Welding-Station-02',
  'Heat-Treatment-01',
  'Quality-Control-01',
  'Packaging-Line-01',
  'Custom-Center'
] as const;

// Type exports
export type Operation = z.infer<typeof createOperationSchema>;
export type OperationRawMaterial = z.infer<typeof operationRawMaterialSchema>;
export type ProcessType = typeof PROCESS_TYPES[number];
export type WorkCenterType = typeof WORK_CENTER_TYPES[number];