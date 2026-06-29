import { apiClient } from "@/lib/client";

export interface UpdateAccountPayload {
  name?: string;
  phone?: string;
  dob?: string;
  gender?: "male" | "female" | "other";
}

export interface AddressPayload {
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault?: boolean;
}

export function getMyAccount() {
  return apiClient.get<{ user: any }>("/auth/me").then((d) => d.user);
}

export function updateMyAccount(payload: UpdateAccountPayload) {
  return apiClient.patch<{ message: string; user: any }>("/users/me", payload);
}

export function updateMyAvatar(avatarDataUrl: string) {
  return apiClient.patch<{ message: string; user: any }>("/users/me/avatar", {
    avatar: avatarDataUrl,
  });
}

export function addMyAddress(payload: AddressPayload) {
  return apiClient.post<{ message: string; user: any }>(
    "/users/me/addresses",
    payload,
  );
}

export function updateMyAddress(addressId: string, payload: AddressPayload) {
  return apiClient.put<{ message: string; user: any }>(
    `/users/me/addresses/${addressId}`,
    payload,
  );
}

export function deleteMyAddress(addressId: string) {
  return apiClient.delete<{ message: string; user: any }>(
    `/users/me/addresses/${addressId}`,
  );
}

export function getFavorites() {
  return apiClient.get<{ products: any[] }>("/users/me/favorites");
}

export function toggleFavorite(productId: string) {
  return apiClient.post<{ action: "added" | "removed" }>(
    `/users/me/favorites/${productId}`,
  );
}

export interface ViewedResponse {
  products: any[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getRecentlyViewed(page = 1, limit = 12) {
  return apiClient.get<ViewedResponse>(
    `/users/me/viewed?page=${page}&limit=${limit}`,
  );
}

export function recordRecentlyViewed(productId: string) {
  return apiClient.post<{ message: string }>(`/users/me/viewed/${productId}`);
}

export function clearRecentlyViewed() {
  return apiClient.delete<{ message: string }>("/users/me/viewed");
}

export function removeRecentlyViewed(productId: string) {
  return apiClient.delete<{ message: string }>(`/users/me/viewed/${productId}`);
}

export interface TierInfo {
  tier: "member" | "silver" | "gold" | "diamond";
  tierLabel: string;
  tierLabelEn: string;
  tierColor: string;
  tierBadgeClass: string;
  discount: number;
  discountPercent: number;
  totalSpent: number;
  orderCount: number;
  nextTier: string | null;
  nextTierLabel: string | null;
  spentToNext: number | null;
  progressPercent: number;
  tiers: {
    key: string;
    label: string;
    minSpent: number;
    discount: number;
    isCurrent: boolean;
  }[];
}

export function getMyTierInfo() {
  return apiClient.get<TierInfo>("/users/me/tier-info");
}
