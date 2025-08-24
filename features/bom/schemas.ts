import { z } from "zod";

// Define the base BOM Item schema without children first
const baseBomItemSchema = z.object({
  itemCode: z.number().min(0, "Cannot be negative"),
  itemDescription: z.string().trim().min(1, "Item description is required"),
  materialConsideration: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  uom: z.string().optional(), // Unit of measurement
  rate: z.number().min(0, "Rate must be a positive number"),
  currency: z.string().optional(),
  amount: z.number().min(0), // Calculated as Quantity x Rate
  remarks: z.string().optional(),
  level: z.number().min(0).default(0), // Hierarchy level (0 = root, 1 = child, 2 = grandchild, etc.)
  parentId: z.string().optional(), // Reference to parent item
});

// Define the BOM Item type for recursive structure
export type BomItem = {
  itemCode: number;
  itemDescription: string;
  materialConsideration?: string;
  quantity: number;
  uom?: string;
  rate: number;
  currency?: string;
  amount: number;
  remarks?: string;
  level: number;
  parentId?: string;
  children?: BomItem[];
};

// Define the recursive BOM Item schema with children
export const bomItemSchema: z.ZodType<BomItem> = z.lazy(() => 
  baseBomItemSchema.extend({
    children: z.array(bomItemSchema).optional().default([]), // Recursive children items
  }) as z.ZodType<BomItem>
);

// Define the BOM schema
export const createBomSchema = z.object({
  id: z.string().optional(),
  bomNumber: z.string().optional(), // Unique backend generated number like BOM/YY/MM/DD/00000
  bomName: z.string().trim().min(1, "BOM Name is required"),
  productName: z.string().trim().min(1, "Product Name is required"),
  productCode: z.string().trim().min(1, "Product Code is required"),
  version: z.string().optional().default("1.0"),
  bomDate: z.string().optional(),
  bomType: z.enum(["MANUFACTURING", "ENGINEERING", "SALES", "SERVICE"]).default("MANUFACTURING"),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE", "ARCHIVED"]).default("DRAFT"),
  customerId: z.string().optional(), // Reference to customer
  customerName: z.string().optional(), // Customer name for display
  enquiryId: z.string().optional(), // Reference to enquiry
  enquiryNumber: z.string().optional(), // Enquiry number for display
  items: z.array(bomItemSchema).min(1, "At least one item is required"),
  totalMaterialCost: z.number().min(0).optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  myCompanyName: z.string().optional(),
  createdBy: z.string().optional(),
  approvedBy: z.string().optional(),
  approvalDate: z.string().optional(),
});

// Define the schema for editing BOMs
export const editBomSchema = createBomSchema.extend({
  id: z.string().min(1, "BOM ID is required"),
});

// Helper type for flattened BOM items (used for display)
export const flatBomItemSchema = baseBomItemSchema.extend({
  hasChildren: z.boolean().optional(),
  isExpanded: z.boolean().optional(),
  depth: z.number().optional(),
});

// Export the types for usage
export type Bom = z.infer<typeof createBomSchema>;
export type EditBomSchema = z.infer<typeof editBomSchema>;
export type FlatBomItem = z.infer<typeof flatBomItemSchema>;