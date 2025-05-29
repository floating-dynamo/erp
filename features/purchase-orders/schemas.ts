import { z } from 'zod';

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
    z.object({
      itemCode: z.number().optional(),
      itemDescription: z.string().min(1, 'Required'),
      quantity: z.number().min(0, 'It cannot be negative'),
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
