import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createOrder, getMyOrders, previewOrder, cancelMyOrder, type CreateOrderPayload, type PreviewOrderPayload } from "../services/order.service";
import { toast } from "@/lib/toast";
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

