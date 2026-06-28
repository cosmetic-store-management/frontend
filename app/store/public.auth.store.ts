import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/admin/types/user"; // Re-use the same user type, or a public user type if distinct

interface PublicAuthState {
  user: User | null;
  token: string | null; // access token (ngắn hạn)
  refreshToken: string | null; // refresh token (dài hạn)
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const usePublicAuthStore = create<PublicAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        set({
          user,
          token: accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      setAccessToken: (token) => set({ token }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "glowup_public_auth", // Lưu ở key riêng cho Public
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
