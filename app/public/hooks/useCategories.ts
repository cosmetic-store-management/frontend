import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../services/category.service";
import { QK } from "@/lib/queryKeys";

export function useCategories() {
  return useQuery({
    queryKey: QK.categories(),
    queryFn: () => getCategories(),
  });
}
