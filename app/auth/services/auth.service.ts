import { apiClient } from "@/lib/client";
import { useAuthStore } from "@/auth/store/auth.store";
import { useCartStore } from "@/public/store/cart.store";
import type { User } from "@/auth/types/user";

export interface LoginPayload {
  email?: string;
  phone?: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
  token?: string; // backward compat nếu có field cũ
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<User> {
  const data = await apiClient.post<AuthData>("/auth/login", payload);
  useAuthStore
    .getState()
    .setAuth(data.user, data.accessToken, data.refreshToken);
  return data.user;
}

export async function register(payload: RegisterPayload): Promise<User> {
  const data = await apiClient.post<AuthData>("/auth/register", payload);
  useAuthStore
    .getState()
    .setAuth(
      data.user,
      data.accessToken,
      useAuthStore.getState().refreshToken || "",
    );
  return data.user;
}

export async function logoutAdmin(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (error) {
    useAuthStore.getState().clearAuth();
    throw error;
  } finally {
    useAuthStore.getState().clearAuth();
    useCartStore.getState().clearCart(); // Cart isolation: không để cart của admin leak
  }
}

export async function logoutPublic(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } finally {
    useAuthStore.getState().clearAuth();
    useCartStore.getState().clearCart(); // Cart isolation: xóa giỏ hàng khi đăng xuất
  }
}

export async function forgotPassword(
  email: string,
): Promise<{ resetToken?: string }> {
  return apiClient.post<{ resetToken?: string }>("/auth/forgot-password", {
    email,
  });
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<void> {
  await apiClient.post("/auth/reset-password", { token, newPassword });
}

export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.post("/auth/change-password", payload);
}

export async function sendOtp(email: string): Promise<void> {
  await apiClient.post("/auth/public/send-otp", { email });
}

export async function verifyOtp(email: string, otpCode: string): Promise<void> {
  await apiClient.post("/auth/public/verify-otp", { email, otpCode });
}
