import { z } from "zod";

export const createRequirementSchema = z.object({
  customerId: z.string().trim().min(1, "Required"),
  enquiryNumber: z.string().min(1, "Required"),
  totalItemsPrice: z.number().min(0, "Required"),
  totalItemsFinalPrice: z.number().min(0, "Required"),
  image: z
    .union([
      z.instanceof(File),
      z.string().transform((value) => (value === "" ? undefined : value)),
    ])
    .optional(),
});
