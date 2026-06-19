import { useState } from "react";
import { Search, Loader2, ShieldAlert, CalendarIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuditLogs } from "../hooks/useAuditLog";
import { useAuth } from "@/auth/hooks/useAdminAuth";

export function AuditLogPage() {
  const { isOwner } = useAuth();
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: logs = [], isLoading } = useAuditLogs({
    search,
    domain: domainFilter,
    startDate,
    endDate
  });

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-surface border border-border rounded-sm shadow-ui-soft animate-page-enter">
        <div className="p-3 bg-brand-light text-brand rounded-full mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-ink">Quyền truy cập bị hạn chế</h3>
        <p className="text-sm text-ink-muted mt-2 max-w-md">
          Nhật ký hoạt động hệ thống (Audit Logs) chỉ khả dụng đối với tài khoản Chủ cửa hàng (Owner). Nhân viên không có quyền xem thông tin này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-page-enter">
      <div className="space-y-4 border border-border rounded-sm bg-surface p-4 shadow-ui-soft sm:p-5">
        <div className="space-y-4 p-0">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0 space-y-1.5 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-ink">Audit Logs — Nhật ký hệ thống</h1>
              <p className="max-w-2xl text-sm leading-6 text-ink-muted">
                Theo dõi và truy vết hoạt động cấu hình hệ thống, quản lý và bảo mật dữ liệu
              </p>
            </div>
          </div>

          {/* Filter controls */}
          <div className="flex flex-col sm:flex-row items-center gap-3 flex-wrap">
        <div className="group relative max-w-sm flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
          <Input
            placeholder="Tìm tài khoản, nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9 h-10 rounded-md bg-surface border-border focus-visible:ring-brand/20 focus-visible:border-brand"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
              title="Xóa tìm kiếm"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Select value={domainFilter} onValueChange={setDomainFilter}>
          <SelectTrigger className="w-[180px] h-10 rounded-md bg-surface border-border focus:ring-brand">
            <SelectValue placeholder="Tất cả phân vùng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phân vùng</SelectItem>
            <SelectItem value="catalog">Catalog (Sản phẩm)</SelectItem>
            <SelectItem value="inventory">Inventory (Kho hàng)</SelectItem>
            <SelectItem value="sales">Sales (Bán hàng)</SelectItem>
            <SelectItem value="identity">Identity (Bảo mật)</SelectItem>
            <SelectItem value="settings">Settings (Hệ thống)</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-[150px] h-10 rounded-md bg-surface border-border text-ink focus:ring-brand focus:border-brand cursor-pointer"
            title="Từ ngày"
          />
          <span className="text-ink-muted">-</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-[150px] h-10 rounded-md bg-surface border-border text-ink focus:ring-brand focus:border-brand cursor-pointer"
            title="Đến ngày"
          />
        </div>
      </div>
    </div>
  </div>

  {/* Logs Table */}
      <div className="bg-surface border border-border rounded-sm overflow-hidden shadow-ui-soft">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-soft/50 text-ink-muted">
              <th className="py-3 px-5 font-semibold w-[15%]">Tài khoản</th>
              <th className="py-3 px-5 font-semibold text-center w-[15%]">Thao tác</th>
              <th className="py-3 px-5 font-semibold w-[15%]">Phân vùng</th>
              <th className="py-3 px-5 font-semibold auto">Chi tiết hành động</th>
              <th className="py-3 px-5 font-semibold w-[20%]">Thời gian</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-muted">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    <span>Đang tải nhật ký hệ thống...</span>
                  </div>
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-ink-muted">
                  Không tìm thấy nhật ký hoạt động nào
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-soft/30 transition-colors">
                  <td className="py-3 px-5 font-semibold text-ink">{log.userName}</td>
                  <td className="py-3 px-5 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ["create", "add", "import"].includes(log.action.toLowerCase()) ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                      ["update", "edit", "modify"].includes(log.action.toLowerCase()) ? "bg-amber-100 text-amber-700 border-amber-200" :
                      ["delete", "remove", "destroy"].includes(log.action.toLowerCase()) ? "bg-red-100 text-red-700 border-red-200" :
                      ["login", "logout"].includes(log.action.toLowerCase()) ? "bg-blue-100 text-blue-700 border-blue-200" :
                      ["export", "download"].includes(log.action.toLowerCase()) ? "bg-indigo-100 text-indigo-700 border-indigo-200" :
                      "bg-gray-100 text-gray-700 border-gray-200"
                    } border`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-ink-muted font-semibold capitalize">{log.domain}</td>
                  <td className="py-3 px-5 font-medium text-ink break-words max-w-xs">{log.description}</td>
                  <td className="py-3 px-5 text-ink-muted text-xs font-medium">{log.timestamp}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
