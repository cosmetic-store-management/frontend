import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAdminVouchers,
  createAdminVoucher,
  updateAdminVoucher,
  deleteAdminVoucher,
  type VoucherPayload,
} from "@/admin/services/voucher.service";

const QUERY_KEY = ["admin-vouchers"] as const;

export const useVouchers = () =>
  useQuery({
    queryKey: QUERY_KEY,
    queryFn: getAdminVouchers,
  });

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VoucherPayload) => createAdminVoucher(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VoucherPayload> }) =>
      updateAdminVoucher(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdminVoucher(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
