import { z } from "zod";

export const accountUpdateSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z
    .string()
    .min(8, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Confirm password does not match",
    path: ["confirmPassword"],
  });

export const addressSchema = z.object({
  province: z.string().min(1, "Province/City is required"),
  district: z.string().min(1, "District is required"),
  ward: z.string().min(1, "Ward/Commune is required"),
  street: z.string().min(1, "Street address is required"),
  isDefault: z.boolean(),
});

export type AccountUpdateFormData = z.infer<typeof accountUpdateSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
