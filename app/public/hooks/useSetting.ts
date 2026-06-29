import { useQuery } from "@tanstack/react-query";
import {
  getSettings,
  ShopSettings,
  getStats,
  Stats,
} from "../services/setting.service";
import { QK } from "@/lib/queryKeys";

const EMPTY_SETTINGS = {
  storeName: "",
  email: "",
  phone: "",
  storeAddress: "",
  currency: "VND",
  isCodActive: false,
  isBankActive: false,
  isQrActive: false,
  bankName: "",
  bankAccountNumber: "",
  bankAccountName: "",
} as ShopSettings;

export function useSetting() {
  const { data, isLoading } = useQuery({
    queryKey: QK.settings(),
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000, // 10 phút
    retry: 1,
    placeholderData: EMPTY_SETTINGS,
  });

  return {
    settings: data ?? EMPTY_SETTINGS,
    isLoading,
  };
}

const EMPTY_STATS = {
  products: 0,
  customers: 0,
  rating: 0,
} as Stats;

export function useStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["publicStats"],
    queryFn: getStats,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    placeholderData: EMPTY_STATS,
  });

  return {
    stats: data ?? EMPTY_STATS,
    isLoading,
  };
}
