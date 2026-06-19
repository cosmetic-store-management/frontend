import { z } from "zod";

export const settingsSchema = z.object({
  storeName: z.string().min(1, "Tên cửa hàng không được để trống"),
  currency: z.string().min(1, "Đơn vị tiền tệ không được để trống"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  storeAddress: z.string().min(5, "Địa chỉ cửa hàng quá ngắn"),
  standardShippingFee: z.coerce.number().min(0, "Phí ship không hợp lệ"),
  freeShippingThreshold: z.coerce.number().min(0, "Ngưỡng freeship không hợp lệ"),
  // Điểm thưởng
  pointsEarnRate: z.coerce.number().int().min(1, "Tỷ lệ tích điểm phải lớn hơn 0"),
  maxPointsPct: z.coerce.number().int().min(1).max(100, "Giới hạn dùng điểm phải từ 1-100%"),

  isCodActive: z.boolean(),
  isBankActive: z.boolean(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),

  isQrActive: z.boolean(),
}).refine((data) => {
  if (data.isBankActive) {
    if (!data.bankName || !data.bankAccountNumber || !data.bankAccountName) {
      return false;
    }
  }
  return true;
}, {
  message: "Vui lòng nhập đầy đủ thông tin ngân hàng khi bật thanh toán Chuyển khoản",
  path: ["isBankActive"],
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
