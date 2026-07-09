import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  phone: z.string().min(1, "Phone is required").max(20, "Phone is too long"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  address: z.string().optional(),
  taxCode: z.string().optional(),
  contactPerson: z.string().optional(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  contactPosition: z.string().optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
