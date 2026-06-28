import { useState } from "react";
import {
  Box,
  Circle,
  CircleDashed,
  CreditCard,
  MapPin,
  Package,
} from "lucide-react";
import { Link } from "react-router";
import type { Order } from "@/admin/types/order";
import { orderStatusMeta, paymentMethodLabel } from "../types/order-meta";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// ─── Helpers ──────────────────────────────────────────────────────────────

export const formatVnd = (v: number) => `${v.toLocaleString("vi-VN")} đ`;

const formatDate = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  return Number.isNaN(d.getTime())
    ? v
    : d.toLocaleString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

// ─── Journey steps derived from status ───────────────────────────────────

const JOURNEY: { key: Order["orderStatus"] | "created"; label: string }[] = [
  { key: "created", label: "Đơn hàng được đặt" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "processing", label: "Đang xử lý" },
  { key: "shipping", label: "Đang giao hàng" },
  { key: "completed", label: "Giao thành công" },
];

function buildSteps(orderStatus: Order["orderStatus"]) {
  if (orderStatus === "cancelled" || orderStatus === "returned") {
    return [
      { id: "created", title: "Đơn hàng được đặt", done: true, current: false },
      {
        id: orderStatus,
        title:
          orderStatus === "cancelled"
            ? "Đơn hàng đã bị hủy"
            : "Đơn hàng đã hoàn trả",
        done: true,
        current: true,
      },
    ];
  }
  const idx = JOURNEY.findIndex((s) => s.key === orderStatus);
  return JOURNEY.map((s, i) => ({
    id: s.key,
    title: s.label,
    done: i <= idx,
    current: i === idx,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────

type OrderDetailProps = {
  open: boolean;
  order: Order | null;
  loading?: boolean;
  onClose: () => void;
  onRefund?: (orderId: string) => void;
  onApproveReturn?: (orderId: string) => void;
  onRejectReturn?: (orderId: string, reason: string) => void;
};

export default function OrderDetail({
  open,
  order,
  loading = false,
  onClose,
  onRefund,
  onApproveReturn,
  onRejectReturn,
}: OrderDetailProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  if (!order) return null;

  const meta = orderStatusMeta[order.orderStatus] ?? orderStatusMeta.pending;
  const StatusIcon = meta.icon;
  const steps = buildSteps(order.orderStatus);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden sm:rounded-sm flex flex-col">
        {/* Header */}
        <DialogHeader className="shrink-0 border-b border-border px-4 py-4 sm:px-6 bg-surface text-left">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center bg-surface-soft text-brand/70 rounded-full">
                <Box className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <DialogTitle className="text-base font-semibold text-ink m-0">
                    {order.code}
                  </DialogTitle>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm ${meta.badgeClass}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    {meta.label}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-ink-muted">
                  Đặt lúc: {formatDate(order.createdAt)}
                </p>
              </div>
            </div>

            <div className="text-right pr-8 sm:pr-10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
                Tổng tiền
              </p>
              <p className="mt-0.5 text-xl font-bold leading-none text-brand sm:text-2xl">
                {formatVnd(order.totalAmount)}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto max-h-[80vh]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1.65fr)_360px]">
            {/* Left: items + summary */}
            <div className="border-b border-border p-4 sm:p-5 lg:border-b-0 lg:border-r">
              <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                Sản phẩm
              </h4>

              <div className="mt-3 space-y-2.5">
                {order.items.length === 0 && (
                  <p className="text-sm text-ink-muted">Không có sản phẩm.</p>
                )}
                {order.items.map((item, i) => (
                  <div
                    key={`${item.productId}-${i}`}
                    className="flex flex-col gap-3 bg-surface-soft/50 border border-border rounded-sm px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-11 w-11 shrink-0 object-cover rounded-sm"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center bg-surface-muted text-ink-muted rounded-sm">
                          <Package className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <Link
                          to={`/product/${item.productId}`}
                          target="_blank"
                          className="truncate text-sm font-semibold leading-5 text-ink hover:text-brand hover:underline block"
                        >
                          {item.productName}
                        </Link>
                        {item.variantName && (
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {item.variantName}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-ink-muted">
                          SL: x{item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="shrink-0 text-right text-base font-semibold text-ink sm:text-left">
                      {formatVnd(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 bg-surface border border-border rounded-sm p-5">
                <div className="space-y-2 text-sm text-ink-muted">
                  <div className="flex items-center justify-between gap-4">
                    <span>Tạm tính</span>
                    <span className="text-ink">
                      {formatVnd(order.subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span>Phí vận chuyển</span>
                    <span className="text-ink">
                      {formatVnd(order.shippingFee)}
                    </span>
                  </div>
                </div>
                <div className="my-4 h-px bg-border" />
                <div className="flex items-center justify-between gap-4">
                  <p className="text-base font-semibold text-ink sm:text-lg">
                    Tổng thanh toán
                  </p>
                  <p className="text-xl font-bold leading-none text-brand sm:text-2xl">
                    {formatVnd(order.totalAmount)}
                  </p>
                </div>
                {order.note && (
                  <p className="mt-3 text-xs italic text-ink-muted bg-surface-soft p-2 rounded-sm">
                    Ghi chú: {order.note}
                  </p>
                )}
                {order.returnReason && (
                  <div className="mt-3 bg-danger/5 border border-danger/20 p-3 rounded-sm">
                    <p className="text-xs font-semibold text-danger uppercase tracking-widest mb-1">
                      Lý do yêu cầu trả hàng
                    </p>
                    <p className="text-sm text-ink">{order.returnReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: info + journey */}
            <div className="space-y-4 p-4 sm:p-5 bg-surface-soft/20">
              {/* Thông tin nhận hàng */}
              <div className="border border-border bg-surface p-4 sm:p-5 rounded-sm">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                  Thông tin nhận hàng
                </h4>
                <div className="mt-3 bg-surface-soft p-4 rounded-sm">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {order.receiverName} • {order.phone}
                      </p>
                      <p className="text-sm text-ink-muted">
                        {[
                          order.street,
                          order.ward,
                          order.district,
                          order.province,
                        ]
                          .filter(Boolean)
                          .join(", ") ||
                          order.address ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  <div className="my-4 h-px bg-border" />

                  <div className="flex items-start gap-2.5">
                    <CreditCard className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                    <div>
                      <p className="text-sm font-semibold text-ink">
                        {paymentMethodLabel[order.paymentMethod]}
                      </p>
                    </div>
                  </div>

                  {order.trackingCode && (
                    <>
                      <div className="my-4 h-px bg-border" />
                      <div className="flex items-start gap-2.5">
                        <Package className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        <div>
                          <p className="text-sm font-semibold text-ink">
                            Mã vận đơn: {order.trackingCode}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Lý do trả hàng nếu có */}
              {order.returnReason && (
                <div className="border border-warning/40 bg-warning/5 p-4 sm:p-5 rounded-sm">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-warning mb-2">
                    Lý do yêu cầu trả hàng
                  </h4>
                  <p className="text-sm text-ink font-medium">
                    {order.returnReason}
                  </p>
                  {order.returnRejectReason && (
                    <div className="mt-3 pt-3 border-t border-warning/20">
                      <p className="text-xs font-bold text-danger mb-1">
                        Lý do từ chối:
                      </p>
                      <p className="text-sm text-ink font-medium">
                        {order.returnRejectReason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Hành trình đơn hàng */}
              <div className="border border-border bg-surface p-4 sm:p-5 rounded-sm">
                <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                  Hành trình đơn hàng
                </h4>
                <div className="mt-3 space-y-3 bg-surface-soft p-4 rounded-sm">
                  {steps.map((step, index) => (
                    <div key={step.id} className="relative flex gap-3">
                      <div className="mt-0.5 shrink-0 text-border">
                        {index < steps.length - 1 && (
                          <span className="absolute left-1.5 top-4 h-[calc(100%-2px)] w-px bg-border" />
                        )}
                        {step.current ? (
                          <Circle className="h-3.5 w-3.5 fill-brand text-brand" />
                        ) : step.done ? (
                          <Circle className="h-3.5 w-3.5 fill-ink text-ink" />
                        ) : (
                          <CircleDashed className="h-3.5 w-3.5 text-border" />
                        )}
                      </div>
                      <div className="min-w-0 pb-2">
                        <p
                          className={`text-sm font-semibold ${
                            step.current ? "text-ink" : "text-ink-muted"
                          }`}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0 sm:justify-end gap-2 flex-wrap">
          {order.orderStatus === "return_pending" &&
            onApproveReturn &&
            onRejectReturn && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-center">
                {isRejecting ? (
                  <div className="flex gap-2 items-center w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Lý do từ chối..."
                      className="border border-border text-sm px-2 py-1.5 w-full sm:w-48 outline-none focus:border-brand"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="bg-danger text-white border-danger hover:bg-danger/90 hover:text-white"
                      disabled={loading || !rejectReason.trim()}
                      onClick={() => {
                        onRejectReturn(order.id, rejectReason);
                        setIsRejecting(false);
                        setRejectReason("");
                      }}
                    >
                      Xác nhận
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsRejecting(false)}
                    >
                      Huỷ
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      className="text-danger hover:text-danger hover:bg-danger/10"
                      disabled={loading}
                      onClick={() => setIsRejecting(true)}
                    >
                      Từ chối trả hàng
                    </Button>
                    <Button
                      type="button"
                      className="bg-warning text-white hover:bg-warning/90"
                      disabled={loading}
                      onClick={() => onApproveReturn(order.id)}
                    >
                      Duyệt yêu cầu
                    </Button>
                  </>
                )}
              </div>
            )}

          {order.paymentStatus === "refund_pending" && onRefund && (
            <Button
              type="button"
              className="bg-brand text-white"
              disabled={loading}
              onClick={() => onRefund(order.id)}
            >
              {loading ? "Đang xử lý..." : "Xác nhận"}
            </Button>
          )}
          <Button type="button" variant="outline" onClick={onClose}>
            Huỷ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
