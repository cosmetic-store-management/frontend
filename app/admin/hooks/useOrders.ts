import { useCallback, useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { useDebounce } from "@/hooks/useDebounce";
import { getAdminOrders, updateOrderStatus, cancelOrder } from "@/admin/services/order.service";
import type { Order } from "@/admin/types/order";
import type { OrderFormValues } from "../components/OrderModal";

export type FilterKey = "all" | Order["orderStatus"];

export function useOrders(keyword: string, filter: FilterKey, paymentStatus?: string, dateFrom?: string, dateTo?: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedKeyword = useDebounce(keyword, 500);

  // ── Fetch ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminOrders({
        page: currentPage,
        limit: 10,
        search: debouncedKeyword,
        orderStatus: filter === "all" ? undefined : filter,
        paymentStatus: paymentStatus || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedKeyword, filter, paymentStatus, dateFrom, dateTo]);

  useEffect(() => {
    void load();
  }, [load]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedKeyword, filter, paymentStatus, dateFrom, dateTo]);



  // ── Submissions ──────────────────────────────────────────────────────────
  // ── Submissions ──────────────────────────────────────────────────────────
  const submitEdit = async (orderId: string, values: OrderFormValues) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(orderId, {
        orderStatus: values.orderStatus,
      });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast.success("Trạng thái đơn hàng đã được cập nhật");
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Cập nhật đơn hàng thất bại";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const submitCancel = async (orderId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      toast.success("Đã hủy đơn hàng thành công");
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Hủy đơn hàng thất bại";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return {
    orders,
    pagination,
    currentPage,
    setCurrentPage,
    loading,
    error,
    submitting,
    submitEdit,
    submitCancel,
    refresh: load,
    clearError: () => setError(null),
  };
}
