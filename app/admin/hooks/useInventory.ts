import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStockList,
  getTransactions,
  getSuppliers,
  createSupplier,
  createGoodsReceipt,
  adjustStock,
  updateMinStock,
  updateBatch,
} from "@/admin/services/inventory.service";
import { handleMutationError } from "@/lib/api-helper";

export function useInventoryStock(
  params: { search?: string; page?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["stock", params],
    queryFn: () => getStockList(params),
  });
}

export function useInventoryTransactions(params: {
  page?: number;
  limit: number;
  type?: string;
}) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => getTransactions(params),
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err) => handleMutationError(err, "Failed to create supplier"),
  });
}

export function useRestock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoodsReceipt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["pos-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
    onError: (err) => handleMutationError(err, "Failed to restock"),
  });
}

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: adjustStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["pos-products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
    onError: (err) => handleMutationError(err, "Failed to adjust stock"),
  });
}

export function useUpdateMinStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateMinStock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
    onError: (err) => handleMutationError(err, "Failed to update min stock"),
  });
}

export function useUpdateBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateBatch(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock"] });
    },
    onError: (err) => handleMutationError(err, "Failed to update batch"),
  });
}
