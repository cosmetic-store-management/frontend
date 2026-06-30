import { useState } from "react";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  X,
  RotateCcw,
  ShoppingBag,
  ChevronDown,
  MapPin,
  CreditCard,
} from "lucide-react";
import {
  useMyOrders,
  useCancelMyOrder,
  useRequestReturnOrder,
} from "@/public/hooks/useOrder";
import { Link } from "react-router";
import { toast } from "@/lib/toast";

const ORDER_STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "processing", label: "Processing" },
  { key: "shipping", label: "Shipping" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "return_pending", label: "Return Requested" },
  { key: "returned", label: "Returned" },
];

const STATUS_META: Record<
  string,
  { label: string; icon: any; className: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-warning/10 text-warning",
  },
  processing: {
    label: "Processing",
    icon: Package,
    className: "bg-blue-500/10 text-blue-500",
  },
  shipping: {
    label: "Out for delivery",
    icon: Truck,
    className: "bg-ink/5 text-ink-muted",
  },
  completed: {
    label: "Delivered",
    icon: CheckCircle,
    className: "bg-success/10 text-success",
  },
  cancelled: {
    label: "Cancelled",
    icon: X,
    className: "bg-ink/5 text-ink-muted",
  },
  return_pending: {
    label: "Return requested",
    icon: RotateCcw,
    className: "bg-warning/10 text-warning",
  },
  returned: {
    label: "Returned",
    icon: RotateCcw,
    className: "bg-danger/10 text-danger",
  },
};

const PAYMENT_LABEL: Record<string, string> = {
  cod: "Cash on Delivery",
  bank: "Bank Transfer",
  qr: "QR Transfer",
  ewallet: "E-Wallet",
  stripe: "International Card (Stripe)",
  cash: "Cash (In-store)",
  pos_card: "Card (In-store)",
  transfer: "Transfer (In-store)",
};

export function OrdersPage() {
  const { data: orders = [], isLoading } = useMyOrders();
  const cancelMutation = useCancelMyOrder();
  const [statusTab, setStatusTab] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const [returnOrderId, setReturnOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const returnMutation = useRequestReturnOrder();

  const filtered =
    statusTab === "all"
      ? orders
      : orders.filter((o: any) => o.orderStatus === statusTab);

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  const handleCancel = async (orderId: string) => {
    try {
      await cancelMutation.mutateAsync(orderId);
      setConfirmCancelId(null);
      setExpandedId(null);
      toast.success("Order cancelled successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel order");
    }
  };

  const handleReturn = async (orderId: string) => {
    if (!returnReason.trim()) {
      toast.error("Please enter a reason for returning");
      return;
    }
    try {
      await returnMutation.mutateAsync({ orderId, reason: returnReason });
      setReturnOrderId(null);
      setReturnReason("");
      toast.success("Return request has been submitted");
    } catch (err: any) {
      toast.error(err?.message || "Failed to submit return request");
    }
  };

  return (
    <div className="animate-slide-up bg-surface rounded-sm px-6 py-6 flex-1">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-ink mb-1">My Orders</h1>
        <p className="text-xs text-ink-muted">
          Click on an order to view details.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center border-b border-border/50 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {ORDER_STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setStatusTab(tab.key);
              setExpandedId(null);
            }}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${statusTab === tab.key
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-brand"
              }`}
          >
            {tab.label}
            {tab.key !== "all" &&
              orders.filter((o: any) => o.orderStatus === tab.key).length >
              0 && (
                <span
                  className={`shrink-0 inline-flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold rounded-full ${statusTab === tab.key
                      ? "bg-brand text-white"
                      : "bg-border/70 text-ink-muted"
                    }`}
                >
                  {orders.filter((o: any) => o.orderStatus === tab.key).length}
                </span>
              )}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-12 h-12 text-ink-muted/30 mx-auto mb-3" />
          {statusTab === "all" ? (
            <>
              <p className="text-sm font-medium text-ink mb-1">
                You have no orders
              </p>
              <p className="text-xs text-ink-muted mb-5">
                Let's explore and shop now!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-brand text-white text-sm font-bold px-6 py-2.5 rounded-sm hover:bg-brand-dark transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> Shop now
              </Link>
            </>
          ) : (
            <p className="text-sm text-ink-muted">No orders in this status</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order: any) => {
            const meta = STATUS_META[order.orderStatus] ?? STATUS_META.pending;
            const StatusIcon = meta.icon;
            const isOpen = expandedId === order.id;
            const isPending = order.orderStatus === "pending";
            const hasDiscount = (order.discountAmount ?? 0) > 0;

            return (
              <div
                key={order.id}
                className="border border-border rounded-sm bg-white overflow-hidden transition-shadow hover:"
              >
                {/* ── Card summary — click to toggle ── */}
                <button
                  type="button"
                  onClick={() => toggle(order.id)}
                  className="w-full text-left"
                >
                  {/* Header: mã đơn + trạng thái + chevron */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-surface-soft">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">
                        #{order.code}
                      </span>
                      {order.channel === "pos" && (
                        <span className="text-[10px] px-2 py-0.5 rounded-sm bg-brand/10 text-brand font-medium">
                          In-store
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-sm ${meta.className}`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {meta.label}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-ink-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Items preview — 2 khi đóng, tất cả khi mở */}
                  <div className="px-4 py-3 space-y-2">
                    {(isOpen ? order.items : order.items?.slice(0, 2))?.map(
                      (item: any, i: number) => (
                        <div key={i} className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="w-10 h-10 rounded-sm object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-sm bg-surface-soft border border-border shrink-0 flex items-center justify-center">
                              <Package className="w-4 h-4 text-ink-muted/50" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-ink truncate">
                              {item.productName}
                            </p>
                            <p className="text-[11px] text-ink-muted">
                              {item.variantName} × {item.quantity}
                            </p>
                          </div>
                          <p className="text-xs font-semibold text-ink whitespace-nowrap">
                            {(item.price * item.quantity).toLocaleString(
                              "vi-VN",
                            )}
                            ₫
                          </p>
                        </div>
                      ),
                    )}
                    {!isOpen && (order.items?.length ?? 0) > 2 && (
                      <p className="text-xs text-ink-muted">
                        +{order.items.length - 2} other products
                      </p>
                    )}
                  </div>

                  {/* Footer: ngày + tổng */}
                  <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/50 bg-surface-soft">
                    <p className="text-[11px] text-ink-muted">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                    <div className="text-right">
                      <p className="text-[10px] text-ink-muted">
                        Total payment
                      </p>
                      <p className="text-sm font-bold text-brand">
                        {order.totalAmount?.toLocaleString("vi-VN")}₫
                      </p>
                    </div>
                  </div>
                </button>

                {/* ── Inline detail expand ── */}
                {isOpen && (
                  <div className="border-t border-border bg-surface-soft px-4 py-4 space-y-4">
                    {/* Địa chỉ */}
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-brand" /> Shipping
                        Address
                      </p>
                      <div className="bg-white border border-border/60 rounded-sm px-3 py-2.5">
                        <p className="text-sm font-semibold text-ink">
                          {order.receiverName} · {order.phone}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {[
                            order.street,
                            order.ward,
                            order.district,
                            order.province,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {order.note && (
                          <p className="text-xs text-ink-muted italic mt-1.5 pt-1.5 border-t border-border/40">
                            Note: {order.note}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Thanh toán */}
                    <div>
                      <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-brand" /> Payment
                      </p>
                      <div className="bg-white border border-border/60 rounded-sm px-3 py-2.5 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-ink-muted">Method</span>
                          <span className="text-xs font-medium text-ink">
                            {PAYMENT_LABEL[order.paymentMethod] ||
                              order.paymentMethod}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-ink-muted">Status</span>
                          <span
                            className={`text-[11px] font-semibold px-2.5 py-1 rounded-sm ${order.paymentStatus === "paid"
                                ? "bg-success/10 text-success"
                                : order.paymentStatus === "failed"
                                  ? "bg-danger/10 text-danger"
                                  : "bg-warning/10 text-warning"
                              }`}
                          >
                            {order.paymentStatus === "paid"
                              ? "Paid"
                              : order.paymentStatus === "failed"
                                ? "Failed"
                                : "Pending Payment"}
                          </span>
                        </div>
                        {order.trackingCode && (
                          <div className="flex justify-between items-center pt-1.5 border-t border-border/40">
                            <span className="text-xs text-ink-muted flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Tracking Code
                            </span>
                            <span className="text-xs font-mono font-semibold text-brand">
                              {order.trackingCode}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tóm tắt giá */}
                    <div className="bg-white border border-border/60 rounded-sm px-3 py-3 space-y-2">
                      <div className="flex justify-between text-xs text-ink-muted">
                        <span>Subtotal</span>
                        <span>
                          {(order.subtotal ?? 0).toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                      {hasDiscount && (
                        <div className="flex justify-between text-xs text-brand">
                          <span>Discount</span>
                          <span>
                            -{order.discountAmount.toLocaleString("vi-VN")}₫
                          </span>
                        </div>
                      )}
                      {order.voucherCode && (
                        <div className="flex justify-between text-xs text-ink-muted">
                          <span>Voucher</span>
                          <span className="font-mono">{order.voucherCode}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xs text-ink-muted">
                        <span>Shipping Fee</span>
                        <span>
                          {(order.shippingFee ?? 0) > 0
                            ? `${order.shippingFee.toLocaleString("vi-VN")}₫`
                            : "Free"}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-sm border-t border-border/50 pt-2 mt-1">
                        <span className="text-ink">Total Payment</span>
                        <span className="text-brand">
                          {(order.totalAmount ?? 0).toLocaleString("vi-VN")}₫
                        </span>
                      </div>
                    </div>

                    {/* Hủy đơn — chỉ pending */}
                    {isPending &&
                      (confirmCancelId === order.id ? (
                        <div className="space-y-2">
                          <p className="text-xs text-ink text-center">
                            Confirm cancellation of order{" "}
                            <strong>#{order.code}</strong>?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setConfirmCancelId(null)}
                              className="flex-1 border border-border text-ink-muted text-sm py-2 rounded-sm hover:bg-white transition-colors"
                            >
                              No
                            </button>
                            <button
                              onClick={() => handleCancel(order.id)}
                              disabled={cancelMutation.isPending}
                              className="flex-1 bg-danger text-white text-sm font-bold py-2 rounded-sm hover:bg-danger/90 transition-colors disabled:opacity-60"
                            >
                              {cancelMutation.isPending
                                ? "Cancelling..."
                                : "Confirm Cancel"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancelId(order.id)}
                          className="w-full border border-danger/40 text-danger text-sm font-medium py-2 rounded-sm hover:bg-danger/5 transition-colors"
                        >
                          Cancel Order
                        </button>
                      ))}

                    {/* Trả hàng — chỉ completed và trong 15 ngày */}
                    {order.orderStatus === "completed" &&
                      (() => {
                        const completionDate =
                          order.completedAt || order.updatedAt;
                        const days =
                          (Date.now() - new Date(completionDate).getTime()) /
                          (1000 * 60 * 60 * 24);
                        if (days <= 15) {
                          return returnOrderId === order.id ? (
                            <div className="space-y-2 pt-2 border-t border-border/40">
                              <p className="text-xs text-ink font-medium">
                                Reason for return/refund:
                              </p>
                              <textarea
                                id="returnReason"
                                name="returnReason"
                                className="w-full text-sm border border-border rounded-sm p-2 focus:outline-none focus:border-brand min-h-15"
                                placeholder="Enter reason and describe product condition..."
                                value={returnReason}
                                onChange={(e) =>
                                  setReturnReason(e.target.value)
                                }
                              />
                              <p className="text-[10px] text-ink-muted">
                                *Please provide photographic evidence via
                                Customer Service Zalo after submitting request.
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setReturnOrderId(null)}
                                  className="flex-1 border border-border text-ink-muted text-sm py-2 rounded-sm hover:bg-white transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleReturn(order.id)}
                                  disabled={returnMutation.isPending}
                                  className="flex-1 bg-warning text-white text-sm font-bold py-2 rounded-sm hover:bg-warning/90 transition-colors disabled:opacity-60"
                                >
                                  {returnMutation.isPending
                                    ? "Sending..."
                                    : "Submit Request"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setReturnOrderId(order.id)}
                              className="w-full border border-warning/40 text-warning text-sm font-medium py-2 rounded-sm hover:bg-warning/5 transition-colors mt-2"
                            >
                              Request Return / Refund
                            </button>
                          );
                        }
                        return null;
                      })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
