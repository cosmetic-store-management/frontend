import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createOrder,
  getMyOrders,
  previewOrder,
  cancelMyOrder,
  requestReturnOrder,
  trackOrder,
  cancelCheckout,
  createStripeIntent,
  type CreateOrderPayload,
  type PreviewOrderPayload,
} from "../services/order.service";
import { handleMutationError } from "@/lib/api-helper";
import { QK } from "@/lib/queryKeys";

export function useMyOrders() {
  return useQuery({
    queryKey: QK.myOrders(),
    queryFn: () => getMyOrders(),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.myOrders() });
    },
  });
}

export function useOrderPreview() {
  return useMutation({
    mutationFn: (payload: PreviewOrderPayload) => previewOrder(payload),
  });
}

export function useCancelMyOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => cancelMyOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.myOrders() });
    },
  });
}

export function useRequestReturnOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderId,
      reason,
      images,
    }: {
      orderId: string;
      reason: string;
      images?: string[];
    }) => requestReturnOrder(orderId, reason, images),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.myOrders() });
    },
    onError: (err) => handleMutationError(err, "Failed to request return"),
  });
}

export function useOrderTrack(code: string, paymentMethod: string) {
  return useQuery({
    queryKey: ["order-track", code],
    queryFn: () => trackOrder(code),
    refetchInterval: (query) => {
      // @ts-ignore
      return query.state.data?.paymentStatus === "paid" ? false : 3000;
    },
    enabled:
      ["bank", "qr", "transfer", "stripe"].includes(paymentMethod) && !!code,
  });
}

export function useCancelCheckout() {
  return useMutation({
    mutationFn: (code: string) => cancelCheckout(code),
    onError: (err) => handleMutationError(err, "Failed to cancel checkout"),
  });
}

export function useCreateStripeIntent() {
  return useMutation({
    mutationFn: (orderId: string) => createStripeIntent(orderId),
    onError: (err) =>
      handleMutationError(err, "Failed to create payment intent"),
  });
}
