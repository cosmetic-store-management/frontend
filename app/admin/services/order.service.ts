import { apiClient } from "@/lib/client";
import type { Order } from "@/admin/types/order";
import type { CreateOrderPayload } from "@/public/types/checkout";

// ── Customer ──────────────────────────────────────────────────────────────────

export function getMyOrders(): Promise<Order[]> {
  return apiClient.get<{ orders: Order[] }>("/orders/my-orders")
    .then((data) => data.orders);
}

export function getOrderById(id: string): Promise<Order> {
  return apiClient.get<{ order: Order }>(`/orders/${id}`)
    .then((data) => data.order);
}

export function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return apiClient.post<{ order: Order }>("/orders", payload)
    .then((data) => data.order);
}

export function cancelOrder(id: string): Promise<Order> {
  return apiClient.patch<{ order: Order }>(`/orders/${id}/cancel`)
    .then((data) => data.order);
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminOrderQuery {
  search?: string;
  orderStatus?: string;
  channel?: string;
  userId?: string;
  page?: number;
  limit?: number;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderListResult {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function getAdminOrders(query: AdminOrderQuery = {}): Promise<OrderListResult> {
  return apiClient.get<OrderListResult>("/orders/admin/list", query as Record<string, string | number | boolean>);
}

export function updateOrderStatus(
  id: string,
  data: { orderStatus?: string; receiverName?: string; phone?: string }
): Promise<Order> {
  return apiClient.patch<{ order: Order }>(`/orders/admin/${id}/status`, data)
    .then((res) => res.order);
}

export interface CreatePOSOrderPayload {
  paymentMethod: "cash" | "card" | "qr";
  items: { productId: string; quantity: number; variant?: string }[];
  note?: string;
  customerPhone?: string;
}

export function createPOSOrder(payload: CreatePOSOrderPayload): Promise<Order> {
  return apiClient.post<{ order: Order }>("/orders/pos", payload)
    .then((data) => data.order);
}
