import { Search, Edit, Ban, X, MoreVertical, Eye, XCircle, RotateCcw, History } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useOrders } from "../hooks/useOrders";
import { usePOSReturn } from "../hooks/usePOS";
import { toast } from "@/lib/toast";
import { Pagination } from "@/components/ui/pagination";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DeleteModal from "@/components/ui/delete-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import OrderDetail, { formatVnd } from "../components/orders/OrderDetail";
import OrderHistoryDialog from "../components/orders/OrderHistoryDialog";
import { orderStatusMeta } from "../types/order-meta";
import OrderModal, {
  type OrderFormValues,
} from "../components/orders/OrderModal";
import { PageHeader } from "../components/common/PageHeader";
import type { Order, OrderStatus } from "@/admin/types/order";
import type { FilterKey } from "../hooks/useOrders";
import { exportToCSV } from "@/lib/utils";


function fmtDate(v?: string) {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? v : d.toLocaleString("vi-VN");
}

type ModalState =
  | { type: "none" }
  | { type: "edit"; order: Order }
  | { type: "cancel"; order: Order }
  | { type: "detail"; order: Order }
  | { type: "pos_return"; order: Order }
  | { type: "history"; order: Order };

export function OrderPage() {
  const posReturnMutation = usePOSReturn();
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [channelFilter, setChannelFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  // Convert DateRange → YYYY-MM-DD strings for the API
  const dateFrom = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "";
  const dateTo = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  const {
    orders,
    pagination,
    page,
    setPage,
    loading,
    error,
    submitting,
    submitEdit,
    submitCancel,
    submitRefund,
    submitApproveReturn,
    submitRejectReturn,
    clearError,
  } = useOrders(keyword, filter, paymentFilter, dateFrom, dateTo, channelFilter);

  // ── Handlers ─────────────────────────────────────────────────────────────

  const closeModal = () => {
    setModal({ type: "none" });
    clearError();
  };

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
      <PageHeader
        title="Order Management"
        description="Manage all customer orders, track fulfillment status, and handle returns or cancellations."
        error={error}
        onClearError={clearError}
        actions={
          <Button
            onClick={() => {
              {
                const data = orders.map((o) => ({
                  code: o.code,
                  customer: o.receiverName,
                  phone: o.phone || "-",
                  date: fmtDate(o.createdAt),
                  status: o.orderStatus,
                  total: o.totalAmount,
                  payment: o.paymentMethod,
                }));
                exportToCSV(
                  data,
                  [
                    { key: "code", label: "Order ID" },
                    { key: "customer", label: "Customer" },
                    { key: "phone", label: "Phone" },
                    { key: "date", label: "Date" },
                    { key: "status", label: "Status" },
                    { key: "total", label: "Total" },
                    { key: "payment", label: "Payment" },
                  ],
                  "orders_export",
                );
              }
            }}
            size="sm"
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-dark transition-all shadow-none"
          >
            Export CSV
          </Button>
        }
        filters={
          <div className="flex flex-wrap items-center gap-3 w-full">
            {/* Search */}
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search code, customer, phone..."
                className="h-10 border-border bg-surface pl-9 pr-9 text-sm text-ink-muted placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-brand/20"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>

            {/* Pill Tabs + Date/Payment filters */}
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filter || "all"}
                onValueChange={(v) => setFilter(v as FilterKey)}
              >
                <SelectTrigger className="h-9 rounded-sm w-fit text-xs border-border bg-surface text-ink-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipping">Shipping</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 rounded-sm text-xs font-normal border-border bg-surface text-ink-muted"
                  >
                    <span className="whitespace-nowrap">
                      {dateRange?.from && dateRange?.to
                        ? `${format(dateRange.from, "dd/MM/yyyy")} — ${format(dateRange.to, "dd/MM/yyyy")}`
                        : dateRange?.from
                          ? `From ${format(dateRange.from, "dd/MM/yyyy")} …`
                          : "Date range"}
                    </span>
                    {dateRange?.from && (
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDateRange(undefined);
                        }}
                        className="ml-1 hover:text-foreground transition-colors"
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
                    onSelect={(range: DateRange | undefined) => {
                      setDateRange(range);
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Select
                value={paymentFilter || "all"}
                onValueChange={(v) => setPaymentFilter(v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-9 rounded-sm w-fit text-xs border-border bg-surface text-ink-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunds</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={channelFilter || "all"}
                onValueChange={(v) => setChannelFilter(v === "all" ? "" : v)}
              >
                <SelectTrigger className="h-9 rounded-sm w-fit text-xs border-border bg-surface text-ink-muted">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="pos">POS Counter</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      <div className="premium-card rounded-sm overflow-hidden">
        <Table className="min-w-[1100px] table-fixed">
          <TableHeader>
            <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
              <TableHead className="py-4 px-3 w-16 text-center">
                No.
              </TableHead>
              <TableHead className="w-36 text-center">
                Order ID
              </TableHead>
              <TableHead className="w-48 text-center">
                Customer
              </TableHead>
              <TableHead className="w-36 text-center">
                Phone
              </TableHead>
              <TableHead className="w-36 text-center">
                Date
              </TableHead>
              <TableHead className="w-32 text-center">
                Payment
              </TableHead>
              <TableHead className="w-36 text-center">
                Status
              </TableHead>
              <TableHead className="w-36 text-center">
                Total
              </TableHead>
              <TableHead className="w-20 text-center">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-ink-muted"
                  >
                    Loading orders...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                orders.map((item, i) => {
                  const meta =
                    orderStatusMeta[item.orderStatus as OrderStatus] ??
                    orderStatusMeta.pending;
                  const StatusIcon = meta.icon;
                  return (
                    <TableRow key={item.id}>
                      {/* No. */}
                      <TableCell className="py-3.5 px-3 text-center font-mono text-ink-muted/80 text-sm">
                        {(page - 1) * 10 + i + 1}
                      </TableCell>

                      <TableCell className="px-4 py-3.5 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => {
                            clearError();
                            setModal({ type: "detail", order: item });
                          }}
                          title={item.code}
                          className="block text-center mx-auto max-w-full truncate font-semibold text-ink transition-colors hover:text-brand hover:underline"
                        >
                          {item.code}
                        </button>
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 align-middle text-center">
                        <span
                          title={item.receiverName}
                          className="block text-center truncate text-ink font-medium"
                        >
                          {item.receiverName}
                        </span>
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 align-middle text-center">
                        <span className="block truncate text-ink">
                          {item.phone || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 align-middle text-center">
                        <span className="block truncate text-ink-muted">
                          {fmtDate(item.createdAt)}
                        </span>
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 align-middle text-center">
                        {/* Payment status badge */}
                        {item.paymentStatus === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-success/10 text-success">
                            Paid
                          </span>
                        ) : item.paymentStatus === "refund_pending" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            Refund pending
                          </span>
                        ) : item.paymentStatus === "failed" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-danger/10 text-danger">
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-[4px] bg-warning/10 text-warning">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 text-center align-middle">
                        <span
                          className={`inline-flex min-h-8 items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[4px] ${meta.badgeClass}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-center align-middle font-semibold tabular-nums text-ink">
                        {formatVnd(item.totalAmount ?? 0)}
                      </TableCell>
                      <TableCell className="py-3.5 text-center align-middle">
                        <div className="flex items-center justify-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-8 w-8 text-ink-muted hover:text-ink hover:bg-surface-muted data-[state=open]:bg-surface-muted data-[state=open]:text-ink"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-48 p-1.5 shadow-ui-card rounded-sm border-border animate-scale-in"
                            >
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => {
                                  clearError();
                                  setModal({ type: "detail", order: item });
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2.5" />
                                Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => {
                                  clearError();
                                  setModal({ type: "history", order: item });
                                }}
                              >
                                <History className="w-4 h-4 mr-2.5" />
                                History
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                onClick={() => {
                                  clearError();
                                  setModal({ type: "edit", order: item });
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2.5" />
                                Edit
                              </DropdownMenuItem>
                              {item.orderStatus === "completed" && (
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm focus:bg-brand/5 focus:text-brand"
                                  onClick={() => {
                                    clearError();
                                    setModal({ type: "pos_return", order: item });
                                  }}
                                >
                                  <RotateCcw className="w-4 h-4 mr-2.5" />
                                  Return
                                </DropdownMenuItem>
                              )}
                              {item.orderStatus === "pending" && (
                                <DropdownMenuItem
                                  className="cursor-pointer rounded-sm text-danger focus:bg-danger/5 focus:text-danger"
                                  onClick={() => {
                                    clearError();
                                    setModal({ type: "cancel", order: item });
                                  }}
                                >
                                  <XCircle className="w-4 h-4 mr-2.5" />
                                  Cancel
                                </DropdownMenuItem>
                              )}

                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {!loading && orders.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="px-4 py-12 text-center text-sm text-ink-muted"
                  >
                    {keyword.trim() ? (
                      <span>
                        No orders found matching{" "}
                        <span className="font-medium text-ink-muted">
                          "{keyword.trim()}"
                        </span>
                        .{" "}
                        <button
                          type="button"
                          onClick={() => setKeyword("")}
                          className="text-danger hover:underline"
                        >
                          Clear search
                        </button>
                      </span>
                    ) : filter !== "all" ? (
                      <span>
                        No orders with this status.{" "}
                        <button
                          type="button"
                          onClick={() => setFilter("all")}
                          className="text-danger hover:underline"
                        >
                          View all
                        </button>
                      </span>
                    ) : (
                      "No orders yet."
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        {pagination?.totalPages > 1 && (
          <div className="flex items-center justify-center px-5 py-4 bg-surface border-t border-border rounded-b-sm">
            <Pagination
              currentPage={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <DeleteModal
        open={modal.type === "cancel"}
        title="Cancel Order"
        description={`Order "${
          modal.type === "cancel" ? modal.order.code : ""
        }" will be cancelled and stock will be restored.`}
        confirmText="Confirm cancel"
        loading={submitting}
        submitError={error}
        onClose={closeModal}
        onConfirm={handleCancelSubmit}
      />

      <OrderDetail
        open={modal.type === "detail" || modal.type === "pos_return"}
        order={
          modal.type === "detail" || modal.type === "pos_return"
            ? modal.order
            : null
        }
        initialOpenPOSReturn={modal.type === "pos_return"}
        onClose={closeModal}
        onApproveReturn={async (orderId) => {
          const success = await submitApproveReturn(orderId);
          if (success) closeModal();
        }}
        onRejectReturn={async (orderId, reason) => {
          const success = await submitRejectReturn(orderId, reason);
          if (success) closeModal();
        }}
        onRefund={async (orderId) => {
          const success = await submitRefund(orderId);
          if (success) closeModal();
        }}
        onPOSReturn={async (orderId, returnItems, returnReason) => {
          await toast.promise(
            posReturnMutation
              .mutateAsync({ orderId, returnItems, returnReason })
              .then(() => {
                closeModal();
              }),
            {
              loading: "Processing counter return...",
              success: "Return completed successfully!",
              error: (err: any) => err.message || "Failed to process return",
            }
          );
        }}
      />

      <OrderModal
        open={modal.type === "edit"}
        loading={submitting}
        submitError={error}
        order={modal.type === "edit" ? modal.order : null}
        onClose={closeModal}
        onSubmit={handleEditSubmit}
      />

      <OrderHistoryDialog
        open={modal.type === "history"}
        order={modal.type === "history" ? modal.order : null}
        onClose={closeModal}
      />
    </section>
  );
}
