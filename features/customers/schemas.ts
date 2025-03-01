import { z } from 'zod';

// Define the schema for CustomerAddress
export const customerAddressSchema = z.object({
  address1: z.string(),
  address2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  pincode: z.number().optional(),
});

// Define the schema for CustomerPOC
export const customerPOCSchema = z.object({
  name: z.string().trim().min(1, 'Required'),
  mobile: z.number().optional(),
  email: z.string().email(),
});

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
      z.instanceof(File),
      z.string().transform((value) => (value === '' ? undefined : value)),
    ])
    .optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export type Customer = z.infer<typeof createCustomerSchema>;
