import { z } from 'zod';

// Define the schema for CustomerAddress
export const customerAddressSchema = z.object({
  address1: z.string().optional(),
  address2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return typeof val === 'string' ? Number(val) || undefined : val;
  }),
});

// Define the schema for CustomerPOC
export const customerPOCSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  mobile: z.union([z.number(), z.string()]).optional().transform((val) => {
    if (val === undefined || val === null || val === '') return undefined;
    return typeof val === 'string' ? Number(val) || undefined : val;
  }),
  email: z.string().email(),
});

// Define the schema for Customer File Attachments
export const customerFileSchema = z.object({
  id: z.string(),
  originalName: z.string(),
  filename: z.string(), // Unique filename stored on server
  mimetype: z.string(),
  size: z.number(),
  uploadedAt: z.date().optional(),
  uploadedBy: z.string().optional(), // User ID who uploaded
  description: z.string().optional(), // Optional description for the file
});

// Helper function to validate base64 image size
const validateBase64ImageSize = (value: string) => {
  // Base64 encoding increases size by ~33%, so 7.5MB image becomes ~10MB base64
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  return value.length <= maxSizeInBytes;
};

// Define the schema for Customer
export const createCustomerSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Required'),
  address: customerAddressSchema.optional(),
  contactDetails: z.string().optional(),
  poc: z.array(customerPOCSchema).optional(),
  gstNumber: z.string().optional(),
  vendorId: z.string().optional(),
  customerType: z.string().optional(),
  image: z
    .union([
      z
        .instanceof(File)
        .refine(
          (file) => file.size <= 7.5 * 1024 * 1024, // 7.5MB limit for file
          'Image file must be less than 7.5MB'
        ),
      z
        .string()
        .refine(
          (value) => value === '' || validateBase64ImageSize(value),
          'Image data is too large (max 7.5MB)'
        )
        .transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
  attachments: z.array(customerFileSchema).optional().default([]),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type Customer = z.infer<typeof createCustomerSchema>;
export type CustomerFile = z.infer<typeof customerFileSchema>;
