import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/admin/services/audit-log.service";

export function useAuditLogs(params: { search?: string; domain?: string; startDate?: string; endDate?: string }) {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: () => getAuditLogs(params),
    refetchInterval: 10000, // refresh logs every 10 seconds
  });
}
