import { z } from "zod";

// Define the schema for Quotation File Attachments
export const quotationFileSchema = z.object({
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

// Define the schema for the Item
export const quotationItemSchema = z.object({
  itemCode: z.number().min(0, "Cannot be negative"),
  itemDescription: z.string().trim(),
  materialConsideration: z.string().optional(),
  quantity: z.number().min(1, "Quantity must be greater than 0"),
  uom: z.string().optional(), // Dropdown selection for unit of measurement (UOM)
  rate: z.number().min(0, "Rate must be a positive number"),
  currency: z.string().optional(), // Dropdown selection for currency
  amount: z.number().min(0), // Amount (calculated as Quantity x Rate, not editable)
  remarks: z.string().optional(),
});

// Define the Quotation schema
export const createQuotationSchema = z.object({
  id: z.string().optional(),
  customerName: z.string().trim().min(1, "Customer Name is required"), // Added Customer Name
  customerId: z.string(),
  enquiryNumber: z.string().optional(), // Dependent on the customer, can be empty if not navigated from an enquiry
  quotationDate: z.string().optional(), // Quotation date (string in a specific format)
  quoteNumber: z.string().optional(), // Unique backend generated number like QUO/YY/MM/DD/00000
  items: z.array(quotationItemSchema), // List of items for the quotation
  totalAmount: z.number().optional(), // Total amount for the quotation
  termsAndConditions: z.string().optional(), // Pre-populated based on the last created quotation
  myCompanyGSTIN: z.string().optional(), // MyCompany GSTIN
  myCompanyPAN: z.string().optional(), // MyCompany PAN
  myCompanyName: z.string().optional(), // MyCompany Name
  attachments: z.array(quotationFileSchema).optional().default([]), // File attachments
});

// Define the schema for editing quotations
export const editQuotationSchema = createQuotationSchema.extend({
  id: z.string().min(1, "Quotation ID is required"),
});

// Export the types for usage
export type Quotation = z.infer<typeof createQuotationSchema>;
export type EditQuotationSchema = z.infer<typeof editQuotationSchema>;
export type QuotationFile = z.infer<typeof quotationFileSchema>;
