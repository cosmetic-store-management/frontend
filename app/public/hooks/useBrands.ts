import { useQuery } from "@tanstack/react-query";
import { getPublicBrands } from "../services/brand.service";
import { QK } from "@/lib/queryKeys";

export function usePublicBrands() {
  return useQuery({
    queryKey: QK.brands(),
    queryFn: getPublicBrands,
  });
}
