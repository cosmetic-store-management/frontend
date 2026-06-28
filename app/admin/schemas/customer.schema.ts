import { z } from "zod";

export const updateCustomerSchema = z.object({
  name: z.string().min(2, "Họ tên ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  street: z.string().optional(),
});

export const updateNotesSchema = z.object({
  internalNotes: z.string().optional(),
});

export const adjustPointsSchema = z.object({
  pointsChanged: z.coerce
    .number()
    .min(-100000)
    .max(100000, "Số điểm không hợp lệ"),
  reason: z.string().min(1, "Lý do không được để trống"),
});

export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
export type UpdateNotesFormData = z.infer<typeof updateNotesSchema>;
export type AdjustPointsFormData = z.infer<typeof adjustPointsSchema>;
