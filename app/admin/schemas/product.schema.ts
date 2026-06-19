import { z } from "zod";

export const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Tên phân loại không được để trống"),
  sku: z.string().min(1, "SKU không được để trống"),
  price: z.string().min(1, "Giá không được để trống"),
  discountPrice: z.string().optional(),
  stock: z.string().min(1, "Tồn kho không được để trống"),
  minStock: z.string().min(1, "Mức tối thiểu không được để trống"),
  weight: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const productSchema = z.object({
  name:        z.string().min(1, "Tên sản phẩm không được để trống"),
  slug:        z.string().optional(),
  description: z.string().optional(),
  categoryId:  z.string().min(1, "Vui lòng chọn danh mục chính"),
  categoryIds: z.array(z.string()).default([]),  // secondary N:M categories
  brandId:     z.string().min(1, "Vui lòng chọn thương hiệu"),
  imageUrl:    z.string().optional(),
  imageUrls:   z.array(z.string()).default([]),
  isActive:    z.boolean().default(true),
  variants:    z.array(variantSchema).min(1, "Cần ít nhất 1 phân loại"),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type VariantFormData = z.infer<typeof variantSchema>;
