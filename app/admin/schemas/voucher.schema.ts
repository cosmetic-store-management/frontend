import { z } from "zod";

export const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Voucher code must be at least 3 characters")
      .trim()
      .toUpperCase(),
    discountType: z.enum(["percent", "fixed", "freeship"]),
    discountValue: z.number().min(0, "Discount value cannot be negative"),
    minOrderValue: z.number().min(0),
    maxDiscount: z.number().min(0).optional(),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    usageLimit: z.number().min(0),
    isActive: z.boolean(),
    ttlMinutes: z.number().min(0).optional(),
    overbookingLimit: z.number().min(-1).optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return start < end;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (data.discountType === "percent" && data.discountValue > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Discount value cannot exceed 100%",
      path: ["discountValue"],
    },
  );

export type VoucherFormData = z.infer<typeof voucherSchema>;
