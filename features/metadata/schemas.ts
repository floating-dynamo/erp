import { z } from 'zod';

// Schema for Unit of Measurement (UOM)
export const UOMSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type UOM = z.infer<typeof UOMSchema>;

// Schema for Currency
export const CurrencySchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  name: z.string(),
  symbol: z.string(),
  exchangeRate: z.number().optional(),
  isActive: z.boolean().default(true),
});

export type Currency = z.infer<typeof CurrencySchema>;

// Combined metadata response schema
export const MetadataSchema = z.object({
  uoms: z.array(UOMSchema),
  currencies: z.array(CurrencySchema),
});

export type Metadata = z.infer<typeof MetadataSchema>;