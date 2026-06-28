/**
 * useAuth — Hook truy cập trạng thái đăng nhập và các mutation liên quan đến auth.
 *
 * State management do Zustand auth.store quản lý.
 * Mutation states (loading, error, success) do React Query quản lý.
 */

import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminAuthStore } from "@/store";
import { toast } from "@/lib/toast";
import {
  loginAdmin,
  register as apiRegister,
  logoutAdmin,
  forgotPassword,
  resetPassword,
  changePassword,
  type LoginPayload,
  type RegisterPayload,
} from "@/auth/services/auth.service";

// ── Hook truy cập trạng thái Auth ────────────────────────────────────────────────

export function useAuth() {
  const { user, isAuthenticated, isAdmin, isOwner, isManager, clearAuth } =
    useAdminAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    queryClient.clear(); // Clear admin RQ cache before navigating away
    await logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  const handleSessionExpired = () => {
    clearAuth();
    toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
    navigate("/admin/login", { replace: true });
  };

  return {
    user,
    isLoggedIn: isAuthenticated,
    isAdmin,
    isOwner,
    isManager,
    handleLogout,
    handleSessionExpired,
  };
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginAdmin(payload),
    onSuccess: () => {
      queryClient.clear(); // Clear stale cache from previous admin session
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterPayload) => apiRegister(payload),
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => forgotPassword(email),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => resetPassword(token, newPassword),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) =>
      changePassword(payload),
  });
}
