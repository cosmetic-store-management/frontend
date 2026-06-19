import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import { QK } from "@/lib/queryKeys";

export interface PublicSettings {
  storeName: string;
  currency: string;
  isCodActive: boolean;
  isBankActive: boolean;
  isQrActive: boolean;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  standardShippingFee?: number;
  freeShippingThreshold?: number;
}

export function usePublicSettings() {
  return useQuery<PublicSettings>({
    queryKey: QK.settings(),
    queryFn: () =>
      apiClient.get<{ settings: PublicSettings }>("/settings").then(r => r.settings),
    staleTime: 5 * 60 * 1000, // 5 phút — settings hiếm khi thay đổi
  });
}
