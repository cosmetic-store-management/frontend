import { apiClient } from "@/lib/client";
import type { CartItem } from "@/store/cart.store";

export const syncCartAPI = async (
  localItems: { variantId: string; quantity: number }[],
) => {
  return apiClient.post<any>("/cart/sync", { items: localItems });
};

export const getCartAPI = async () => {
  return apiClient.get<any>("/cart");
};

export const addCartItemAPI = async (variantId: string, quantity: number) => {
  return apiClient.post<any>("/cart/items", { variantId, quantity });
};

export const updateCartItemAPI = async (
  variantId: string,
  quantity: number,
) => {
  return apiClient.put<any>(`/cart/items/${variantId}`, {
    quantity,
  });
};

export const removeCartItemAPI = async (variantId: string) => {
  return apiClient.delete<any>(`/cart/items/${variantId}`);
};

export const clearCartAPI = async () => {
  await apiClient.delete("/cart");
};
