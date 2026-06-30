import { z } from "zod";

export const voucherSchema = z
  .object({
    code: z
      .string()
      .min(3, "Mã giảm giá phải có ít nhất 3 ký tự")
      .trim()
      .toUpperCase(),
    discountType: z.enum(["percent", "fixed", "freeship"]),
    discountValue: z.number().min(0, "Giá trị giảm không được âm"),
    minOrderValue: z.number().min(0),
    maxDiscount: z.number().min(0).optional(),
    startDate: z.string().min(1, "Ngày bắt đầu không được để trống"),
    endDate: z.string().min(1, "Ngày kết thúc không được để trống"),
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
      message: "Ngày kết thúc phải sau ngày bắt đầu",
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
      message: "Giá trị giảm không được vượt quá 100%",
      path: ["discountValue"],
    },
  );

export type VoucherFormData = z.infer<typeof voucherSchema>;
