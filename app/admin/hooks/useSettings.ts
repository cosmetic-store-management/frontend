import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGeneralSettings, saveGeneralSettings, triggerBackup } from "@/admin/services/setting.service";

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
      const blob = await triggerBackup();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "glowup_db_backup.json";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
  });
}
