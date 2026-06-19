import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Tên danh mục ít nhất 2 ký tự"),
  description: z.string(),
  imageUrl: z.string().url("URL hình ảnh không hợp lệ").or(z.literal("")),
  iconUrl: z.string().url("URL icon không hợp lệ").or(z.literal("")),
  bannerUrl: z.string().url("URL banner không hợp lệ").or(z.literal("")),
  parentId: z.string().nullable().optional(),
  isActive: z.boolean(),
  sortOrder: z.coerce.number().int("Phải là số nguyên").min(1, "Vị trí tối thiểu là 1"),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
