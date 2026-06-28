import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getStockList,
  getTransactions,
  getSuppliers,
  createSupplier,
  createGoodsReceipt,
  adjustStock,
  updateMinStock,
} from "@/admin/services/inventory.service";

export function useInventoryStock(
  params: { search?: string; cursor?: string; limit?: number } = {},
) {
  return useQuery({
    queryKey: ["stock", params],
    queryFn: () => getStockList(params),
  });
}

export function useInventoryTransactions(params: {
  cursor?: string;
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
  });
}
