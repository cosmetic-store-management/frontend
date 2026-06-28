import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGeneralSettings,
  saveGeneralSettings,
} from "@/admin/services/setting.service";
import { updateProfile } from "@/admin/services/user.service";
import { useAdminAuthStore } from "@/store";

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

export function useUpdateProfile() {
  const { setAuth, token, refreshToken, user } = useAdminAuthStore();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (updatedUser) => {
      // Update the user state in auth store while keeping the tokens
      if (token && refreshToken && user) {
        setAuth(updatedUser, token, refreshToken);
      }
    },
  });
}
