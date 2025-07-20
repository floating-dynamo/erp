import { z } from "zod";

// Define the schema for Enquiry File Attachments
export const enquiryFileSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  filename: z.string(), // Unique filename stored on server
  mimetype: z.string(),
  size: z.number(),
  uploadedAt: z.union([z.date(), z.string()]).optional().transform((val) => {
    if (!val) return undefined;
    if (typeof val === 'string') {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date;
    }
    return val;
  }),
  uploadedBy: z.string().optional(), // User ID who uploaded
  description: z.string().optional(), // Optional description for the file
});

export const createEnquirySchema = z.object({
  id: z.string().optional(),
  customerId: z.string().trim().min(1, "Required"),
  customerName: z.string().min(1, "Required"),
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
      itemCode: z.number().optional(),
      itemDescription: z.string().min(1, "Required"),
      quantity: z.number().min(0, "It cannot be negative"),
    })
  ),
  termsAndConditions: z.string().optional(),
  isQotationCreated: z.boolean().optional(),
  attachments: z.array(enquiryFileSchema).optional().default([]),
});

export type Enquiry = z.infer<typeof createEnquirySchema>;
export type EnquiryFile = z.infer<typeof enquiryFileSchema>;
