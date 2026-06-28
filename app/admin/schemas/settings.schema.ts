import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().min(1, "Tên cửa hàng không được để trống"),
  currency: z.string().min(1, "Đơn vị tiền tệ không được để trống"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  phone: z.string().optional(),
  storeAddress: z.string().optional(),
  taxId: z.string().optional(),
  workingHours: z.string().optional(),
  description: z.string().optional(),
  
  // Branding & SEO
  logoUrl: z.string().optional(),
  favicon: z.string().optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  
  // Social Links
  facebookUrl: z.string().optional(),
  instagramUrl: z.string().optional(),
  tiktokUrl: z.string().optional(),
  zaloUrl: z.string().optional(),
  youtubeUrl: z.string().optional(),

  // Điểm thưởng & Phí vận chuyển
  pointsEarnRate: z.coerce
    .number()
    .int()
    .min(1, "Tỷ lệ tích điểm phải lớn hơn 0"),
  maxPointsPct: z.coerce
    .number()
    .int()
    .min(0)
    .max(100, "Giới hạn dùng điểm phải từ 0-100%"),
  profitMargin: z.coerce.number().min(0).max(100).optional(),

  // Thanh toán
  isCodActive: z.boolean().optional(),
  isBankActive: z.boolean().optional(),
  isQrActive: z.boolean().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  bankQrCodeUrl: z.string().optional(),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;

export const profileSchema = z.object({
  name: z.string().min(1, "Họ tên không được để trống"),
  email: z.string().email("Email không hợp lệ").or(z.literal("")),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
  confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Mật khẩu xác nhận không khớp",
  path: ["confirmPassword"],
});

export type PasswordFormData = z.infer<typeof passwordSchema>;
