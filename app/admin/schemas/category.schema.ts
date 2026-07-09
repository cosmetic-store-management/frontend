import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters"),
  description: z.string(),
  imageUrl: z.string().url("Invalid image URL").or(z.literal("")),
  iconUrl: z.string().url("Invalid icon URL").or(z.literal("")),
  bannerUrl: z.string().url("Invalid banner URL").or(z.literal("")),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.coerce
    .number()
    .int("Must be an integer")
    .min(1, "Minimum sort order is 1"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
