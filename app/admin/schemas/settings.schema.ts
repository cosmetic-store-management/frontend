import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  currency: z.string().min(1, "Currency is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
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
    .min(1, "Points earn rate must be greater than 0"),
  maxPointsPct: z.coerce
    .number()
    .int()
    .min(0)
    .max(100, "Points usage limit must be between 0-100%"),
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

export const accountSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email").or(z.literal("")),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Invalid phone number"),
});

export type AccountFormData = z.infer<typeof accountSchema>;

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Please enter your current password"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"],
  });

export type PasswordFormData = z.infer<typeof passwordSchema>;
