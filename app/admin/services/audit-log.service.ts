import { apiClient } from "@/lib/client";

export interface AuditLogItem {
  id: string;
  userName: string;
  action:
    | "create"
    | "update"
    | "delete"
    | "login"
    | "logout"
    | "import"
    | "checkout"
    | "export";
  domain: string;
  description: string;
  ipAddress: string;
  timestamp: string;
}

export function getAuditLogs(params?: {
  search?: string;
  domain?: string;
  startDate?: string;
  endDate?: string;
  cursor?: string;
  limit?: number;
}): Promise<{ logs: AuditLogItem[], pagination: any }> {
  return apiClient
    .get<{ logs: AuditLogItem[], pagination: any }>("/audit-logs", params as Record<string, string>)
    .then((res) => res);
}
