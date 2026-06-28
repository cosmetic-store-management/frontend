import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePublicAuthStore } from "@/store";
import { useCartStore } from "@/store/cart.store";
import { syncCartAPI } from "@/public/services/cart.service";
import {
  loginPublic,
  type LoginPayload,
  register,
  type RegisterPayload,
  logoutPublic,
  changePassword,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
} from "@/auth/services/auth.service";
import { getMyProfile } from "@/public/services/user.service";

export const useAuth = () => {
  const store = usePublicAuthStore();
  return {
    user: store.user,
    isLoggedIn: store.isAuthenticated,
    logout: store.clearAuth,
  };
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { items, setItems } = useCartStore();

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginPublic(payload),
    onSuccess: async () => {
      // Xóa cache của user cũ để tránh data cũ hiển thị cho user mới
      queryClient.clear();

      try {
        // Sync cart
        const localItems = items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        }));
        const serverCart = await syncCartAPI(localItems);
        // Map server cart to local cart
        const mappedItems = serverCart.items.map((item: any) => ({
          productId: item.variantId.productId._id,
          variantId: item.variantId._id,
          name: item.variantId.productId.name,
          variantName: item.variantId.name,
          price: item.variantId.price,
          quantity: item.quantity,
          imageUrl:
            item.variantId.imageUrl || item.variantId.productId.imageUrl,
          stock: item.variantId.stock,
          slug: item.variantId.productId.slug,
        }));
        setItems(mappedItems);
      } catch (err) {
        console.error("Failed to sync cart", err);
      }
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  const { items, setItems } = useCartStore();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => register(payload),
    onSuccess: async () => {
      queryClient.clear();

      try {
        // Sync cart
        const localItems = items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        }));
        const serverCart = await syncCartAPI(localItems);
        const mappedItems = serverCart.items.map((item: any) => ({
          productId: item.variantId.productId._id,
          variantId: item.variantId._id,
          name: item.variantId.productId.name,
          variantName: item.variantId.name,
          price: item.variantId.price,
          quantity: item.quantity,
          imageUrl:
            item.variantId.imageUrl || item.variantId.productId.imageUrl,
          stock: item.variantId.stock,
          slug: item.variantId.productId.slug,
        }));
        setItems(mappedItems);
      } catch (err) {
        console.error("Failed to sync cart", err);
      }
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
    mutationFn: (phone: string) => forgotPassword(phone),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (payload: { token: string; newPassword: string }) =>
      resetPassword(payload.token, payload.newPassword),
  });
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: (email: string) => sendOtp(email),
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: (payload: { email: string; otpCode: string }) =>
      verifyOtp(payload.email, payload.otpCode),
  });
};

export const useSocialLogin = () => {
  const queryClient = useQueryClient();
  const { items, setItems } = useCartStore();
  const { setAuth, setAccessToken } = usePublicAuthStore();

  return useMutation({
    mutationFn: async ({
      token,
      refreshToken,
    }: {
      token: string;
      refreshToken: string;
    }) => {
      setAccessToken(token); // Set token so apiClient uses it
      const user = await getMyProfile();
      return { user, token, refreshToken };
    },
    onSuccess: async ({ user, token, refreshToken }) => {
      queryClient.clear();
      setAuth(user, token, refreshToken);
      try {
        const localItems = items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        }));
        const serverCart = await syncCartAPI(localItems);
        const mappedItems = serverCart.items.map((item: any) => ({
          productId: item.variantId.productId._id,
          variantId: item.variantId._id,
          name: item.variantId.productId.name,
          variantName: item.variantId.name,
          price: item.variantId.price,
          quantity: item.quantity,
          imageUrl:
            item.variantId.imageUrl || item.variantId.productId.imageUrl,
          stock: item.variantId.stock,
          slug: item.variantId.productId.slug,
        }));
        setItems(mappedItems);
      } catch (err) {
        console.error("Failed to sync cart", err);
      }
    },
  });
};
