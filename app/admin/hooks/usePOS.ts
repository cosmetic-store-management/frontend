import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPOSOrder } from "@/admin/services/order.service";
import { getAdminProducts } from "@/admin/services/product.service";

export function usePOSProducts(search?: string) {
  return useQuery({
    queryKey: ["pos-products", search],
    queryFn: () => getAdminProducts({ search, status: "active", limit: 100 }),
  });
}

export function usePOSCheckout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createPOSOrder,
    onSuccess: () => {
      // Invalidate stock and transactions so inventory remains accurate
      queryClient.invalidateQueries({ queryKey: ["stock"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-data"] });
    },
  });
}
