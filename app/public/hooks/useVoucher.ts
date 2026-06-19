import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { validateVoucher, getWalletVouchers, getPublicVouchers, collectVoucher, uncollectVoucher, getAllWalletVouchers } from "../services/voucher.service";
import { QK } from "@/lib/queryKeys";

export function usePublicVouchers() {
  return useQuery({
    queryKey: QK.publicVouchers(),
    queryFn: () => getPublicVouchers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useValidateVoucher() {
  return useMutation({
    mutationFn: ({ code, subtotal }: { code: string; subtotal: number }) => validateVoucher(code, subtotal),
  });
}

export function useGetWalletVouchers() {
  return useQuery({
    queryKey: QK.walletVouchers(),
    queryFn: () => getWalletVouchers().then(res => res.vouchers),
    staleTime: 2 * 60 * 1000,
    retry: false
  });
}

export function useAllWalletVouchers() {
  return useQuery({
    queryKey: QK.allWalletVouchers(),
    queryFn: () => getAllWalletVouchers().then(res => res.vouchers),
    staleTime: 2 * 60 * 1000,
    retry: false,
  });
}

export function useCollectVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => collectVoucher(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.walletVouchers() });
      queryClient.invalidateQueries({ queryKey: QK.allWalletVouchers() });
    },
  });
}

export function useUncollectVoucher() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => uncollectVoucher(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QK.walletVouchers() });
      queryClient.invalidateQueries({ queryKey: QK.allWalletVouchers() });
    },
  });
}
