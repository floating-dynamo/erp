import { z } from 'zod';
import { itemReferenceSchema } from "../items/schemas";

export const createPurchaseOrderSchema = z.object({
  id: z.string().optional(),
  poMonth: z.string().optional(),
  deliveryMonth: z.string().optional(),
  customerId: z.string().optional(),
  enquiryId: z.string().optional(),
  poNumber: z.string(),
  buyerName: z.string().optional(),
  deliveryDate: z.string().optional(),
  poDate: z.string().optional(),
  items: z.array(
    itemReferenceSchema.extend({
      // Purchase order specific fields
      itemCode: z.number().optional(), // Keep for backward compatibility during migration
      itemDescription: z.string().optional(), // Keep for backward compatibility during migration
    })
  ),
  typeOfService: z.string().optional(),
  currency: z.string().optional(),
  exRate: z.number().optional(),
  basicValue: z.number().optional(),
  taxPercentage: z.number(),
  taxValue: z.number().optional(),
  totalBasicValue: z.number().optional(),
  totalValue: z.number().optional(),
});

export type PurchaseOrder = z.infer<typeof createPurchaseOrderSchema>;
