import { z } from "zod";

export const variantSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Variant name is required"),
    sku: z.string().optional(),
    barcode: z.string().optional(),
    price: z
      .string()
      .min(1, "Price is required")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        "Price must be ≥ 0",
      ),
    discountPrice: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        "Sale price must be ≥ 0",
      ),
    stock: z
      .string()
      .min(1, "Stock is required")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        "Stock must be ≥ 0",
      ),
    minStock: z
      .string()
      .min(1, "Min stock is required")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        "Min stock must be ≥ 0",
      ),
    weight: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        "Weight must be ≥ 0",
      ),
    imageUrl: z.string().optional(),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    if (data.discountPrice && data.discountPrice !== "") {
      const p = parseFloat(data.price);
      const dp = parseFloat(data.discountPrice);
      if (!isNaN(p) && !isNaN(dp) && dp >= p) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sale price must be less than regular price",
          path: ["discountPrice"],
        });
      }
    }
  });

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Please select a category"),
  categoryIds: z.array(z.string()).default([]), // secondary N:M categories
  brandId: z.string().min(1, "Please select a brand"),
  imageUrl: z.string().min(1, "Thumbnail image is required"),
  imageUrls: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  variants: z.array(variantSchema).default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type VariantFormData = z.infer<typeof variantSchema>;
