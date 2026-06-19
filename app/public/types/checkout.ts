import type { PaymentMethod } from "../../admin/types/order";

// Re-export để các file cũ import từ checkout vẫn hoạt động
export type { PaymentMethod };

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  weight: number;
  variant?: string;
}

export type ShippingMethod = "standard" | "express";

export interface CreateOrderPayload {
  paymentMethod: PaymentMethod;
  items: { productId: string; quantity: number; variant?: string }[];
  note?: string;
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  shippingMethod: ShippingMethod;
  voucherCode?: string;
}
