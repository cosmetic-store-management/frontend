import { X, Package, MapPin, CreditCard, Truck, Clock, CheckCircle, RotateCcw } from "lucide-react";
import { useCancelMyOrder } from "@/public/hooks/useOrder";
import { useState } from "react";

interface OrderDetailModalProps {
  order: any | null;
  onClose: () => void;
}

const STATUS_META: Record<string, { label: string; icon: any; className: string }> = {
  pending:    { label: "Chờ xác nhận", icon: Clock,       className: "bg-warning/10 text-warning" },
  processing: { label: "Đang xử lý",   icon: Package,     className: "bg-blue-500/10 text-blue-500" },
  shipping:   { label: "Đang giao",    icon: Truck,       className: "bg-surface-muted text-ink-muted" },
  completed:  { label: "Hoàn tất",     icon: CheckCircle, className: "bg-success/10 text-success" },
  cancelled:  { label: "Đã hủy",       icon: X,           className: "bg-ink/5 text-ink-muted" },
  returned:   { label: "Trả hàng",     icon: RotateCcw,   className: "bg-danger/10 text-danger" },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  cod:  "Thanh toán khi nhận hàng (COD)",
  bank: "Chuyển khoản ngân hàng",
  vnpay: "VNPay",
  qr:   "Chuyển khoản QR",
  ewallet: "Ví điện tử",
};

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const cancelMutation = useCancelMyOrder();
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!order) return null;

  const meta = STATUS_META[order.orderStatus] ?? STATUS_META.pending;
  const StatusIcon = meta.icon;
  const isPending = order.orderStatus === "pending";
  const hasDiscount = (order.discountAmount ?? 0) > 0;

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(order._id || order.id);
    setConfirmCancel(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop — z-[100] vượt header z-50 */}
      <div
        className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal — pattern chuẩn: outer overflow-y-auto, inner flex min-h-full items-center */}
      <div className="fixed inset-0 z-[101] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative bg-surface w-full max-w-lg rounded-sm shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-ink text-lg">Chi tiết đơn hàng</h2>
            <p className="text-xs text-ink-muted mt-0.5">#{order.code}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${meta.className}`}>
              <StatusIcon className="w-3 h-3" />
              {meta.label}
            </span>
            <button onClick={onClose} className="p-1.5 rounded-sm text-ink-muted hover:text-ink hover:bg-surface-soft transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Shipping address */}
          <section>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand" /> Địa chỉ giao hàng
            </h3>
            <div className="bg-surface-soft rounded-sm p-4 text-sm space-y-1">
              <p className="font-semibold text-ink">{order.receiverName} · {order.phone}</p>
              <p className="text-ink-muted">
                {order.street && `${order.street}, `}
                {order.ward && `${order.ward}, `}
                {order.district && `${order.district}, `}
                {order.province}
              </p>
              {order.note && (
                <p className="text-xs text-ink-muted italic mt-1.5 border-t border-border/50 pt-1.5">
                  Ghi chú: {order.note}
                </p>
              )}
            </div>
          </section>

          {/* Payment & tracking */}
          <section>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-brand" /> Thanh toán
            </h3>
            <div className="bg-surface-soft rounded-sm p-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">Phương thức</span>
                <span className="font-medium text-ink">{PAYMENT_METHOD_LABEL[order.paymentMethod] || order.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Trạng thái TT</span>
                <span className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                  order.paymentStatus === "paid" ? "bg-success/10 text-success" :
                  order.paymentStatus === "failed" ? "bg-danger/10 text-danger" :
                  "bg-warning/10 text-warning"
                }`}>
                  {order.paymentStatus === "paid" ? "Đã thanh toán" :
                   order.paymentStatus === "failed" ? "Thất bại" : "Chờ thanh toán"}
                </span>
              </div>
              {order.trackingCode && (
                <div className="flex justify-between items-center border-t border-border/50 pt-2 mt-1">
                  <span className="text-ink-muted flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Mã vận đơn</span>
                  <span className="font-mono font-semibold text-brand">{order.trackingCode}</span>
                </div>
              )}
            </div>
          </section>

          {/* Items */}
          <section>
            <h3 className="text-xs font-bold text-ink uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-brand" /> Sản phẩm ({order.items?.length})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div key={i} className="flex gap-3 bg-surface-soft rounded-sm p-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-14 h-14 object-cover rounded-sm border border-border shrink-0" />
                  ) : (
                    <div className="w-14 h-14 bg-surface flex items-center justify-center border border-border rounded-sm shrink-0">
                      <Package className="w-5 h-5 text-border" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink leading-tight">{item.productName}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{item.variantName}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-ink-muted">× {item.quantity}</span>
                      <span className="text-sm font-bold text-ink">{(item.price * item.quantity).toLocaleString("vi-VN")}₫</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Price summary */}
          <section className="bg-surface-soft rounded-sm p-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-ink-muted">
              <span>Tạm tính</span>
              <span>{(order.subtotal ?? 0).toLocaleString("vi-VN")}₫</span>
            </div>
            {hasDiscount && (
              <div className="flex justify-between text-brand">
                <span>Giảm giá</span>
                <span>-{(order.discountAmount ?? 0).toLocaleString("vi-VN")}₫</span>
              </div>
            )}
            {order.voucherCode && (
              <div className="flex justify-between text-xs text-ink-muted">
                <span>Mã voucher</span>
                <span className="font-mono">{order.voucherCode}</span>
              </div>
            )}
            <div className="flex justify-between text-ink-muted">
              <span>Phí vận chuyển</span>
              <span>{(order.shippingFee ?? 0) > 0 ? `${(order.shippingFee).toLocaleString("vi-VN")}₫` : "Miễn phí"}</span>
            </div>
            <div className="flex justify-between font-bold text-base border-t border-border/50 pt-2.5 mt-1">
              <span className="text-ink">Tổng thanh toán</span>
              <span className="text-brand">{(order.totalAmount ?? 0).toLocaleString("vi-VN")}₫</span>
            </div>
          </section>

          {/* Date */}
          <p className="text-xs text-ink-muted text-center pb-2">
            Đặt hàng lúc: {new Date(order.createdAt).toLocaleString("vi-VN")}
          </p>
        </div>

        {/* Footer action */}
        {isPending && (
          <div className="shrink-0 px-6 py-4 border-t border-border bg-surface">
            {confirmCancel ? (
              <div className="space-y-2">
                <p className="text-sm text-ink font-medium text-center">Xác nhận hủy đơn #{order.code}?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmCancel(false)}
                    className="flex-1 border border-border text-ink-muted py-2.5 rounded-sm text-sm font-semibold hover:bg-surface-soft transition-colors"
                  >
                    Không
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={cancelMutation.isPending}
                    className="flex-1 bg-danger hover:bg-danger/90 text-white py-2.5 rounded-sm text-sm font-bold transition-colors disabled:opacity-60"
                  >
                    {cancelMutation.isPending ? "Đang hủy..." : "Xác nhận hủy"}
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                className="w-full border border-danger/40 text-danger hover:bg-danger/5 py-2.5 rounded-sm text-sm font-semibold transition-colors"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        )}
          </div>
        </div>
      </div>
    </>
  );
}
