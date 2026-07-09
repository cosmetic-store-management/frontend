import { useState, useEffect } from "react";
import {
  Box,
  Circle,
  CircleDashed,
  CreditCard,
  MapPin,
  Package,
  AlertCircle,
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
            <div className="flex-1 p-4 sm:p-5">
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
                {order.items.map((item, i) => (
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
                        {item.variantName && (
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {item.variantName}
                          </p>
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
                ))}
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
                {order.returnReason && (
                  <div className="mt-3 bg-danger/5 border border-danger/20 p-3 rounded-sm">
                    <p className="text-xs font-semibold text-danger uppercase tracking-widest mb-1">
                      Return Reason
                    </p>
                    <p className="text-sm text-ink">{order.returnReason}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Vertical Divider (non-touching) */}
            <div className="hidden lg:block w-px bg-border my-6 shrink-0" />

            {/* Right: info + journey */}
            <div className="space-y-4 p-4 sm:p-5 lg:bg-transparent overflow-y-auto shrink-0 lg:w-[360px] text-left">

              {/* Purchase & Payment */}
              <div className="border border-border bg-surface p-4 rounded-sm text-left">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
                  Purchase & Payment
                </h4>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted block">Channel</span>
                    <span className="font-semibold text-ink mt-0.5 block">
                      {order.channel === "pos" || order.address?.includes("Bán tại quầy") ? "In-Store Purchase" : "Online Purchase"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted block">Payment Method</span>
                    <span className="font-semibold text-ink mt-0.5 block">
                      {paymentMethodLabel[order.paymentMethod] || "—"}
                    </span>
                  </div>
                  {order.trackingCode && (
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted block">Tracking Code</span>
                      <span className="font-mono text-ink mt-0.5 block">
                        {order.trackingCode}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Information (Only for non-POS orders) */}
              {!(order.channel === "pos" || order.address?.includes("Bán tại quầy")) && (
                <div className="border border-border bg-surface p-4 rounded-sm text-left">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
                    Shipping Information
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted block">Recipient</span>
                      <span className="font-semibold text-ink mt-0.5 block">
                        {order.receiverName}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted block">Phone</span>
                      <span className="font-mono text-ink mt-0.5 block">
                        {order.phone || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted block">Address</span>
                      <span className="text-ink-muted mt-0.5 block leading-relaxed">
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
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Lý do trả hàng nếu có */}
              {order.returnReason && (
                <div className="border border-warning/40 bg-warning/5 p-4 rounded-sm">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-warning mb-2">
                    Return Request Reason
                  </h4>
                  <p className="text-sm text-ink font-medium leading-relaxed">
                    {order.returnReason}
                  </p>
                  {(order as any).returnRejectReason && (
                    <div className="mt-3 pt-3 border-t border-warning/20">
                      <p className="text-xs font-bold text-danger mb-1">
                        Reject Reason:
                      </p>
                      <p className="text-sm text-ink font-medium leading-relaxed">
                        {(order as any).returnRejectReason}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Order Journey */}
              <div className="border border-border bg-surface p-4 rounded-sm">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-3">
                  Order Journey
                </h4>
                <div className="space-y-3 mt-2">
                  {steps.map((step, index) => (
                    <div key={step.id} className="relative flex gap-3">
                      <div className="mt-1 shrink-0 text-border">
                        {index < steps.length - 1 && (
                          <span className="absolute left-[7px] top-[14px] h-[calc(100%-6px)] w-px bg-border" />
                        )}
                        {step.current ? (
                          <Circle className="h-3.5 w-3.5 fill-brand text-brand" />
                        ) : step.done ? (
                          <Circle className="h-3.5 w-3.5 fill-ink text-ink" />
                        ) : (
                          <CircleDashed className="h-3.5 w-3.5 text-border" />
                        )}
                      </div>
                      <div className="min-w-0 pb-1">
                        <p
                          className={`text-sm font-semibold ${step.current ? "text-brand" : "text-ink-muted"
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

      {/* POS Return Selector Dialog */}
      <Dialog open={isPOSReturnOpen} onOpenChange={setIsPOSReturnOpen}>
        <DialogContent
          overlayClassName="bg-black/40"
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
                        {item.variantName && (
                          <div className="text-[10px] text-ink-muted mt-0.5">
                            {item.variantName}
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
              onClick={() => setIsPOSReturnOpen(false)}
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
      </Dialog>

      {/* POS Return Confirmation Dialog */}
      <Dialog open={isConfirmingPOSReturn} onOpenChange={setIsConfirmingPOSReturn}>
        <DialogContent
          overlayClassName="bg-transparent"
          className="sm:max-w-[400px] w-[95vw] flex flex-col p-0 gap-0 overflow-hidden bg-white shadow-2xl border-surface-muted border-t sm:rounded-sm"
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
          <DialogFooter className="px-6 py-4 border-t border-surface-muted bg-white sm:justify-end gap-3 flex-row items-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmingPOSReturn(false)}
              className="flex-1 sm:flex-none border-surface-muted hover:bg-surface-muted transition-colors rounded-sm font-medium px-5 h-10 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (onPOSReturn) {
                  onPOSReturn(order.id, itemsToReturn, posReturnReason).then(() => {
                    setIsConfirmingPOSReturn(false);
                    setIsPOSReturnOpen(false);
                    setPosReturnReason("");
                  });
                }
              }}
              className="flex-1 sm:flex-none bg-brand hover:bg-brand-dark text-white rounded-sm font-medium px-6 shadow-sm transition-all h-10 text-xs"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
