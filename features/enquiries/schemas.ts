import { z } from "zod";

export const createEnquirySchema = z.object({
  customerId: z.string().trim().min(1, "Required"),
  enquiryNumber: z.number().min(0, "Required"),
  totalItemsPrice: z.number().optional(),
  totalItemsFinalPrice: z.number().optional(),
  file: z.instanceof(File).optional(),
  enquiryDate: z.string().refine((value) => !isNaN(Date.parse(value)), {
    message: "Invalid date",
  }),
  items: z.array(
    z.object({
      itemCode: z.number(),
      itemDescription: z.string().min(1, "Required"),
      quantity: z.number(),
      unitPrice: z.number(),
      unitTax: z.number(),
    })
  ),
  termsAndConditions: z.string().optional(),
});
