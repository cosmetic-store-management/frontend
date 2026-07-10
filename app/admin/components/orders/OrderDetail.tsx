import { useState, useEffect } from "react";
import {
  Box,
  Circle,
  CircleDashed,
  CreditCard,
  MapPin,
  Package,
  AlertCircle,
  Check,
  X,
  RotateCcw,
  Truck,
} from "lucide-react";
import { Link } from "react-router";
import type { Order } from "@/admin/types/order";
import { orderStatusMeta, paymentMethodLabel } from "../../types/order-meta";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
  { key: "created", label: "Order Placed" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipping", label: "Shipping" },
  { key: "completed", label: "Delivered" },
];

function buildSteps(orderStatus: Order["orderStatus"]) {
  if (orderStatus === "cancelled" || orderStatus === "returned") {
    return [
      { id: "created", title: "Order Placed", done: true, current: false },
      {
        id: orderStatus,
        title:
          orderStatus === "cancelled" ? "Order Cancelled" : "Order Returned",
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
  onPOSReturn?: (orderId: string, returnItems?: any[], returnReason?: string) => Promise<void>;
  initialOpenPOSReturn?: boolean;
};

export default function OrderDetail({
  open,
  order,
  loading = false,
  onClose,
  onRefund,
  onApproveReturn,
  onRejectReturn,
  onPOSReturn,
  initialOpenPOSReturn = false,
}: OrderDetailProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [isPOSReturnOpen, setIsPOSReturnOpen] = useState(false);
  const [isConfirmingPOSReturn, setIsConfirmingPOSReturn] = useState(false);
  const [posReturnReason, setPosReturnReason] = useState("");
  const [itemsToReturn, setItemsToReturn] = useState<
    Array<{ productId: string; variantId: string; quantity: number }>
  >([]);

  useEffect(() => {
    if (
      open &&
      initialOpenPOSReturn &&
      order &&
      order.orderStatus === "completed" &&
      onPOSReturn
    ) {
      setItemsToReturn(
        order.items.map((i) => ({
          productId: i.productId.toString(),
          variantId: (i.variantId || "").toString(),
          quantity: 1,
        }))
      );
      setPosReturnReason("");
      setIsPOSReturnOpen(true);
    }
  }, [open, initialOpenPOSReturn, order, onPOSReturn]);

  if (!order) return null;

  const meta = orderStatusMeta[order.orderStatus] ?? orderStatusMeta.pending;
  const StatusIcon = meta.icon;
  const steps = buildSteps(order.orderStatus);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {!initialOpenPOSReturn ? (
        <DialogContent className="max-w-5xl p-0 gap-0 overflow-hidden sm:rounded-sm flex flex-col max-h-[90vh]">
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
            <DialogTitle className="text-xl font-bold text-ink pr-6">
              Order Detail
            </DialogTitle>
          </DialogHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto max-h-[80vh]">
            <div className="flex flex-col lg:flex-row gap-0">
              {/* Left: items + summary */}
              <div className="lg:w-[58%] flex flex-col p-4 sm:p-5">
                <div className="mb-4 text-left border-b border-border pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                    <h2 className="text-xl font-bold text-ink">{order.code}</h2>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm ${meta.badgeClass}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {meta.label}
                    </span>
                  </div>
                  <p className="text-xs text-ink-muted font-medium">
                    Ordered at: {formatDate(order.createdAt)}
                  </p>
                </div>

                <h4 className="text-xs font-semibold uppercase tracking-widest text-ink-muted">
                  Products
                </h4>

                <div className="mt-3 space-y-2.5">
                  {order.items.length === 0 && (
                    <p className="text-sm text-ink-muted">No products.</p>
                  )}
                  {order.items.map((item, i) => {
                    const barcode = item.barcode || (item.variantName && /^\d+$/.test(item.variantName.trim()) ? item.variantName.trim() : "");
                    const showVariantName = item.variantName && item.variantName !== barcode;
                    return (
                      <div
                        key={`${item.productId}-${i}`}
                        className="flex flex-col gap-3 bg-surface-soft/50 border border-border rounded-sm px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="w-12 h-12 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
                            <img
                              src={item.imageUrl || "https://placehold.co/80x80?text=Product"}
                              alt={item.productName}
                              className="w-full h-full object-contain p-0.5"
                              loading="lazy"
                            />
                          </div>
                          <div className="min-w-0">
                            <Link
                              to={`/product/${item.productId}`}
                              target="_blank"
                              className="truncate text-sm font-semibold leading-5 text-ink hover:text-brand hover:underline block"
                            >
                              {item.productName}
                            </Link>
                            {showVariantName && (
                              <p className="mt-0.5 text-xs text-ink-muted">
                                Type: {item.variantName}
                              </p>
                            )}
                            {barcode && (
                              <div className="mt-1.5 flex flex-col gap-1 text-[11px]">
                                <span className="font-mono text-ink-muted">
                                  Barcode: {barcode}
                                </span>
                                <img
                                  src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${barcode}&scale=2&rotate=N`}
                                  alt={`Barcode ${barcode}`}
                                  className="h-8 max-w-[140px] object-contain"
                                  loading="lazy"
                                />
                              </div>
                            )}
                            <p className="mt-1 text-xs text-ink-muted">
                              Qty: x{item.quantity}
                            </p>
                          </div>
                        </div>
                        <p className="shrink-0 text-right text-base font-semibold text-ink sm:text-left">
                          {formatVnd(item.price * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Summary */}
                <div className="mt-4 bg-surface border border-border rounded-sm p-5">
                  <div className="space-y-2 text-sm text-ink-muted">
                    <div className="flex items-center justify-between gap-4">
                      <span>Subtotal</span>
                      <span className="text-ink">
                        {formatVnd(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span>Shipping Fee</span>
                      <span className="text-ink">
                        {formatVnd(order.shippingFee)}
                      </span>
                    </div>
                  </div>
                  <div className="my-4 h-px bg-border" />
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-base font-semibold text-ink sm:text-lg">
                      Total Payment
                    </p>
                    <p className="text-xl font-bold leading-none text-brand sm:text-2xl">
                      {formatVnd(order.totalAmount)}
                    </p>
                  </div>
                  {order.note && (
                    <p className="mt-3 text-xs italic text-ink-muted bg-surface-soft p-2 rounded-sm">
                      Note: {order.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Vertical Divider (non-touching) */}
              <div className="hidden lg:block w-px bg-border my-6 shrink-0" />

              {/* Right: info + journey */}
              <div className="flex-1 p-4 sm:p-5 lg:bg-transparent overflow-y-auto text-left flex flex-col gap-3">
                <div className="grid grid-cols-2 gap-3 shrink-0">
                  
                  {/* Payment Method */}
                  <div className="border border-border bg-surface-soft/50 py-4 px-4 rounded-sm min-h-[76px] flex flex-col justify-start gap-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{"Payment Method"}</p>
                    <p className="text-sm font-medium text-ink">
                      {paymentMethodLabel[order.paymentMethod] || "—"}
                    </p>
                  </div>

                  {/* Purchase Channel */}
                  <div className="border border-border bg-surface-soft/50 py-4 px-4 rounded-sm min-h-[76px] flex flex-col justify-start gap-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{"Channel"}</p>
                    <p className="text-sm font-medium text-ink">
                      {order.channel === "pos" || order.address?.includes("Bán tại quầy") ? "In-Store Purchase" : "Online Purchase"}
                    </p>
                  </div>

                  {/* Tracking Code */}
                  {order.trackingCode && (
                    <div className="col-span-2 border border-border bg-surface-soft/50 py-4 px-4 rounded-sm min-h-[76px] flex flex-col justify-start gap-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{"Tracking Code"}</p>
                      <p className="text-sm font-mono font-medium text-ink">
                        {order.trackingCode}
                      </p>
                    </div>
                  )}

                  {/* Shipping Information (Only for non-POS orders) */}
                  {!(order.channel === "pos" || order.address?.includes("Bán tại quầy")) && (
                    <div className="col-span-2 border border-border bg-surface-soft/50 py-4 px-4 rounded-sm min-h-[96px] flex flex-col justify-start gap-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{"Shipping Address"}</p>
                      <div>
                        <p className="text-sm font-semibold text-ink">
                          {order.receiverName} • {order.phone}
                        </p>
                        <p className="text-sm text-ink-muted mt-1 leading-relaxed">
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
                  )}

                  {/* Return Request Reason */}
                  {order.returnReason && (
                    <div className="col-span-2 border border-border bg-warning/5 py-4 px-4 rounded-sm min-h-[96px] flex flex-col justify-start gap-1.5">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-warning">{"Return Request Reason"}</p>
                      <div>
                        <p className="text-sm text-ink font-medium leading-relaxed">
                          {order.returnReason}
                        </p>
                        {(order as any).returnRejectReason && (
                          <div className="mt-2 pt-2 border-t border-warning/20">
                            <p className="text-[11px] font-bold text-danger mb-0.5">{"Reject Reason:"}</p>
                            <p className="text-sm text-ink font-medium leading-relaxed">
                              {(order as any).returnRejectReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Journey */}
                <div className="border border-border bg-surface-soft/50 p-5 rounded-sm flex-1 flex flex-col">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-4">{"Order Journey"}</p>
                  <div className="relative flex-1 flex flex-col justify-between min-h-[220px]">
                    {/* Continuous Timeline Line */}
                    <span className="absolute left-[9.5px] top-[10px] bottom-[10px] w-px bg-border" />

                    {steps.map((step, index) => {
                      const isCancelled = step.id === "cancelled";
                      const isReturned = step.id === "returned";
                      const isCurrent = step.current;
                      const isDone = step.done;

                      return (
                        <div key={step.id} className="relative flex items-center gap-3.5 z-10">
                          {/* Circle Node */}
                          <div className="relative flex h-5 w-5 items-center justify-center shrink-0">
                            {isCurrent ? (
                              isCancelled ? (
                                <div className="w-5 h-5 rounded-full bg-danger text-white flex items-center justify-center ring-4 ring-danger/10">
                                  <X className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : isReturned ? (
                                <div className="w-5 h-5 rounded-full bg-warning text-white flex items-center justify-center ring-4 ring-warning/10">
                                  <AlertCircle className="w-3 h-3 stroke-[3]" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center ring-4 ring-brand/10">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )
                            ) : isDone ? (
                              <div className="w-5 h-5 rounded-full bg-white border border-brand/20 text-brand flex items-center justify-center">
                                <Check className="w-3 h-3 stroke-[2.5]" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-border bg-white flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-border" />
                              </div>
                            )}
                          </div>

                          {/* Title */}
                          <span
                            className={`text-xs font-semibold select-none ${
                              isCurrent
                                ? isCancelled
                                  ? "text-danger"
                                  : isReturned
                                  ? "text-warning"
                                  : "text-brand"
                                : isDone
                                ? "text-ink"
                                : "text-ink-muted/50"
                            }`}
                          >
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
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
                        placeholder="Reject reason..."
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
                        Confirm
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setIsRejecting(false)}
                      >
                        Cancel
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
                        Reject Return
                      </Button>
                      <Button
                        type="button"
                        className="bg-warning text-white hover:bg-warning/90"
                        disabled={loading}
                        onClick={() => onApproveReturn(order.id)}
                      >
                        Approve Return
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
                {loading ? "Processing..." : "Confirm"}
              </Button>
            )}


            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-sm shadow-none font-medium px-6 h-10"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : (
        <DialogContent
          className="max-w-lg w-[95vw] rounded-sm bg-surface shadow-ui-card border-border p-6 text-left"
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-ink">
              Return Request
            </DialogTitle>
            <DialogDescription className="text-xs text-ink-muted">
              Select items and quantities to return for this order.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1 text-left custom-scrollbar">
              {order.items.map((item) => {
                const barcode = item.barcode || (item.variantName && /^\d+$/.test(item.variantName.trim()) ? item.variantName.trim() : "");
                const showVariantName = item.variantName && item.variantName !== barcode;
                const isSelected = itemsToReturn.some(
                  (i) =>
                    i.productId === item.productId.toString() &&
                    i.variantId === (item.variantId || "").toString()
                );
                const returnQty =
                  itemsToReturn.find(
                    (i) =>
                      i.productId === item.productId.toString() &&
                      i.variantId === (item.variantId || "").toString()
                  )?.quantity || 1;

                return (
                  <div
                    key={`${item.productId}-${item.variantId || "default"}`}
                    className="flex items-center justify-between p-3 border border-border rounded-sm bg-surface-soft/40"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setItemsToReturn([
                              ...itemsToReturn,
                              {
                                productId: item.productId.toString(),
                                variantId: (item.variantId || "").toString(),
                                quantity: 1,
                              },
                            ]);
                          } else {
                            setItemsToReturn(
                              itemsToReturn.filter(
                                (i) =>
                                  !(
                                    i.productId === item.productId.toString() &&
                                    i.variantId === (item.variantId || "").toString()
                                  )
                              )
                            );
                          }
                        }}
                        className="rounded border-border text-brand focus:ring-brand accent-brand w-4 h-4 cursor-pointer shrink-0"
                      />

                      {/* Product Thumbnail */}
                      <div className="w-10 h-10 shrink-0 rounded-sm border border-border bg-white flex items-center justify-center overflow-hidden">
                        <img
                          src={item.imageUrl || "https://placehold.co/80x80?text=Product"}
                          alt={item.productName}
                          className="w-full h-full object-contain p-0.5"
                          loading="lazy"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-ink truncate max-w-[220px]">
                          {item.productName}
                        </div>
                        {showVariantName && (
                          <div className="text-[10px] text-ink-muted mt-0.5">
                            Type: {item.variantName}
                          </div>
                        )}
                        {barcode && (
                          <div className="mt-1 flex flex-col gap-1 text-[10px]">
                            <span className="font-mono text-ink-muted">
                              Barcode: {barcode}
                            </span>
                            <img
                              src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${barcode}&scale=2&rotate=N`}
                              alt={`Barcode ${barcode}`}
                              className="h-7 max-w-[120px] object-contain"
                              loading="lazy"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Premium Circular Quantity Stepper */}
                    {isSelected ? (
                      <div className="flex items-center gap-2 select-none shrink-0">
                        <button
                          type="button"
                          disabled={returnQty <= 1}
                          onClick={() => {
                            setItemsToReturn(
                              itemsToReturn.map((i) =>
                                i.productId === item.productId.toString() &&
                                  i.variantId === (item.variantId || "").toString()
                                  ? { ...i, quantity: Math.max(1, i.quantity - 1) }
                                  : i
                              )
                            );
                          }}
                          className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-soft disabled:opacity-30 disabled:hover:bg-surface text-ink-muted hover:text-ink text-sm font-semibold transition-colors"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-ink">
                          {returnQty}
                        </span>
                        <button
                          type="button"
                          disabled={returnQty >= item.quantity}
                          onClick={() => {
                            setItemsToReturn(
                              itemsToReturn.map((i) =>
                                i.productId === item.productId.toString() &&
                                  i.variantId === (item.variantId || "").toString()
                                  ? { ...i, quantity: Math.min(item.quantity, i.quantity + 1) }
                                  : i
                              )
                            );
                          }}
                          className="w-7 h-7 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-surface-soft disabled:opacity-30 disabled:hover:bg-surface text-ink-muted hover:text-ink text-sm font-semibold transition-colors"
                        >
                          +
                        </button>
                        <span className="text-[10px] text-ink-muted ml-1 font-medium">
                          / {item.quantity}
                        </span>
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-ink-muted shrink-0 pr-1 select-none">
                        Qty: {item.quantity}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Return Reason Box */}
            <div className="space-y-1.5 mt-4 text-left">
              <label className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted block">
                Return Reason
              </label>
              <textarea
                placeholder="Enter reason for return (e.g., defective, customer changed mind)..."
                value={posReturnReason}
                onChange={(e) => setPosReturnReason(e.target.value)}
                className="w-full h-24 border border-border text-xs p-2 rounded-sm bg-surface focus:border-brand focus:ring-1 focus:ring-brand/20 outline-none resize-none transition-all"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="rounded-sm text-xs font-medium h-10 px-6 shadow-none"
            >
              Cancel
            </Button>
            <Button
              disabled={itemsToReturn.length === 0}
              onClick={() => {
                setIsConfirmingPOSReturn(true);
              }}
              className="bg-brand hover:bg-brand-dark text-white rounded-sm text-xs font-medium active:scale-[0.97] transition-all h-10 px-6 shadow-none"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      )}

      {/* POS Return Confirmation Dialog */}
      <Dialog open={isConfirmingPOSReturn} onOpenChange={setIsConfirmingPOSReturn}>
        <DialogContent
          className="sm:max-w-[400px] w-[95vw] flex flex-col p-0 gap-0 overflow-hidden bg-surface shadow-2xl border-surface-muted border-t sm:rounded-sm"
        >
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar max-h-[calc(90vh-160px)]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-lg font-semibold tracking-tight text-ink">
                  Return Items
                </h2>
                <div className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                  Are you sure you want to return the selected items for this order? This action cannot be undone.
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 py-4 border-t border-surface-muted bg-surface sm:justify-end gap-3 flex-row items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmingPOSReturn(false)}
              className="flex-1 sm:flex-none border-surface-muted hover:bg-surface-muted transition-colors rounded-sm font-medium px-5 h-10 text-xs shadow-none border-border"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (onPOSReturn) {
                  onPOSReturn(order.id, itemsToReturn, posReturnReason).then(() => {
                    setIsConfirmingPOSReturn(false);
                    onClose();
                  });
                }
              }}
              className="flex-1 sm:flex-none bg-brand hover:bg-brand-dark text-white rounded-sm font-medium px-6 shadow-none transition-all h-10 text-xs"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
