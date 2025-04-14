import { z } from 'zod';

const workOrderSchema = z.object({
  woNumber: z.string().nonempty('WO Number is required'),
  woDescription: z.string().nonempty('WO Description is required'),
  qty: z.number().min(1, 'Quantity must be at least 1'),
  purpose: z.string().optional(),
  remarks: z.string().optional(),
});

export const supplierDcSchema = z.object({
  id: z.string().optional(),
  from: z.string().nonempty('From is required'),
  to: z.string().nonempty('To is required'),
  gstIn: z.string().nonempty('GSTIN is required'),
  poRef: z.string().nonempty('PO Reference is required'),
  dcNo: z.string().optional(),
  date: z.string().nonempty('Date is required'),
  workOrders: z.array(workOrderSchema),
  returnable: z.boolean(),
  nonreturnable: z.boolean(),
});

export type createSupplierDcSchema = z.infer<typeof supplierDcSchema>;
export type SupplierDc = createSupplierDcSchema;
