import { useEffect, useMemo, useState } from "react";
import { X, MapPin, Phone, User, Package, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderStatus, PaymentMethod } from "@/admin/types/order";
import { allowedStatusTransitions, orderStatusMeta } from "../types/order-meta";

export type OrderFormValues = {
  orderStatus: OrderStatus;
  trackingCode?: string;
};

type OrderModalProps = {
  open: boolean;
  loading?: boolean;
  submitError?: string | null;
  orderCode?: string;
  orderedAt?: string;
  totalAmount?: number;
  receiverName?: string;
  phone?: string;
  address?: string;
  note?: string;
  paymentMethod?: PaymentMethod;
  currentOrderStatus?: OrderStatus;
  initialTrackingCode?: string;
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => void | Promise<void>;
};

function formatCurrency(value?: number) {
  if (typeof value !== "number") return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

function getPaymentMethodLabel(method?: PaymentMethod) {
  switch (method) {
    case "cod": return "Thanh toán khi nhận hàng";
    case "qr": return "QR";
    case "bank": return "Chuyển khoản";
    default: return "—";
  }
}

function getActionLabel(nextStatus: OrderStatus) {
  switch (nextStatus) {
    case "shipping": return "Chuyển sang đang giao";
    case "completed": return "Đánh dấu hoàn tất";
    case "cancelled": return "Hủy đơn";
    default: return orderStatusMeta[nextStatus]?.label ?? nextStatus;
  }
}

export default function OrderModal({
  open,
  loading = false,
  submitError = null,
  orderCode,
  orderedAt,
  totalAmount,
  receiverName,
  phone,
  address,
  note,
  paymentMethod = "cod",
  currentOrderStatus = "pending",
  initialTrackingCode = "",
  onClose,
  onSubmit,
}: OrderModalProps) {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(currentOrderStatus);
  const [trackingCode, setTrackingCode] = useState(initialTrackingCode);

  useEffect(() => {
    if (!open) return;
    setNextStatus(currentOrderStatus);
    setTrackingCode(initialTrackingCode || "");
  }, [open, currentOrderStatus, initialTrackingCode]);

  const currentMeta = orderStatusMeta[currentOrderStatus];
  const selectableStatuses = useMemo(() => {
    const base = allowedStatusTransitions[currentOrderStatus] ?? [currentOrderStatus];
    return base.filter((status) => status !== currentOrderStatus);
  }, [currentOrderStatus]);

  const isReadOnly = currentOrderStatus === "completed" || currentOrderStatus === "cancelled";
  const hasChanges = nextStatus !== currentOrderStatus || trackingCode !== initialTrackingCode;

  const handleSubmit = async () => {
    if (!hasChanges || isReadOnly) return;
    await onSubmit({ orderStatus: nextStatus, trackingCode });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden sm:rounded-md">
        <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
          <DialogTitle>Cập nhật đơn hàng #{orderCode || "—"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto max-h-[75vh] bg-surface-soft/30 p-6 space-y-6">
          {/* Thông tin cơ bản */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-surface p-4 border border-border rounded-sm space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <Calendar className="w-3.5 h-3.5" /> Ngày đặt
              </p>
              <p className="font-medium text-ink text-sm">{formatDate(orderedAt)}</p>
            </div>
            <div className="bg-surface p-4 border border-border rounded-sm space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <CreditCard className="w-3.5 h-3.5" /> Thanh toán
              </p>
              <p className="font-medium text-ink text-sm">{getPaymentMethodLabel(paymentMethod)}</p>
            </div>
            <div className="bg-surface p-4 border border-border rounded-sm space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <Package className="w-3.5 h-3.5" /> Tổng tiền
              </p>
              <p className="font-semibold text-ink text-sm">{formatCurrency(totalAmount)}</p>
            </div>
          </div>

          {/* Giao hàng */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Thông tin giao hàng</h3>
            <div className="grid gap-3 sm:grid-cols-2 bg-surface border border-border rounded-sm p-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-ink-muted mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Tên khách hàng</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{receiverName || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-ink-muted mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Số điện thoại</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2 pt-2 border-t border-border">
                <MapPin className="w-4 h-4 text-ink-muted mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Địa chỉ</p>
                  <p className="mt-0.5 text-sm font-medium text-ink">{address || "—"}</p>
                </div>
              </div>
              {note && (
                <div className="sm:col-span-2 pt-2 border-t border-border">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">Ghi chú</p>
                  <p className="mt-0.5 text-sm text-ink-muted bg-surface-soft p-2 rounded-sm italic">{note}</p>
                </div>
              )}
            </div>
          </section>

          {/* Trạng thái */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Trạng thái đơn hàng</h3>
            <div className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-muted">Hiện tại:</span>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm ${currentMeta.badgeClass}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${currentMeta.dotClass}`} />
                {currentMeta.label}
              </span>
            </div>
          </section>

          {/* Hành động */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">Xử lý đơn hàng</h3>
            {isReadOnly ? (
              <div className="bg-surface-soft border border-border rounded-sm px-4 py-3 text-sm text-ink-muted text-center italic">
                {currentOrderStatus === "completed"
                  ? "Đơn hàng đã hoàn tất. Không còn hành động xử lý tiếp theo."
                  : "Đơn hàng đã bị hủy. Không còn hành động xử lý tiếp theo."}
              </div>
            ) : selectableStatuses.length === 0 ? (
              <div className="bg-surface-soft border border-border rounded-sm px-4 py-3 text-sm text-ink-muted text-center italic">
                Không có hành động hợp lệ ở trạng thái hiện tại.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectableStatuses.map((status) => {
                  const meta = orderStatusMeta[status];
                  const selected = nextStatus === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNextStatus(status)}
                      className={`flex items-center gap-3 px-4 py-3 text-sm rounded-sm transition-colors border ${
                        selected
                          ? `border-brand bg-brand/5 font-semibold text-brand`
                          : "border-border bg-surface text-ink-muted hover:bg-surface-soft"
                      }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${selected ? "bg-brand" : "bg-slate-300"}`} />
                      <span>{getActionLabel(status)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {nextStatus === "shipping" && !isReadOnly && (
              <div className="mt-4 p-4 bg-surface border border-brand/20 rounded-sm space-y-2">
                <Label htmlFor="trackingCode" className="text-brand">Mã Vận Đơn (Tracking Code)</Label>
                <Input 
                  id="trackingCode"
                  value={trackingCode} 
                  onChange={e => setTrackingCode(e.target.value)} 
                  placeholder="Nhập mã vận đơn (VD: GHTK_12345)" 
                />
              </div>
            )}
            
            {submitError && (
              <div className="mt-4 border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger rounded-sm">
                {submitError}
              </div>
            )}
          </section>
        </div>

        <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !hasChanges || isReadOnly}
            className="bg-brand hover:bg-brand/90 text-white"
          >
            {loading ? "Đang lưu..." : "Cập nhật đơn hàng"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
