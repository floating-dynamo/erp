import { z } from "zod";

export const createEnquirySchema = z.object({
  id: z.string().optional(),
  customerId: z.string(),
  customer: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .optional(),
  enquiryNumber: z.string(),
  totalItemsPrice: z.number().optional(),
  totalItemsFinalPrice: z.number().optional(),
  file: z.any().optional(),
  enquiryDate: z.string(),
  quotationDueDate: z.string(),
  items: z.array(
    z.object({
      itemCode: z.number().optional(),
      itemDescription: z.string(),
      quantity: z.number(),
    })
  ),
  termsAndConditions: z.string().optional(),
  isQotationCreated: z.boolean().optional(),
});

export type Enquiry = z.infer<typeof createEnquirySchema>;
