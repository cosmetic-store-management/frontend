import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().min(1, "Tên thương hiệu không được để trống").max(100, "Tên thương hiệu quá dài"),
  description: z.string().optional(),
  imageUrl: z.string().url("Đường dẫn ảnh không hợp lệ").or(z.literal("")).optional(),
  country: z.string().max(50, "Tên quốc gia quá dài").optional(),
  isActive: z.boolean().default(true),
});

export type BrandFormData = z.infer<typeof brandSchema>;
