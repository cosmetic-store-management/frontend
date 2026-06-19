import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePublicAuthStore } from "@/store";
import { loginPublic, type LoginPayload, register, type RegisterPayload, logoutPublic, changePassword, forgotPassword, resetPassword } from "@/auth/services/auth.service";

export const useAuth = () => {
  const store = usePublicAuthStore();
  return {
    user: store.user,
    isLoggedIn: store.isAuthenticated,
    logout: store.clearAuth
  };
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginPublic(payload),
    onSuccess: () => {
      // Xóa cache của user cũ để tránh data cũ hiển thị cho user mới
      queryClient.clear();
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: () => {
      queryClient.clear();
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => logoutPublic(),
    onSuccess: () => {
      // Clear toàn bộ cache khi đăng xuất
      queryClient.clear();
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (payload: { currentPassword: string; newPassword: string }) => 
      changePassword(payload),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (phone: string) => 
      forgotPassword(phone),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) => 
      resetPassword(payload.token, payload.newPassword),
  });
};
