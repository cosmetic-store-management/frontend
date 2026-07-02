import { z } from "zod";

export const updateAccountSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").optional(),
  phone: z
    .string()
    .regex(/^[0-9]{9,11}$/, "Invalid phone number")
    .optional(),
  address: z.string().optional(),
});

export type UpdateAccountFormData = z.infer<typeof updateAccountSchema>;
export const createStaffSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  phone: z.string().regex(/^[0-9]{9,11}$/, "Invalid phone number"),
  role: z.enum(["manager", "staff"]).default("staff"),
  permissions: z.array(z.string()).default([]),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;

export const updateStaffInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Invalid phone number"),
});

export type UpdateStaffInfoFormData = z.infer<typeof updateStaffInfoSchema>;

export const updateStaffNotesSchema = z.object({
  internalNotes: z
    .string()
    .max(1000, "Notes cannot exceed 1000 characters")
    .optional()
    .or(z.literal("")),
});

export type UpdateStaffNotesFormData = z.infer<typeof updateStaffNotesSchema>;
