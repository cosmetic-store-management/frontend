import { z } from "zod";

export const publicLoginSchema = z.object({
  identifier: z.string().min(1, "Vui lòng nhập email hoặc số điện thoại"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type PublicLoginForm = z.infer<typeof publicLoginSchema>;

export const publicRegisterSchema = z
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

export type PublicRegisterForm = z.infer<typeof publicRegisterSchema>;

export const publicForgotPasswordSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
});

export type PublicForgotPasswordForm = z.infer<
  typeof publicForgotPasswordSchema
>;

export const publicResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Vui lòng nhập reset token"),
    password: z.string().min(6, "Mật khẩu ít nhất 6 ký tự"),
    confirmPassword: z.string().min(6, "Mật khẩu xác nhận ít nhất 6 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type PublicResetPasswordForm = z.infer<typeof publicResetPasswordSchema>;
