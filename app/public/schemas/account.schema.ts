import { z } from "zod";

export const accountUpdateSchema = z.object({
  name: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z
    .string()
    .min(8, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Mật khẩu hiện tại ít nhất 6 ký tự"),
    newPassword: z.string().min(6, "Mật khẩu mới ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận mật khẩu ít nhất 6 ký tự"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  province: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
  district: z.string().min(1, "Quận/Huyện không được để trống"),
  ward: z.string().min(1, "Phường/Xã không được để trống"),
  street: z.string().min(1, "Số nhà, Tên đường không được để trống"),
  isDefault: z.boolean(),
});

export type AccountUpdateFormData = z.infer<typeof accountUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
