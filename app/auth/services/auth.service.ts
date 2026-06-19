/**
 * auth.service.ts — API calls cho authentication.
 *
 * Sau khi login thành công → gọi useAuthStore.getState().setAuth()
 * Sau khi logout → gọi useAuthStore.getState().clearAuth()
 *
 * State management hoàn toàn do Zustand auth.store.ts đảm nhiệm.
 * Service này chỉ lo HTTP calls.
 */

import { apiClient } from "@/lib/client";
import { useAdminAuthStore, usePublicAuthStore } from "@/store";
import { useCartStore } from "@/store/cart.store";
import type { User } from "@/admin/types/user";

// ── Request / Response types ──────────────────────────────────────────────────

export interface LoginPayload {
  email?:    string;
  phone?:    string;
  password: string;
}

export interface RegisterPayload {
  name:     string;
  email:    string;
  phone:    string;
  password: string;
}

interface AuthData {
  user:          User;
  accessToken:   string;
  refreshToken:  string;
  token?:        string;  // backward compat nếu có field cũ
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function loginAdmin(payload: LoginPayload): Promise<User> {
  const data = await apiClient.post<AuthData>("/auth/admin/login", payload);
  useAdminAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
  return data.user;
}

export async function loginPublic(payload: LoginPayload): Promise<User> {
  const data = await apiClient.post<AuthData>("/auth/public/login", payload);
  usePublicAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
  return data.user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const data = await apiClient.post<AuthData>("/auth/register", payload);
  usePublicAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
  return data.user;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    useAdminAuthStore.getState().clearAuth();
    useCartStore.getState().clearCart(); // Cart isolation: không để cart của admin leak
  }
}

export async function logoutPublic(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    usePublicAuthStore.getState().clearAuth();
    useCartStore.getState().clearCart(); // Cart isolation: xóa giỏ hàng khi đăng xuất
  }
}

export async function forgotPassword(email: string): Promise<{ resetToken?: string }> {
  return apiClient.post<{ resetToken?: string }>("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await apiClient.post("/auth/reset-password", { token, newPassword });
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword:     string;
}): Promise<void> {
  await apiClient.post("/auth/change-password", payload);
}
