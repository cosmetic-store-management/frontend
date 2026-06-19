import { apiClient } from "@/lib/client";
import type { PaymentMethod } from "@/public/schemas/checkout.schema";

export interface CreateOrderPayload {
  receiverName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  paymentMethod: PaymentMethod;
  voucherCode?: string;
  usedPoints?: number;
  note?: string;
  items: { productId: string; variantId: string; quantity: number }[];
  idempotencyKey?: string;
}

export function createOrder(payload: CreateOrderPayload) {
  return apiClient.post<{ message: string; order: any }>("/orders", payload);
}

export function getOrderById(id: string) {
  return apiClient.get<{ order: any }>(`/orders/${id}`).then(d => d.order);
}


export function getMyOrders() {
  return apiClient.get<{ orders: any[] }>("/orders/my-orders")
    .then(data => data.orders);
}

export interface PreviewOrderPayload {
  items: { productId: string; variantId: string; quantity: number }[];
  voucherCode?: string;
  usedPoints?: number;
  discountAmount?: number;
  customerPhone?: string;
  channel?: "online" | "pos";
  province?: string;
}

export function previewOrder(payload: PreviewOrderPayload) {
  return apiClient.post<any>("/orders/preview", payload);
}

export function createPaymentUrl(orderId: string) {
  return apiClient.post<{ paymentUrl: string }>(`/orders/${orderId}/create-payment-url`, {});
}

export function cancelMyOrder(orderId: string) {
  return apiClient.patch<{ message: string; order: any }>(`/orders/${orderId}/cancel`, {});
}
