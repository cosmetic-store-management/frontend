import { apiClient } from "@/lib/client";
import type { Order } from "@/admin/types/order";

// ── Customer ──────────────────────────────────────────────────────────────────

export function getMyOrders(): Promise<Order[]> {
  return apiClient
    .get<{ orders: Order[] }>("/orders/my-orders")
    .then((data) => data.orders);
}

export function getOrderById(id: string): Promise<Order> {
  return apiClient
    .get<{ order: Order }>(`/orders/${id}`)
    .then((data) => data.order);
}

export const createOrder = async (payload: any) => {
  return apiClient
    .post<{ order: Order }>("/checkout", payload)
    .then((res) => res.order);
};

export const updateOrderStatus = async (
  orderId: string,
  payload: {
    orderStatus?: string;
    trackingCode?: string;
  },
) => {
  return apiClient
    .patch<{
      message: string;
      order: Order;
    }>(`/orders/admin/${orderId}/status`, payload)
    .then((res) => res.order);
};

export const updateOrderAdmin = async (orderId: string, payload: any) => {
  return apiClient
    .patch<{ message: string; order: Order }>(
      `/orders/admin/${orderId}/details`,
      payload,
    )
    .then((res) => res.order);
};

export const cancelOrder = async (orderId: string) => {
  return apiClient
    .patch<{ message: string; order: Order }>(`/orders/${orderId}/cancel`)
    .then((res) => res.order);
};

export const processRefund = async (orderId: string, payload?: any) => {
  return apiClient
    .patch<{ message: string; order: Order }>(
      `/orders/admin/${orderId}/refund`,
      payload,
    )
    .then((res) => res.order);
};

export const approveReturn = async (orderId: string) => {
  return apiClient
    .patch<{ message: string; order: Order }>(
      `/orders/admin/${orderId}/return/approve`,
    )
    .then((res) => res.order);
};

export const rejectReturn = async (orderId: string, rejectReason: string) => {
  return apiClient
    .patch<{ message: string; order: Order }>(
      `/orders/admin/${orderId}/return/reject`,
      { rejectReason },
    )
    .then((res) => res.order);
};

export const fetchOrders = async (query: Partial<AdminOrderQuery>) => {
  // Loại bỏ các key undefined hoặc null để URL query sạch sẽ
  Object.keys(query).forEach((key) => {
    if (
      query[key as keyof AdminOrderQuery] === undefined ||
      query[key as keyof AdminOrderQuery] === null ||
      query[key as keyof AdminOrderQuery] === ""
    ) {
      delete query[key as keyof AdminOrderQuery];
    }
  });

  return apiClient.get<OrderListResult>(
    "/orders/admin/list",
    query as Record<string, string | number | boolean>,
  );
};

export const fetchOrderById = async (id: string) => {
  return apiClient
    .get<{ order: Order }>(`/orders/${id}`)
    .then((res) => res.order);
};

/**
 * Tạo đơn hàng POS tại quầy
 */
export const createPOSOrder = async (payload: any) => {
  return apiClient
    .post<{ order: Order }>("/checkout/pos", payload)
    .then((res) => res.order);
};

// ── Admin ─────────────────────────────────────────────────────────────────────

export interface AdminOrderQuery {
  search?: string;
  orderStatus?: string;
  channel?: string;
  userId?: string;
  cursor?: string;
  limit?: number;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderListResult {
  orders: Order[];
  pagination: {
    limit: number;
    total: number;
    nextCursor: string | null;
    hasNextPage: boolean;
  };
}

export interface CreatePOSOrderPayload {
  paymentMethod: "cash" | "pos_card" | "transfer";
  items: { productId: string; quantity: number; variant?: string }[];
  note?: string;
  customerPhone?: string;
}
