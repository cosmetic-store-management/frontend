import { useState, useRef } from "react";
import { Search, Loader2, ShieldAlert, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuditLogs } from "../hooks/useAuditLog";
import { useAuth } from "@/auth/hooks/useAdminAuth";
import { PageHeader } from "../components/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function AuditLogPage() {
  const { isOwner } = useAuth();
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const [cursors, setCursors] = useState<string[]>([]);
  const currentCursor = cursors[cursors.length - 1] || undefined;

  const { data, isLoading } = useAuditLogs({
    search,
    domain: domainFilter,
    startDate,
    endDate,
    cursor: currentCursor,
    limit: 20,
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination;

  const handleNext = () => {
    if (pagination?.nextCursor) setCursors((prev) => [...prev, pagination.nextCursor!]);
  };
  const handlePrev = () => setCursors((prev) => prev.slice(0, -1));

  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-surface border border-border rounded-sm shadow-ui-soft animate-page-enter">
        <div className="p-3 bg-brand-light text-brand rounded-full mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-ink">
          Quyền truy cập bị hạn chế
        </h3>
        <p className="text-sm text-ink-muted mt-2 max-w-md">
          Nhật ký hoạt động hệ thống (Audit Logs) chỉ khả dụng đối với tài khoản
          Chủ cửa hàng (Owner). Nhân viên không có quyền xem thông tin này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-page-enter">
      <PageHeader
        title="Nhật ký hệ thống"
        description="Theo dõi và truy vết hoạt động cấu hình hệ thống, quản lý và bảo mật dữ liệu"
        filters={
          <div className="flex flex-col xl:flex-row items-start xl:items-center gap-3 w-full flex-wrap">
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
              <SelectTrigger className="w-fit px-3 h-10 rounded-sm bg-surface border-border focus:ring-brand">
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
              <div
                className="relative group cursor-pointer flex-1"
                onClick={() => {
                  try {
                    if (startDateRef.current && 'showPicker' in HTMLInputElement.prototype) {
                      startDateRef.current.showPicker();
                    }
                  } catch (err) {}
                }}
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-hover:text-brand pointer-events-none" />
                <Input
                  ref={startDateRef}
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-[150px] pl-9 h-10 rounded-md bg-surface border-border text-ink-muted focus:ring-brand focus:border-brand cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                  title="Từ ngày"
                />
              </div>
              <span className="text-ink-muted">-</span>
              <div
                className="relative group cursor-pointer flex-1"
                onClick={() => {
                  try {
                    if (endDateRef.current && 'showPicker' in HTMLInputElement.prototype) {
                      endDateRef.current.showPicker();
                    }
                  } catch (err) {}
                }}
              >
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted group-hover:text-brand pointer-events-none" />
                <Input
                  ref={endDateRef}
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-[150px] pl-9 h-10 rounded-md bg-surface border-border text-ink-muted focus:ring-brand focus:border-brand cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                  title="Đến ngày"
                />
              </div>
            </div>

          </div>
        }
      />

      {/* Logs Table */}
      <div className="premium-card rounded-sm overflow-hidden">
        <Table className="min-w-[800px] table-fixed">
          <TableHeader>
            <TableRow className="bg-surface-muted text-left border-b border-border">
              <TableHead className="w-[15%] text-ink-muted font-medium">
                Tài khoản
              </TableHead>
              <TableHead className="text-center w-[15%] text-ink-muted font-medium">
                Thao tác
              </TableHead>
              <TableHead className="text-center w-[15%] text-ink-muted font-medium">
                Phân vùng
              </TableHead>
              <TableHead className="w-[40%] text-ink-muted font-medium">
                Nội dung chi tiết
              </TableHead>
              <TableHead className="w-[15%] text-ink-muted font-medium">
                Thời gian
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-ink-muted">
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    <span>Đang tải nhật ký hệ thống...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-ink-muted">
                  Không tìm thấy nhật ký hoạt động nào
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow
                  key={log.id}
                >
                  <TableCell className="font-medium text-ink-muted">
                    {log.userName}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase ${["create", "add", "import"].includes(
                        log.action.toLowerCase(),
                      )
                          ? "bg-emerald-100 text-emerald-700"
                          : ["update", "edit", "modify"].includes(
                            log.action.toLowerCase(),
                          )
                            ? "bg-amber-100 text-amber-700"
                            : ["delete", "remove", "destroy"].includes(
                              log.action.toLowerCase(),
                            )
                              ? "bg-red-100 text-red-700"
                              : ["login", "logout"].includes(
                                log.action.toLowerCase(),
                              )
                                ? "bg-blue-100 text-blue-700"
                                : ["export", "download"].includes(
                                  log.action.toLowerCase(),
                                )
                                  ? "bg-indigo-100 text-indigo-700"
                                  : "bg-gray-100 text-gray-700"
                        }`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell className="text-ink-muted font-medium capitalize text-center">
                    {log.domain}
                  </TableCell>
                  <TableCell className="font-medium text-ink-muted break-words max-w-xs">
                    {log.description}
                  </TableCell>
                  <TableCell className="text-ink-muted text-xs font-medium">
                    {log.timestamp}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {(cursors.length > 0 || pagination?.hasNextPage) && (
        <div className="flex items-center justify-between p-5 bg-surface border border-border rounded-sm">
          <div className="text-sm text-ink-muted font-medium">
            Trang {cursors.length + 1}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm h-9 px-4 font-medium"
              onClick={handlePrev}
              disabled={cursors.length === 0}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-sm h-9 px-4 font-medium"
              onClick={handleNext}
              disabled={!pagination?.hasNextPage}
            >
              Sau
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
