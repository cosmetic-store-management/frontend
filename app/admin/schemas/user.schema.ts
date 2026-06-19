import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Họ tên ít nhất 2 ký tự").optional(),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ").optional(),
  address: z.string().optional(),
});


export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export const createStaffSchema = z.object({
  name: z.string().min(2, "Họ tên ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
  role: z.enum(["manager", "staff"]).default("staff"),
  permissions: z.array(z.string()).default([]),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;
