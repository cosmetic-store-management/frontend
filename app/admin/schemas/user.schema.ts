import { z } from "zod";

export const updateAccountSchema = z.object({
  name: z.string().min(2, "Họ tên ít nhất 2 ký tự").optional(),
  phone: z
    .string()
    .regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ")
    .optional(),
  address: z.string().optional(),
});

export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
export const createStaffSchema = z.object({
  name: z.string().min(2, "Họ tên ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
  role: z.enum(["manager", "staff"]).default("staff"),
  permissions: z.array(z.string()).default([]),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;

export const updateStaffInfoSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().min(10, "SĐT không hợp lệ"),
});

export type UpdateStaffInfoFormData = z.infer<typeof updateStaffInfoSchema>;

export const updateStaffNotesSchema = z.object({
  internalNotes: z
    .string()
    .max(1000, "Ghi chú không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
});

export type UpdateStaffNotesFormData = z.infer<typeof updateStaffNotesSchema>;
