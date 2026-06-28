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
import type { OrderFormValues } from "../components/OrderModal";

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
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] || undefined;
  const debouncedKeyword = useDebounce(keyword, 500);

  // Reset to first page when search or filter changes
  useEffect(() => {
    {
      /* eslint-disable-next-line  */
    }
    setCursors([]);
  }, [debouncedKeyword, filter, paymentStatus, dateFrom, dateTo, channel]);

  // 1. Fetch Orders
  const queryParams = useMemo(
    () => ({
      cursor: currentCursor,
      limit: 10,
      search: debouncedKeyword,
      orderStatus: filter === "all" ? undefined : filter,
      paymentStatus: paymentStatus || undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      channel: channel || undefined,
    }),
    [
      currentCursor,
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
    nextCursor: null,
    hasNextPage: false,
  };

  const handleNext = () => {
    if (pagination.nextCursor) {
      setCursors((prev) => [...prev, pagination.nextCursor!]);
    }
  };

  const handlePrev = () => {
    setCursors((prev) => prev.slice(0, -1));
  };
  const error = queryError
    ? queryError instanceof Error
      ? queryError.message
      : "Không thể tải đơn hàng"
    : null;

  // 2. Mutations
  const updateMut = useMutation({
    mutationFn: ({ id, values }: { id: string; values: OrderFormValues }) =>
      updateOrderStatus(id, { orderStatus: values.orderStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Trạng thái đơn hàng đã được cập nhật");
    },
    onError: (err: any) => {
      toast.error(err.message || "Cập nhật đơn hàng thất bại");
    },
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Đã hủy đơn hàng thành công");
    },
    onError: (err: any) => {
      toast.error(err.message || "Hủy đơn hàng thất bại");
    },
  });

  const refundMut = useMutation({
    mutationFn: (id: string) => processRefund(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Đã xác nhận hoàn tiền thành công");
    },
    onError: (err: any) => {
      toast.error(err.message || "Xác nhận hoàn tiền thất bại");
    },
  });

  const approveReturnMut = useMutation({
    mutationFn: (id: string) => approveReturn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Đã duyệt yêu cầu trả hàng");
    },
    onError: (err: any) => {
      toast.error(err.message || "Duyệt yêu cầu thất bại");
    },
  });

  const rejectReturnMut = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      rejectReturn(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      toast.success("Đã từ chối yêu cầu trả hàng");
    },
    onError: (err: any) => {
      toast.error(err.message || "Từ chối yêu cầu thất bại");
    },
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
    cursors,
    handleNext,
    handlePrev,
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
