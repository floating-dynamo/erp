import { z } from "zod";

export const createEnquirySchema = z.object({
  id: z.string().optional(),
  customerId: z.string().trim().min(1, "Required"),
  customerName: z.string().optional(),
  enquiryNumber: z.string().min(0, "Required"),
  totalItemsPrice: z.number().optional(),
  totalItemsFinalPrice: z.number().optional(),
  file: z.instanceof(File).optional(),
  enquiryDate: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Invalid date",
  }),
  quotationDueDate: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Invalid date",
  }),
  items: z.array(
    z.object({
      itemCode: z.number(),
      itemDescription: z.string().min(1, "Required"),
      quantity: z.number(),
    })
  ),
  termsAndConditions: z.string().optional(),
});

export type Enquiry = z.infer<typeof createEnquirySchema>;
