import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGeneralSettings,
  saveGeneralSettings,
} from "@/admin/services/setting.service";
import { updateAccount } from "@/admin/services/user.service";
import { useAuthStore } from "@/auth/store/auth.store";

import { QK } from "@/lib/queryKeys";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getGeneralSettings,
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveGeneralSettings,
    onSuccess: (settings) => {
      queryClient.setQueryData(["settings"], settings);
      queryClient.invalidateQueries({ queryKey: QK.settings() });
    },
  });
}

export function useDownloadBackup() {
  return useMutation({
    mutationFn: async () => {
      return new Promise((resolve) => setTimeout(resolve, 1000));
    },
  });
}

export function useUpdateAccount() {
  const { setAuth, token, refreshToken, user } = useAuthStore();
  return useMutation({
    mutationFn: updateAccount,
    onSuccess: (updatedUser) => {
      // Update the user state in auth store while keeping the tokens
      if (token && refreshToken && user) {
        setAuth(updatedUser, token, refreshToken);
      }
    },
  });
}
