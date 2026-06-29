import { useQuery } from "@tanstack/react-query";
import { getPublicStats, PublicStats } from "../services/setting.service";
import { QK } from "@/lib/queryKeys";

const DEFAULT_STATS: PublicStats = {
  products: 10000,
  customers: 50000,
  rating: 4.9,
};

export function usePublicStats() {
  const { data, isLoading } = useQuery({
    queryKey: ["publicStats"],
    queryFn: getPublicStats,
    staleTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
    placeholderData: DEFAULT_STATS as any,
  });

  return {
    stats: data ?? DEFAULT_STATS,
    isLoading,
  };
}
