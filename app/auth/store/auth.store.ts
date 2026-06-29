import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User } from "@/auth/types/user";

interface AuthState {
  user: User | null;
  token: string | null; // access token (ngắn hạn)
  refreshToken: string | null; // refresh token (dài hạn)
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isManager: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isAdmin: false,
      isOwner: false,
      isManager: false,

      setAuth: (user, accessToken, refreshToken) => {
        const isAdmin = ["owner", "manager", "staff"].includes(user.role);
        set({
          user,
          token: accessToken,
          refreshToken,
          isAuthenticated: true,
          isAdmin,
          isOwner: user.role === "owner",
          isManager: user.role === "manager",
        });
      },

      setAccessToken: (token) => set({ token }),

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isAdmin: false,
          isOwner: false,
          isManager: false,
        });
      },
    }),
    {
      name: "glowup_auth", // Unified storage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
