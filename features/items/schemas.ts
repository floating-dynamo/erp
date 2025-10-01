import { z } from "zod";

// Base item schema for common fields
export const baseItemSchema = z.object({
  id: z.string().optional(),
  itemCode: z.union([z.string(), z.number()]).transform((val) => String(val)),
  itemDescription: z.string().min(1, "Item description is required"),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  uom: z.string().min(1, "Unit of measurement is required"),
  standardRate: z.number().min(0, "Standard rate must be positive").optional(),
  currency: z.string().default("INR"),
  materialConsideration: z.string().optional(),
  specifications: z.string().optional(),
  manufacturer: z.string().optional(),
  partNumber: z.string().optional(),
  hsn: z.string().optional(),
  remarks: z.string().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.string().optional(),
});

// Create item schema
export const createItemSchema = baseItemSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Update item schema
export const updateItemSchema = baseItemSchema.partial().omit({
  id: true,
  createdAt: true,
});

// Item type
export type Item = z.infer<typeof baseItemSchema>;
export type CreateItem = z.infer<typeof createItemSchema>;
export type UpdateItem = z.infer<typeof updateItemSchema>;

// Item reference schema for use in enquiries, quotations, POs
export const itemReferenceSchema = z.object({
  itemId: z.string().min(1, "Item ID is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  rate: z.number().min(0, "Rate must be positive").optional(),
  amount: z.number().min(0, "Amount must be positive").optional(),
  remarks: z.string().optional(),
  // Additional fields specific to context
  materialConsideration: z.string().optional(), // For quotations
  deliveryDate: z.string().optional(), // For POs
});

export type ItemReference = z.infer<typeof itemReferenceSchema>;
