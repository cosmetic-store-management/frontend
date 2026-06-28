import { z } from "zod";

export const variantSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().min(1, "Tên phân loại không được để trống"),
    sku: z.string().min(1, "SKU không được để trống"),
    price: z
      .string()
      .min(1, "Giá không được để trống")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        "Giá phải là số ≥ 0",
      ),
    discountPrice: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        "Giá KM phải là số ≥ 0",
      ),
    stock: z
      .string()
      .min(1, "Tồn kho không được để trống")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        "Tồn kho phải là số ≥ 0",
      ),
    minStock: z
      .string()
      .min(1, "Mức tối thiểu không được để trống")
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) >= 0,
        "Mức tối thiểu phải là số ≥ 0",
      ),
    weight: z
      .string()
      .optional()
      .refine(
        (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
        "Trọng lượng phải là số ≥ 0",
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
          message: "Giá khuyến mãi phải nhỏ hơn giá gốc",
          path: ["discountPrice"],
        });
      }
    }
  });

export const productSchema = z.object({
  name: z.string().min(1, "Tên sản phẩm không được để trống"),
  slug: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục chính"),
  categoryIds: z.array(z.string()).default([]), // secondary N:M categories
  brandId: z.string().min(1, "Vui lòng chọn thương hiệu"),
  imageUrl: z.string().min(1, "Ảnh đại diện không được để trống"),
  imageUrls: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  variants: z.array(variantSchema).min(1, "Cần ít nhất 1 phân loại"),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type VariantFormData = z.infer<typeof variantSchema>;
