import { useState, useEffect, useMemo } from "react";
import { toast } from "@/lib/toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/useDebounce";
import {
  fetchOrders as getAdminOrders,
  updateOrderStatus,
  cancelOrder,
  processRefund,
  approveReturn,
  rejectReturn,
} from "@/admin/services/order.service";
import type { Order } from "@/admin/types/order";
import type { OrderFormValues } from "../components/orders/OrderModal";
import { useCursorPagination } from "@/hooks/useCursorPagination";
import { handleMutationError } from "@/lib/api-helper";

export type FilterKey = "all" | Order["orderStatus"];

export function useOrders(
  keyword: string,
  filter: FilterKey,
  paymentStatus?: string,
  dateFrom?: string,
  dateTo?: string,
  channel?: string,
) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const debouncedKeyword = useDebounce(keyword, 500);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setPage(1);
  }, [
    debouncedKeyword,
    filter,
    paymentStatus,
    dateFrom,
    dateTo,
    channel,
  ]);

  // 1. Fetch Orders
  const queryParams = useMemo(
    () => ({
      page,
      limit: 10,
      search: debouncedKeyword,
      orderStatus: filter === "all" ? undefined : filter,
      paymentStatus: paymentStatus || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      channel: channel || undefined,
    }),
    [
      page,
      debouncedKeyword,
      filter,
      paymentStatus,
      dateFrom,
      dateTo,
      channel,
    ],
  );

  const {
    data: ordersData,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: ["admin", "orders", queryParams],
    queryFn: () => getAdminOrders(queryParams),
  });

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination || {
    limit: 10,
    total: 0,
    page: 1,
    totalPages: 1,
  };
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Unable to load orders"
    : null;

  // 2. Mutations
  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: OrderFormValues }) =>
      updateOrderStatus(id, { orderStatus: values.orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order status updated");
    },
    onError: (err: any) => handleMutationError(err, "Failed to update order"),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (err: any) => handleMutationError(err, "Failed to cancel order"),
  });

  const refundMut = useMutation({
    mutationFn: (id: string) => processRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Refund confirmed successfully");
    },
    onError: (err: any) => handleMutationError(err, "Failed to refund"),
  });

  const approveReturnMut = useMutation({
    mutationFn: (id: string) => approveReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Return request approved");
    },
    onError: (err: any) => handleMutationError(err, "Failed to approve return"),
  });

  const rejectReturnMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectReturn(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Return request rejected");
    },
    onError: (err: any) => handleMutationError(err, "Failed to reject return"),
  });

  const submitting =
    updateMut.isPending ||
    cancelMut.isPending ||
    refundMut.isPending ||
    approveReturnMut.isPending ||
    rejectReturnMut.isPending;

  const submitEdit = async (orderId: string, values: OrderFormValues) => {
    try {
      await updateMut.mutateAsync({ id: orderId, values });
      return true;
    } catch {
      return false;
    }
  };

  const submitCancel = async (orderId: string) => {
    try {
      await cancelMut.mutateAsync(orderId);
      return true;
    } catch {
      return false;
    }
  };

  const submitRefund = async (orderId: string) => {
    try {
      await refundMut.mutateAsync(orderId);
      return true;
    } catch {
      return false;
    }
  };

  const submitApproveReturn = async (orderId: string) => {
    try {
      await approveReturnMut.mutateAsync(orderId);
      return true;
    } catch {
      return false;
    }
  };

  const submitRejectReturn = async (orderId: string, reason: string) => {
    try {
      await rejectReturnMut.mutateAsync({ id: orderId, reason });
      return true;
    } catch {
      return false;
    }
  };

  return {
    orders,
    pagination,
    page,
    setPage,
    updateStatus: updateMut.mutate,
    loading,
    error,
    submitting,
    submitEdit,
    submitCancel,
    submitRefund,
    submitApproveReturn,
    submitRejectReturn,
    refresh: refetch,
    clearError: () => {}, // No-op
  };
}
