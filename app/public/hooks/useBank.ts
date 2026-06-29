import { useQuery } from "@tanstack/react-query";
import { fetchBanks } from "../services/bank.service";

export function useBanks() {
  return useQuery({
    queryKey: ["public", "banks"],
    queryFn: fetchBanks,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
}
