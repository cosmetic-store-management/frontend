import { z } from "zod";

/**
 * Payment method config — thêm method mới tại đây (VD: stripe)
 * Value phải khớp với enum backend order.request.dto.ts
 */
export const PAYMENT_METHODS = [
  {
    value: "cod" as const,
    label: "Cash on Delivery",
    description: "Pay with cash upon delivery",
    icon: "banknote",
  },
  {
    value: "bank" as const,
    label: "Bank Transfer",
    description: "Transfer to our bank account after placing order",
    icon: "qr",
  },
  {
    value: "stripe" as const,
    label: "Credit/Debit Card",
    description: "Secure payment via credit/debit card",
    icon: "banknote", // Tạm dùng icon này nếu không có icon stripe riêng
  },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"];

export const checkoutSchema = z.object({
  receiverName: z.string().min(1, "Full name is required"),
  phone: z.string().min(8, "Invalid phone number"),
  province: z.string().min(1, "Province/City is required"),
  district: z.string().min(1, "District is required"),
  ward: z.string().min(1, "Ward is required"),
  street: z.string().min(1, "Street address is required"),
  paymentMethod: z.enum(["cod", "bank", "stripe"]),
  note: z.string().optional(),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;
