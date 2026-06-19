import { Search, Edit, Ban, X } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useOrders } from "../hooks/useOrders";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import DeleteModal from "@/components/ui/delete-modal";
import { Pagination } from "@/components/ui/pagination";
import OrderDetail, { formatVnd } from "../components/OrderDetail";
import { orderStatusMeta } from "../types/order-meta";
import OrderModal from "../components/OrderModal";
import type { Order, OrderStatus } from "@/admin/types/order";
import type { OrderFormValues } from "../components/OrderModal";
import type { FilterKey } from "../hooks/useOrders";
import { exportToCSV } from "@/lib/utils";

const STATUS_TABS: { key: FilterKey | "processing" | "returned"; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Hoàn tất" },
  { key: "returned", label: "Trả hàng" },
  { key: "cancelled", label: "Đã hủy" },
];

function fmtDate(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString("vi-VN");
}

type ModalState =
  | { type: "none" }
  | { type: "edit"; order: Order }
  | { type: "cancel"; order: Order }
  | { type: "detail"; order: Order };

export function OrderPage() {
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  // Convert DateRange → YYYY-MM-DD strings for the API
  const dateFrom = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const dateTo   = dateRange?.to   ? format(dateRange.to,   "yyyy-MM-dd") : "";

  const {
    orders,
    pagination,
    currentPage,
    setCurrentPage,
    loading,
    error,
    submitting,
    submitEdit,
    submitCancel,
    clearError,
  } = useOrders(keyword, filter, paymentFilter, dateFrom, dateTo);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const closeModal = () => { setModal({ type: "none" }); clearError(); };

  const handleEditSubmit = async (values: OrderFormValues) => {
    if (modal.type !== "edit") return;
    const success = await submitEdit(modal.order.id, values);
    if (success) closeModal();
  };

  const handleCancelSubmit = async () => {
    if (modal.type !== "cancel") return;
    const success = await submitCancel(modal.order.id);
    if (success) closeModal();
  };

  // ── Derived Component State ──────────────────────────────────────────────

  return (
    <section className="space-y-4 animate-page-enter">
      <div className="space-y-4 border border-border rounded-sm bg-surface p-4 shadow-ui-soft sm:p-5">
        <CardHeader className="space-y-4 p-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-1.5 flex-1">
              <CardTitle className="text-2xl font-bold tracking-tight text-ink">
                Quản lý đơn hàng
              </CardTitle>
              <CardDescription className="max-w-2xl text-sm leading-6 text-ink-muted">
                Theo dõi thông tin đơn hàng, khách hàng, tổng tiền và trạng thái xử lý.
              </CardDescription>
            </div>
            <button
              onClick={() => {
                {
                  const data = orders.map(o => ({
                    code: o.code,
                    customer: o.receiverName,
                    phone: o.phone || "-",
                    date: fmtDate(o.createdAt),
                    status: o.orderStatus,
                    total: o.totalAmount,
                    payment: o.paymentMethod
                  }));
                  exportToCSV(data, [
                    { key: "code", label: "Mã Đơn" },
                    { key: "customer", label: "Khách Hàng" },
                    { key: "phone", label: "SĐT" },
                    { key: "date", label: "Ngày Đặt" },
                    { key: "status", label: "Trạng Thái" },
                    { key: "total", label: "Tổng Tiền" },
                    { key: "payment", label: "Phương Thức" }
                  ], "Danh_sach_don_hang");
                }
              }}
              className="inline-flex h-9 items-center justify-center rounded-sm bg-brand px-4 text-xs font-semibold text-white shadow hover:bg-brand/90 transition-colors"
            >
              Xuất Excel
            </button>
          </div>

          <div className="group relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted transition-colors group-focus-within:text-brand" />
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã đơn, khách hàng, số điện thoại..."
              className="h-11 border-border bg-surface pl-9 pr-9 text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => setKeyword("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-muted"
                title="Xóa tìm kiếm"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* ── Single filter row: [Status ▾] [Date] [Payment ▾] ── */}
          <div className="flex flex-wrap items-center gap-2">

            {/* Status filter – Select dropdown */}
            <Select value={filter} onValueChange={(v) => setFilter(v as FilterKey)}>
              <SelectTrigger className="h-9 w-fit text-xs rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_TABS.map(tab => (
                  <SelectItem key={tab.key} value={tab.key}>{tab.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date range picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs font-normal rounded-sm text-muted-foreground"
                >
                  <span className="whitespace-nowrap">
                    {dateRange?.from && dateRange?.to
                      ? `${format(dateRange.from, "dd/MM/yyyy")} — ${format(dateRange.to, "dd/MM/yyyy")}`
                      : dateRange?.from
                      ? `Từ ${format(dateRange.from, "dd/MM/yyyy")} …`
                      : "Lọc theo ngày"}
                  </span>
                  {dateRange?.from && (
                    <span
                      role="button"
                      onClick={e => { e.stopPropagation(); setDateRange(undefined); }}
                      className="ml-1 hover:text-ink transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={(range: DateRange | undefined) => { setDateRange(range); }}
                />
              </PopoverContent>
            </Popover>

            {/* Payment filter – no icon */}
            <Select value={paymentFilter || "all"} onValueChange={v => setPaymentFilter(v === "all" ? "" : v)}>
              <SelectTrigger className="h-9 w-fit text-xs rounded-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thanh toán</SelectItem>
                <SelectItem value="pending">Chờ thanh toán</SelectItem>
                <SelectItem value="paid">Đã thanh toán</SelectItem>
                <SelectItem value="refund_pending">Cần hoàn tiền</SelectItem>
                <SelectItem value="failed">Thất bại</SelectItem>
              </SelectContent>
            </Select>

          </div>

        </CardHeader>
      </div>

      <div className="border border-border rounded-sm bg-surface shadow-ui-soft">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-280 table-fixed text-[13px] sm:text-sm">
              <thead>
                <tr className="bg-surface-muted text-left text-ink-muted">
                  <th
                    style={{ width: "16%" }}
                    className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wide"
                  >
                    Mã đơn
                  </th>
                  <th
                    style={{ width: "18%" }}
                    className="px-3.5 py-3.5 text-xs font-semibold uppercase tracking-wide"
                  >
                    Khách hàng
                  </th>
                  <th
                    style={{ width: "13%" }}
                    className="px-3.5 py-3.5 text-xs font-semibold uppercase tracking-wide"
                  >
                    Số điện thoại
                  </th>
                  <th
                    style={{ width: "14%" }}
                    className="px-3.5 py-3.5 text-xs font-semibold uppercase tracking-wide"
                  >
                    Ngày đặt
                  </th>
                  <th
                    style={{ width: "13%" }}
                    className="px-3.5 py-3.5 text-xs font-semibold uppercase tracking-wide"
                  >
                    Thanh toán
                  </th>
                  <th
                    style={{ width: "12%" }}
                    className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide"
                  >
                    Trạng thái
                  </th>
                  <th
                    style={{ width: "14%" }}
                    className="px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-wide"
                  >
                    Tổng tiền
                  </th>
                  <th
                    style={{ width: "7%" }}
                    className="px-4 py-3.5 text-right text-xs font-semibold uppercase tracking-wide"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="bg-surface">
                {loading && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-ink-muted"
                    >
                      Đang tải dữ liệu đơn hàng...
                    </td>
                  </tr>
                )}

                {!loading &&
                  orders.map((item) => {
                    const meta =
                      orderStatusMeta[item.orderStatus as OrderStatus] ?? orderStatusMeta.pending;
                    const StatusIcon = meta.icon;
                    return (
                      <tr
                        key={item.id}
                        className="border-b border-border transition-colors last:border-b-0 hover:bg-surface-soft"
                      >
                        <td className="px-4 py-3.5 align-middle">
                          <button
                            type="button"
                            onClick={() => { clearError(); setModal({ type: "detail", order: item }); }}
                            title={item.code}
                            className="block truncate font-medium text-ink transition-colors hover:text-danger"
                          >
                            {item.code}
                          </button>
                        </td>
                        <td className="px-3.5 py-3.5 align-middle">
                          <span
                            title={item.receiverName}
                            className="block truncate text-ink-muted"
                          >
                            {item.receiverName}
                          </span>
                        </td>
                        <td className="px-3.5 py-3.5 align-middle">
                          <span className="block truncate text-ink-muted">
                            {item.phone || "-"}
                          </span>
                        </td>
                        <td className="px-3.5 py-3.5 align-middle">
                          <span className="block truncate text-ink-muted">
                            {fmtDate(item.createdAt)}
                          </span>
                        </td>
                        <td className="px-3.5 py-3.5 align-middle">
                          {/* Payment status badge */}
                          {item.paymentStatus === "paid" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success">Đã TT</span>
                          ) : item.paymentStatus === "refund_pending" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 border border-purple-500/20">Cần Hoàn Tiền</span>
                          ) : item.paymentStatus === "failed" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-danger/10 text-danger">Thất bại</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning">Chờ TT</span>
                          )}
                        </td>
                        <td className="px-3.5 py-3.5 text-center align-middle">
                          <span
                            className={`inline-flex min-h-8 items-center gap-1.5 px-3 py-1 text-xs font-semibold ${meta.badgeClass}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center align-middle font-semibold tabular-nums text-ink">
                          {formatVnd(item.totalAmount ?? 0)}
                        </td>
                        <td className="px-4 py-3.5 text-right align-middle">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              title="Cập nhật trạng thái"
                              onClick={() => { clearError(); setModal({ type: "edit", order: item }); }}
                              className="rounded p-1.5 text-ink-muted transition-colors hover:bg-surface-soft hover:text-danger"
                            >
                              <Edit className="size-4" />
                            </button>
                            {item.orderStatus !== "cancelled" &&
                              item.orderStatus !== "completed" && (
                                <button
                                  type="button"
                                  title="Hủy đơn hàng"
                                  onClick={() => { clearError(); setModal({ type: "cancel", order: item }); }}
                                  className="rounded p-1.5 text-ink-muted transition-colors hover:bg-surface-soft hover:text-danger"
                                >
                                  <Ban className="size-4" />
                                </button>
                              )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                {!loading && orders.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-4 py-12 text-center text-sm text-ink-muted"
                    >
                      {keyword.trim() ? (
                        <span>
                          Không tìm thấy đơn hàng nào khớp với{" "}
                          <span className="font-medium text-ink-muted">
                            "{keyword.trim()}"
                          </span>
                          .{" "}
                          <button
                            type="button"
                            onClick={() => setKeyword("")}
                            className="text-danger hover:underline"
                          >
                            Xóa tìm kiếm
                          </button>
                        </span>
                      ) : filter !== "all" ? (
                        <span>
                          Không có đơn hàng nào ở trạng thái này.{" "}
                          <button
                            type="button"
                            onClick={() => setFilter("all")}
                            className="text-danger hover:underline"
                          >
                            Xem tất cả
                          </button>
                        </span>
                      ) : (
                        "Chưa có đơn hàng nào."
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border bg-surface px-4 py-4 sm:px-6">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </div>

      <DeleteModal
        open={modal.type === "cancel"}
        title="Hủy đơn hàng"
        description={`Đơn hàng "${modal.type === "cancel" ? modal.order.code : ""
          }" sẽ bị hủy và tồn kho sẽ được hoàn lại.`}
        confirmText="Xác nhận hủy"
        loading={submitting}
        submitError={error}
        onClose={closeModal}
        onConfirm={handleCancelSubmit}
      />

      <OrderDetail
        open={modal.type === "detail"}
        order={modal.type === "detail" ? modal.order : null}
        onClose={closeModal}
      />

      <OrderModal
        open={modal.type === "edit"}
        loading={submitting}
        submitError={error}
        orderCode={modal.type === "edit" ? modal.order.code : undefined}
        orderedAt={modal.type === "edit" ? modal.order.createdAt : undefined}
        totalAmount={modal.type === "edit" ? modal.order.totalAmount : undefined}
        receiverName={modal.type === "edit" ? modal.order.receiverName : undefined}
        phone={modal.type === "edit" ? modal.order.phone : undefined}
        address={modal.type === "edit" ? modal.order.address : undefined}
        note={modal.type === "edit" ? modal.order.note : undefined}
        paymentMethod={modal.type === "edit" ? modal.order.paymentMethod : undefined}
        currentOrderStatus={modal.type === "edit" ? modal.order.orderStatus : undefined}
        initialTrackingCode={modal.type === "edit" ? modal.order.trackingCode : undefined}
        onClose={closeModal}
        onSubmit={handleEditSubmit}
      />
    </section>
  );
}
