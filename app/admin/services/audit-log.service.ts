import { apiClient } from "@/lib/client";

export interface AuditLogItem {
  id: string;
  userName: string;
  action: "create" | "update" | "delete" | "login" | "logout" | "import" | "checkout" | "export";
  domain: string;
  description: string;
  ipAddress: string;
  timestamp: string;
}

export function getAuditLogs(params?: { search?: string; domain?: string; startDate?: string; endDate?: string }): Promise<AuditLogItem[]> {
  return apiClient.get<{ logs: AuditLogItem[] }>("/audit-logs", params)
    .then((res) => res.logs);
}
