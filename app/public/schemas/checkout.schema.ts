import { z } from "zod";

/**
 * Payment method config — thêm method mới tại đây (VD: stripe)
 * Value phải khớp với enum backend order.request.dto.ts
 */
export const PAYMENT_METHODS = [
  {
    value: "cod" as const,
    label: "Thanh toán khi nhận hàng",
    description: "Thanh toán bằng tiền mặt khi shipper giao hàng",
    icon: "banknote",
  },
  {
    value: "bank" as const,
    label: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản theo thông tin tài khoản sau khi đặt hàng",
    icon: "qr",
  },
  {
    value: "stripe" as const,
    label: "Thanh toán bằng thẻ",
    description: "Thanh toán an toàn qua thẻ tín dụng/ghi nợ quốc tế",
    icon: "banknote", // Tạm dùng icon này nếu không có icon stripe riêng
  },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export const checkoutSchema = z.object({
  receiverName: z.string().min(1, "Họ tên không được để trống"),
  phone: z.string().min(8, "Số điện thoại không hợp lệ"),
  province: z.string().min(1, "Tỉnh/Thành phố không được để trống"),
  district: z.string().min(1, "Quận/Huyện không được để trống"),
  ward: z.string().min(1, "Phường/Xã không được để trống"),
  street: z.string().min(1, "Số nhà, tên đường không được để trống"),
  paymentMethod: z.enum(["cod", "bank", "stripe"]),
  note: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
