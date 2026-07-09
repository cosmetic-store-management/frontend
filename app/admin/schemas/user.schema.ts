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
  citizenId: z.string().optional(),
  startDate: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  homeAddress: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  status: z.enum(["working", "probation", "suspended", "resigned"]).optional(),
  contractType: z.enum(["fulltime", "parttime", "probationary", "internship"]).optional(),
  workingShift: z.enum(["morning", "afternoon", "night", "full"]).optional(),
  baseSalary: z.preprocess((val) => (val === "" || val === undefined ? 0 : Number(val)), z.number().nonnegative()).optional(),
  allowance: z.preprocess((val) => (val === "" || val === undefined ? 0 : Number(val)), z.number().nonnegative()).optional(),
  commissionRate: z.preprocess((val) => (val === "" || val === undefined ? 0 : Number(val)), z.number().nonnegative()).optional(),
});

export type CreateStaffFormData = z.infer<typeof createStaffSchema>;

export const updateStaffInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Invalid phone number"),
  citizenId: z.string().optional(),
  startDate: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  emergencyName: z.string().optional(),
  emergencyPhone: z.string().optional(),
  emergencyRelationship: z.string().optional(),
  homeAddress: z.string().optional(),
  dob: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  status: z.enum(["working", "probation", "suspended", "resigned"]).optional(),
  contractType: z.enum(["fulltime", "parttime", "probationary", "internship"]).optional(),
  workingShift: z.enum(["morning", "afternoon", "night", "full"]).optional(),
  baseSalary: z.preprocess((val) => (val === "" || val === undefined ? 0 : Number(val)), z.number().nonnegative()).optional(),
  allowance: z.preprocess((val) => (val === "" || val === undefined ? 0 : Number(val)), z.number().nonnegative()).optional(),
  commissionRate: z.preprocess((val) => (val === "" || val === undefined ? 0 : Number(val)), z.number().nonnegative()).optional(),
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
