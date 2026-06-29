import { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Phone,
  User,
  Package,
  Calendar,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import type { OrderStatus, PaymentMethod } from "@/admin/types/order";
import { allowedStatusTransitions, orderStatusMeta } from "../../types/order-meta";

export type OrderFormValues = {
  orderStatus: OrderStatus;
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
    case "cod":
      return "Cash on Delivery";
    case "qr":
      return "QR Code";
    case "bank":
      return "Bank Transfer";
    case "stripe":
      return "Credit Card";
    case "cash":
      return "Cash";
    case "pos_card":
      return "POS Card";
    case "transfer":
      return "Bank Transfer";
    case "ewallet":
      return "E-Wallet";
    default:
      return method || "—";
  }
}

function getActionLabel(nextStatus: OrderStatus) {
  switch (nextStatus) {
    case "shipping":
      return "Mark as shipping";
    case "completed":
      return "Mark as completed";
    case "cancelled":
      return "Cancel order";
    default:
      return orderStatusMeta[nextStatus]?.label ?? nextStatus;
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
  initialTrackingCode,
  onClose,
  onSubmit,
}: OrderModalProps) {
  const [nextStatus, setNextStatus] = useState<OrderStatus>(currentOrderStatus);

  useEffect(() => {
    if (!open) return;
    {
      /* eslint-disable-next-line  */
    }
    setNextStatus(currentOrderStatus);
  }, [open, currentOrderStatus]);

  const currentMeta = orderStatusMeta[currentOrderStatus];
  const selectableStatuses = useMemo(() => {
    const base = allowedStatusTransitions[currentOrderStatus] ?? [
      currentOrderStatus,
    ];
    return base.filter((status) => status !== currentOrderStatus);
  }, [currentOrderStatus]);

  const isReadOnly =
    currentOrderStatus === "completed" || currentOrderStatus === "cancelled";
  const hasChanges = nextStatus !== currentOrderStatus;

  const handleSubmit = async () => {
    if (!hasChanges || isReadOnly) return;
    await onSubmit({ orderStatus: nextStatus });
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={`Update Order #${orderCode || "—"}`}
      size="md"
      primaryActionText="Confirm"
      secondaryActionText="Cancel"
      onPrimaryAction={handleSubmit}
      onSecondaryAction={onClose}
      isLoading={loading}
      isDisabled={!hasChanges || isReadOnly}
    >
      <div className="space-y-6" id="order-modal-content">
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="bg-surface p-4 border border-border rounded-sm space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <Calendar className="w-3.5 h-3.5" /> Order Date
              </p>
              <p className="font-medium text-ink text-sm">
                {formatDate(orderedAt)}
              </p>
            </div>
            <div className="bg-surface p-4 border border-border rounded-sm space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <CreditCard className="w-3.5 h-3.5" /> Payment Method
              </p>
              <p className="font-medium text-ink text-sm">
                {getPaymentMethodLabel(paymentMethod)}
              </p>
            </div>
            <div className="bg-surface p-4 border border-border rounded-sm space-y-1">
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                <Package className="w-3.5 h-3.5" /> Total Amount
              </p>
              <p className="font-semibold text-ink text-sm">
                {formatCurrency(totalAmount)}
              </p>
            </div>
          </div>

          {/* Shipping */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Shipping Information
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 bg-surface border border-border rounded-sm p-4">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-ink-muted mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Customer Name
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    {receiverName || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-ink-muted mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Phone Number
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    {phone || "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2 pt-2 border-t border-border">
                <MapPin className="w-4 h-4 text-ink-muted mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Address
                  </p>
                  <p className="mt-0.5 text-sm font-medium text-ink">
                    {address || "—"}
                  </p>
                </div>
              </div>
              {note && (
                <div className="sm:col-span-2 pt-2 border-t border-border">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
                    Note
                  </p>
                  <p className="mt-0.5 text-sm text-ink-muted bg-surface-soft p-2 rounded-sm italic">
                    {note}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Status */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Order Status
            </h3>
            <div className="bg-surface border border-border rounded-sm p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-muted">
                Current:
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm ${currentMeta.badgeClass}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${currentMeta.dotClass}`}
                />
                {currentMeta.label}
              </span>
            </div>
          </section>

          {/* Action */}
          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Process Order
            </h3>
            {isReadOnly ? (
              <div className="bg-surface-soft border border-border rounded-sm px-4 py-3 text-sm text-ink-muted text-center italic">
                {currentOrderStatus === "completed"
                  ? "Order has been completed. No further actions."
                  : "Order has been cancelled. No further actions."}
              </div>
            ) : selectableStatuses.length === 0 ? (
              <div className="bg-surface-soft border border-border rounded-sm px-4 py-3 text-sm text-ink-muted text-center italic">
                No valid actions for the current status.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {selectableStatuses.map((status) => {
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
                      <span
                        className={`h-2.5 w-2.5 rounded-full shrink-0 ${selected ? "bg-brand" : "bg-slate-300"}`}
                      />
                      <span>{getActionLabel(status)}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {submitError && (
              <div className="mt-4 border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger rounded-sm">
                {submitError}
              </div>
            )}
          </section>
        </div>
    </BaseCrudModal>
  );
}
