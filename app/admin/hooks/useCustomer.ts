import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCustomers,
  createCustomer,
  deleteUser,
  updateStatus,
  updateCustomer,
  updateInternalNotes,
  adjustPoints,
} from "@/admin/services/user.service";
import { fetchOrders } from "@/admin/services/order.service";
import { handleMutationError } from "@/lib/api-helper";

export function useCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  tier?: string;
  status?: string;
  spending?: string;
  lastPurchase?: string;
  sortBy?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => getCustomers(params),
  });
}

export function useCustomerOrders(userId: string) {
  return useQuery({
    queryKey: ["admin", "customerOrders", userId],
    queryFn: () => fetchOrders({ userId, limit: 100 } as any),
    enabled: !!userId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
    onError: (err) => handleMutationError(err, "Failed to delete customer"),
  });
}

export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      updateStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => handleMutationError(err, "Failed to update status"),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateCustomer>[1];
    }) => updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useUpdateInternalNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      internalNotes,
    }: {
      id: string;
      internalNotes: string;
    }) => updateInternalNotes(id, internalNotes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}

export function useAdjustPoints() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      pointsChanged,
      reason,
    }: {
      id: string;
      pointsChanged: number;
      reason: string;
    }) => adjustPoints(id, pointsChanged, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
}
