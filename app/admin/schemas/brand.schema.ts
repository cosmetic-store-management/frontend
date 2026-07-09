import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string()
    .min(1, "Brand name cannot be empty")
    .max(100, "Brand name is too long"),
  description: z.string().optional(),
  imageUrl: z
    .string()
    .url("Invalid image URL")
    .or(z.literal(""))
    .optional(),
  country: z.string().max(50, "Country name is too long").optional(),
  isActive: z.boolean().default(true),
  website: z.string().url("Invalid website URL").or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email address").or(z.literal("")).optional(),
  supplierName: z.string().optional(),
  minimumOrderValue: z.preprocess((val) => Number(val) || 0, z.number().min(0).default(0)),
  leadTimeDays: z.preprocess((val) => Number(val) || 7, z.number().min(0).default(7)),
  supplierId: z.string().optional().nullable(),
});

export type BrandFormData = z.infer<typeof brandSchema>;
