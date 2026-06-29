import { Search, Edit, Ban, X, MoreVertical } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { useOrders } from "../hooks/useOrders";

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
import { orderStatusMeta } from "../types/order-meta";
import OrderModal, {
  type OrderFormValues,
} from "../components/orders/OrderModal";
import { PageHeader } from "../components/common/PageHeader";
import type { Order, OrderStatus } from "@/admin/types/order";
import type { FilterKey } from "../hooks/useOrders";
import { exportToCSV } from "@/lib/utils";

const STATUS_TABS: {
  key: FilterKey | "processing" | "returned";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipping", label: "Shipping" },
  { key: "completed", label: "Completed" },
  { key: "returned", label: "Returned" },
  { key: "cancelled", label: "Cancelled" },
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
  const dateTo = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "";

  const {
    orders,
    pagination,
    cursors,
    handleNext,
    handlePrev,
    loading,
    error,
    submitting,
    submitEdit,
    submitCancel,
    clearError,
  } = useOrders(keyword, filter, paymentFilter, dateFrom, dateTo);

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
        description="Track order information, customers, totals, and processing status."
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
            className="h-10 shrink-0 bg-brand px-4 text-white hover:bg-brand-hover shadow-none"
          >
            Export CSV
          </Button>
        }
        filters={
          <div className="flex flex-col gap-3 w-full">
            {/* Search */}
            <div className="group relative w-full sm:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-brand" />
              <Input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search by order code, customer, phone..."
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
              {/* Status pill tabs */}
              <div className="flex items-center gap-1 p-1 bg-surface-muted rounded-sm">
                {STATUS_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key as FilterKey)}
                    className={`px-3 py-1.5 rounded-sm text-xs font-semibold transition-all duration-150 ${
                      filter === tab.key
                        ? "bg-surface text-brand shadow-sm"
                        : "text-ink-muted hover:text-ink"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

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
                  <SelectItem value="refund_pending">Refund pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        }
      />

      <div className="premium-card rounded-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="min-w-250 table-fixed">
            <TableHeader>
              <TableRow className="bg-surface-muted text-ink-muted border-b border-border">
                <TableHead
                  style={{ width: "16%" }}
                  className="px-4 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-left"
                >
                  Order ID
                </TableHead>
                <TableHead
                  style={{ width: "18%" }}
                  className="px-3.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap text-left"
                >
                  Customer
                </TableHead>
                <TableHead
                  style={{ width: "13%" }}
                  className="px-3.5 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                >
                  Phone
                </TableHead>
                <TableHead
                  style={{ width: "14%" }}
                  className="px-3.5 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                >
                  Date
                </TableHead>
                <TableHead
                  style={{ width: "13%" }}
                  className="px-3.5 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                >
                  Payment
                </TableHead>
                <TableHead
                  style={{ width: "12%" }}
                  className="px-4 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                >
                  Status
                </TableHead>
                <TableHead
                  style={{ width: "14%" }}
                  className="px-4 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                >
                  Total
                </TableHead>
                <TableHead
                  style={{ width: "2%" }}
                  className="px-3.5 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap"
                >
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="px-4 py-12 text-center text-sm text-ink-muted"
                  >
                    Loading orders...
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                orders.map((item) => {
                  const meta =
                    orderStatusMeta[item.orderStatus as OrderStatus] ??
                    orderStatusMeta.pending;
                  const StatusIcon = meta.icon;
                  return (
                    <TableRow key={item.id}>
                      <TableCell className="px-4 py-3.5 align-middle">
                        <button
                          type="button"
                          onClick={() => {
                            clearError();
                            setModal({ type: "detail", order: item });
                          }}
                          title={item.code}
                          className="block truncate font-semibold text-ink transition-colors hover:text-brand hover:underline"
                        >
                          {item.code}
                        </button>
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 align-middle">
                        <span
                          title={item.receiverName}
                          className="block truncate text-ink font-medium"
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
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm bg-success/10 text-success">
                            Paid
                          </span>
                        ) : item.paymentStatus === "refund_pending" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm bg-purple-500/10 text-purple-600 border border-purple-500/20">
                            Refund pending
                          </span>
                        ) : item.paymentStatus === "failed" ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm bg-danger/10 text-danger">
                            Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-sm bg-warning/10 text-warning">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="px-3.5 py-3.5 text-center align-middle">
                        <span
                          className={`inline-flex min-h-8 items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-sm ${meta.badgeClass}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {meta.label}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-right align-middle font-semibold tabular-nums text-ink">
                        {formatVnd(item.totalAmount ?? 0)}
                      </TableCell>
                      <TableCell className="px-4 py-3.5 text-center align-middle">
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
                                  setModal({ type: "edit", order: item });
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2.5" />
                                Edit
                              </DropdownMenuItem>
                              {item.orderStatus !== "cancelled" &&
                                item.orderStatus !== "completed" && (
                                  <DropdownMenuItem
                                    className="cursor-pointer rounded-sm text-danger focus:bg-danger/10 focus:text-danger"
                                    onClick={() => {
                                      clearError();
                                      setModal({ type: "cancel", order: item });
                                    }}
                                  >
                                    <Ban className="w-4 h-4 mr-2.5" />
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
                    colSpan={8}
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
        </div>
        {(cursors.length > 0 || pagination?.hasNextPage) && (
          <div className="flex items-center justify-between px-5 py-4 bg-surface border-t border-border rounded-b-sm">
            <div className="text-sm text-ink-muted font-medium">
              Page {cursors.length + 1}
              {pagination?.total > 0 && (
                <>
                  <span className="mx-2 text-border">|</span>
                  Total: {pagination.total} orders
                </>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm h-9 px-4 font-medium text-ink-muted hover:text-ink"
                onClick={handlePrev}
                disabled={cursors.length === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-sm h-9 px-4 font-medium text-ink-muted hover:text-ink"
                onClick={handleNext}
                disabled={!pagination?.hasNextPage}
              >
                Next
              </Button>
            </div>
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
        totalAmount={
          modal.type === "edit" ? modal.order.totalAmount : undefined
        }
        receiverName={
          modal.type === "edit" ? modal.order.receiverName : undefined
        }
        phone={modal.type === "edit" ? modal.order.phone : undefined}
        address={modal.type === "edit" ? modal.order.address : undefined}
        note={modal.type === "edit" ? modal.order.note : undefined}
        paymentMethod={
          modal.type === "edit" ? modal.order.paymentMethod : undefined
        }
        currentOrderStatus={
          modal.type === "edit" ? modal.order.orderStatus : undefined
        }
        initialTrackingCode={
          modal.type === "edit" ? modal.order.trackingCode : undefined
        }
        onClose={closeModal}
        onSubmit={handleEditSubmit}
      />
    </section>
  );
}
