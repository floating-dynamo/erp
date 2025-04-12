import { z } from 'zod';

// Define the schema for Company
export const createCompanySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Required'),
  city: z.string().trim().min(1, 'Required'),
  state: z.string().trim().min(1, 'Required'),
  gstNumber: z.string().trim().min(1, 'Required'),
  pinCode: z
    .number()
    .min(100000, 'Invalid Pin Code')
    .max(999999, 'Invalid Pin Code')
    .optional(),
  contact: z
    .number()
    .min(1000000000, 'Invalid Contact Number')
    .max(9999999999, 'Invalid Contact Number')
    .optional(),
  email: z.string().email('Invalid Email'),
});

export type Company = z.infer<typeof createCompanySchema>;