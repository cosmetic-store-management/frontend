import { z } from "zod";

export const updateCustomerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Invalid phone number"),
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
    .max(100000, "Invalid points value"),
  reason: z.string().min(1, "Reason is required"),
});

export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
export type UpdateNotesFormData = z.infer<typeof updateNotesSchema>;
export type AdjustPointsFormData = z.infer<typeof adjustPointsSchema>;
