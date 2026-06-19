/**
 * data-table.tsx — Generic DataTable component có thể tái dụng.
 * Thay thế các Table inline trong admin pages.
 *
 * Usage:
 *   <DataTable
 *     columns={[
 *       { key: "name", header: "Tên", render: (row) => row.name },
 *       { key: "status", header: "Trạng thái", align: "center" },
 *     ]}
 *     data={customers}
 *     isLoading={isLoading}
 *     emptyMessage="Không tìm thấy khách hàng nào."
 *     keyExtractor={(row) => row.id}
 *   />
 */
import React from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { TableBodySkeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Align = "left" | "center" | "right";

export interface DataTableColumn<T> {
  key:      string;
  header:   React.ReactNode;
  align?:   Align;
  width?:   string;
  /** Nếu không có render, tự dùng row[key] */
  render?:  (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T> {
  columns:         DataTableColumn<T>[];
  data:            T[];
  isLoading?:      boolean;
  emptyMessage?:   React.ReactNode;
  keyExtractor?:   (row: T, index: number) => string | number;
  /** Callback khi click một row */
  onRowClick?:     (row: T) => void;
  /** CSS className cho outer wrapper */
  className?:      string;
  /** Số cột skeleton rows khi isLoading */
  skeletonRows?:   number;
  /** Min width cho scroll ngang */
  minWidth?:       string;
}

const alignClass: Record<Align, string> = {
  left:   "text-left",
  center: "text-center",
  right:  "text-right",
};

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Không có dữ liệu.",
  keyExtractor,
  onRowClick,
  className,
  skeletonRows = 6,
  minWidth = "600px",
}: DataTableProps<T>) {
  return (
    <div className={cn("border border-border rounded-sm bg-surface shadow-ui-soft overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <Table style={{ minWidth }}>
          <TableHeader>
            <TableRow className="bg-bg/50 border-b border-border">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "px-5 py-4 text-xs font-semibold uppercase tracking-wider text-ink-muted",
                    alignClass[col.align ?? "left"],
                    col.width
                  )}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableBodySkeleton rows={skeletonRows} cols={columns.length} />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-ink-muted">
                    <span className="text-3xl">🔍</span>
                    <p className="text-sm">{emptyMessage}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const key = keyExtractor ? keyExtractor(row, index) : index;
                return (
                  <TableRow
                    key={key}
                    className={cn(
                      "transition-colors border-b border-border last:border-0",
                      onRowClick && "cursor-pointer hover:bg-bg/40"
                    )}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                    style={{ "--i": index } as React.CSSProperties}
                  >
                    {columns.map((col) => (
                      <TableCell
                        key={col.key}
                        className={cn("px-5 py-4 align-middle", alignClass[col.align ?? "left"])}
                      >
                        {col.render
                          ? col.render(row, index)
                          : String((row as any)[col.key] ?? "—")}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── DataTablePagination helper ────────────────────────────────────────────────

interface PaginationProps {
  page:        number;
  totalPages:  number;
  totalItems?: number;
  limit?:      number;
  onChange:    (page: number) => void;
  isLoading?:  boolean;
}

export function DataTablePagination({
  page,
  totalPages,
  totalItems,
  limit,
  onChange,
  isLoading,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = ((page - 1) * (limit ?? 10)) + 1;
  const end   = Math.min(page * (limit ?? 10), totalItems ?? 0);

  return (
    <div className="flex items-center justify-between px-5 py-4 bg-surface border-t border-border">
      <div className="text-sm text-ink-muted font-medium">
        {totalItems != null
          ? `Hiển thị ${start}–${end} trong ${totalItems.toLocaleString()} kết quả`
          : `Trang ${page} / ${totalPages}`}
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(1)}
          disabled={page === 1 || isLoading}
          className="h-8 w-8 rounded-sm border border-border text-xs font-semibold text-ink-muted disabled:opacity-40 hover:bg-surface-muted transition-colors"
          title="Trang đầu"
        >
          «
        </button>
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1 || isLoading}
          className="h-8 px-3 rounded-sm border border-border text-sm font-medium text-ink-muted disabled:opacity-40 hover:bg-surface-muted transition-colors"
        >
          Trước
        </button>

        {/* Page numbers — hiển thị tối đa 5 trang */}
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          let p: number;
          if (totalPages <= 5) {
            p = i + 1;
          } else if (page <= 3) {
            p = i + 1;
          } else if (page >= totalPages - 2) {
            p = totalPages - 4 + i;
          } else {
            p = page - 2 + i;
          }
          return (
            <button
              key={p}
              onClick={() => onChange(p)}
              disabled={isLoading}
              className={cn(
                "h-8 w-8 rounded-sm border text-sm font-medium transition-colors",
                p === page
                  ? "bg-brand text-white border-brand"
                  : "border-border text-ink-muted hover:bg-surface-muted"
              )}
            >
              {isLoading && p === page ? <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" /> : p}
            </button>
          );
        })}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages || isLoading}
          className="h-8 px-3 rounded-sm border border-border text-sm font-medium text-ink-muted disabled:opacity-40 hover:bg-surface-muted transition-colors"
        >
          Sau
        </button>
        <button
          onClick={() => onChange(totalPages)}
          disabled={page === totalPages || isLoading}
          className="h-8 w-8 rounded-sm border border-border text-xs font-semibold text-ink-muted disabled:opacity-40 hover:bg-surface-muted transition-colors"
          title="Trang cuối"
        >
          »
        </button>
      </div>
    </div>
  );
}
