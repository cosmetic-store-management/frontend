import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập email hoặc số điện thoại"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "Họ tên ít nhất 2 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    phone: z
      .string()
      .transform((val) => val.replace(/[\s-]+/g, ""))
      .refine((val) => /^[0-9]{9,11}$/.test(val), {
        message: "Số điện thoại không hợp lệ",
      }),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu xác nhận ít nhất 6 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterForm = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập email hoặc số điện thoại"),
});

export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Thiếu token khôi phục"),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu xác nhận ít nhất 6 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
