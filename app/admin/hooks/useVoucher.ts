import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import type { Voucher } from "@/admin/types/voucher";

export const useVouchers = () => {
  return useQuery({
    queryKey: ["admin-vouchers"],
    queryFn: async () => {
      const res = await apiClient.get<{ vouchers: Voucher[] }>("/vouchers/admin");
      return res.vouchers;
    },
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post<{ voucher: Voucher }>("/vouchers/admin", data);
      return res.voucher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    },
  });
};

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await apiClient.put<{ voucher: Voucher }>(`/vouchers/admin/${id}`, data);
      return res.voucher;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    },
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/vouchers/admin/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vouchers"] });
    },
  });
};
