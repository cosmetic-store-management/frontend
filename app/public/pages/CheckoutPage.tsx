import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/auth/hooks/usePublicAuth";
import { useCartStore } from "@/store/cart.store";
import {
  CreditCard,
  Banknote,
  Truck,
  MapPin,
  Loader2,
  QrCode,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { useOrderPreview, useCreateOrder } from "../hooks/useOrder";
import { createStripeIntent } from "../services/order.service";
import { useMyProfile } from "@/public/hooks/useUser";
import { useShopSettings } from "@/public/hooks/useShopSettings";
import {
  checkoutSchema,
  PAYMENT_METHODS,
  type CheckoutFormData,
} from "../schemas/checkout.schema";
import { StripePaymentModal } from "../components/checkout/StripePaymentModal";

const PAYMENT_ICON_MAP: Record<string, React.ReactNode> = {
  banknote: <Banknote className="w-5 h-5" />,
  qr: <QrCode className="w-5 h-5" />,
};

export function CheckoutPage() {
  const { user, isLoggedIn } = useAuth();
  const { items, clearCart, voucherCode } = useCartStore();
  const { settings } = useShopSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [usedPoints, setUsedPoints] = useState(0);

  const pageContainerClassName =
    "w-full max-w-300 mx-auto px-4 py-6 relative animate-page-enter";
  const summaryItemsClassName =
    "px-5 py-4 overflow-y-auto max-h-55 space-y-3";

  // Stripe states
  const [stripeModalOpen, setStripeModalOpen] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(
    null,
  );
  const [stripeOrderId, setStripeOrderId] = useState<string>("");
  const [stripeAmount, setStripeAmount] = useState<number>(0);

  // ── Tất cả hooks phải gọi trước conditional return ──────────────────
  const savedAddresses: any[] = user?.addresses || [];
  const defaultAddr =
    savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      receiverName: user?.name || "",
      phone: user?.phone || "",
      province: defaultAddr?.province || "",
      district: defaultAddr?.district || "",
      ward: defaultAddr?.ward || "",
      street: defaultAddr?.street || "",
      paymentMethod: "cod",
      note: "",
    },
  });

  const availableMethods = React.useMemo(() => {
    if (!settings) return PAYMENT_METHODS;
    return PAYMENT_METHODS.filter((method) => {
      if (method.value === "cod") return true;
      if (
        method.value === "bank" &&
        settings.bankName &&
        settings.bankAccountNumber
      )
        return true;
      if (method.value === "stripe") return true;
      return false;
    });
  }, [settings]);

  const idempotencyKeyRef = useRef(crypto.randomUUID());
  const previewMutation = useOrderPreview();
  const { data: liveProfile } = useMyProfile();
  const createOrderMutation = useCreateOrder();

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please sign in to checkout.");
      navigate("/login", { state: { from: location } });
    }
  }, [isLoggedIn, navigate, location]);

  // Redirect về cart nếu giỏ hàng trống — CHỈ khi chưa đặt hàng xong
  useEffect(() => {
    if (!orderPlaced && items.length === 0 && isLoggedIn) {
      navigate("/cart");
    }
  }, [items.length, orderPlaced, isLoggedIn, navigate]);

  // Sync address + user info vào form khi user/addresses load async
  useEffect(() => {
    if (user?.name) setValue("receiverName", user.name);
    if (user?.phone) setValue("phone", user.phone);
    if (defaultAddr) {
      setValue("province", defaultAddr.province || "");
      setValue("district", defaultAddr.district || "");
      setValue("ward", defaultAddr.ward || "");
      setValue("street", defaultAddr.street || "");
    }
    {
      /* eslint-disable-next-line  */
    }
  }, [
    user?.name,
    user?.phone,
    defaultAddr?.province,
    defaultAddr?.district,
    defaultAddr?.ward,
    defaultAddr?.street,
  ]);

  // Sync default payment method when settings load
  useEffect(() => {
    if (settings && availableMethods.length > 0) {
      const current = watch("paymentMethod");
      if (!availableMethods.some((m) => m.value === current)) {
        setValue("paymentMethod", availableMethods[0].value);
      }
    }
    {
      /* eslint-disable-next-line  */
    }
  }, [settings, availableMethods]);

  // Order preview debounced
  useEffect(() => {
    if (items.length === 0) return;
    const id = setTimeout(() => {
      previewMutation.mutate(
        {
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          voucherCode: voucherCode || "",
          usedPoints,
          channel: "online",
          province: defaultAddr?.province || "",
        },
        {
          onSuccess: (data) => setPreviewData(data),
          onError: (err: any) => {
            console.error("Preview Order Error:", err);
            // toast.error(`Lỗi tính tiền: ${err?.message || "Vui lòng thử lại"}`);
          },
        },
      );
    }, 350);
    return () => clearTimeout(id);
    {
      /* eslint-disable-next-line  */
    }
  }, [items, usedPoints, voucherCode]);

  // ── Guard sau tất cả hooks ───────────────────────────────────────────
  if (!isLoggedIn) return null;

  const paymentMethod = watch("paymentMethod");
  const userPoints = liveProfile?.points ?? user?.points ?? 0;
  const liveUserPoints = previewData?.userPoints ?? userPoints;
  const maxCanUse = Math.min(
    previewData?.maxPointsAllowed || 0,
    liveUserPoints,
  );

  const onSubmit = async (data: CheckoutFormData) => {
    console.log("SUBMITTING FORM", data);
    try {
      const res = await createOrderMutation.mutateAsync({
        receiverName: data.receiverName,
        phone: data.phone,
        province: data.province,
        district: data.district,
        ward: data.ward,
        street: data.street,
        paymentMethod: data.paymentMethod,
        voucherCode: voucherCode || "",
        usedPoints,
        note: data.note || "",
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        idempotencyKey: idempotencyKeyRef.current,
      });

      const orderCode = res.code || "GLOWUP";
      const finalTotal = res.totalAmount || previewData?.finalTotalAmount || 0;

      if (data.paymentMethod === "stripe") {
        try {
          const intentRes = await createStripeIntent(res.id);
          if (intentRes.clientSecret) {
            setStripeClientSecret(intentRes.clientSecret);
            setStripeOrderId(res.id);
            setStripeAmount(finalTotal);
            setStripeModalOpen(true);
            setOrderPlaced(true);
            // Không xóa giỏ hàng ở đây
            return; // Ngăn redirect về trang order-success
          }
        } catch (e) {
          console.error("Lỗi tạo intent Stripe", e);
          toast.error(
            "Không thể khởi tạo thanh toán Stripe. Vui lòng thử lại sau.",
          );
          return; // Thêm return để ngừng tiến trình
        }
      }

      setOrderPlaced(true);

      if (data.paymentMethod === "cod" || (data.paymentMethod as string) === "cash") {
        clearCart();
      }

      const targetRoute = ["bank", "transfer", "stripe", "qr"].includes(
        data.paymentMethod,
      )
        ? "payment"
        : "order-success";
      navigate(
        `/${targetRoute}/${orderCode}?method=${data.paymentMethod}&amount=${finalTotal}`,
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || err.message || "Đặt hàng thất bại",
      );
    }
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-xs text-danger mt-1">{msg}</p> : null;

  return (
    <div className={pageContainerClassName}>
      {/* Full-screen Loading Overlay to prevent any interaction during submission */}
      {createOrderMutation.isPending && (
        <div className="fixed inset-0 z-50 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-brand mb-4 drop-shadow-sm" />
          <p className="text-base font-bold text-ink drop-shadow-sm">
            Đang xử lý đơn hàng...
          </p>
          <p className="text-sm text-ink-muted mt-1 font-medium">
            Vui lòng không đóng trình duyệt lúc này
          </p>
        </div>
      )}

      <div id="debug-form-errors" className="hidden">
        {JSON.stringify(errors)}
      </div>
      <form
        id="checkout-form"
        onSubmit={handleSubmit(onSubmit, (errors) =>
          console.log("FORM VALIDATION ERRORS:", errors),
        )}
        className="w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] gap-4 items-start">
          {/* ══════════════════════════════════════════════════
              LEFT: 2 separate cards
          ══════════════════════════════════════════════════ */}
          <div className="flex flex-col gap-4">
            {/* ── Card 1: Thông tin + Địa chỉ ───────────────── */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <div className="p-5">
                {/* Header */}
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-brand">
                    <Truck className="w-4 h-4" />
                  </span>
                  <h2 className="font-bold text-sm text-ink uppercase tracking-wide">
                    Thông tin người nhận & Giao hàng
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Họ và tên */}
                  <div>
                    {/* eslint-disable-next-line  */}
                    <label className="text-xs font-semibold text-ink-muted block mb-1.5">
                      Họ và tên <span className="text-danger">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="receiverName"
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className="input-base"
                          placeholder="Nguyễn Văn A"
                        />
                      )}
                    />
                    <FieldError msg={errors.receiverName?.message} />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    {/* eslint-disable-next-line  */}
                    <label className="text-xs font-semibold text-ink-muted block mb-1.5">
                      Số điện thoại <span className="text-danger">*</span>
                    </label>
                    <Controller
                      control={control}
                      name="phone"
                      render={({ field }) => (
                        <input
                          {...field}
                          type="tel"
                          className="input-base"
                          placeholder="0901 234 567"
                        />
                      )}
                    />
                    <FieldError msg={errors.phone?.message} />
                  </div>

                  {/* Địa chỉ giao hàng */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      {/* eslint-disable-next-line  */}
                      <label className="text-xs font-semibold text-ink-muted">
                        Địa chỉ giao hàng <span className="text-danger">*</span>
                      </label>
                      <Link
                        to="/account?view=address"
                        className="flex items-center gap-1 text-xs font-semibold text-brand hover:text-brand-dark transition-colors"
                      >
                        Quản lý địa chỉ <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    {defaultAddr ? (
                      <div className="input-base cursor-default select-none bg-surface-soft text-ink-muted">
                        {[
                          defaultAddr.street,
                          defaultAddr.ward,
                          defaultAddr.district,
                          defaultAddr.province,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 py-6 text-center border border-dashed border-border rounded-xl bg-muted/40">
                        <MapPin className="w-7 h-7 text-muted-foreground/40" />
                        <div>
                          <p className="text-sm font-medium text-foreground mb-0.5">No delivery address</p>
                          <p className="text-xs text-muted-foreground">Please add an address to continue</p>
                        </div>
                        <Link
                          to="/account?view=address"
                          className="inline-flex items-center gap-1.5 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm"
                          style={{ background: "hsl(352, 72%, 52%)" }}
                        >
                          <ExternalLink className="w-3 h-3" /> Add address
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Ghi chú cho shipper */}
                  <div className="sm:col-span-2">
                    {/* eslint-disable-next-line  */}
                    <label className="text-xs font-semibold text-ink-muted block mb-1.5">
                      Ghi chú cho shipper
                    </label>
                    <Controller
                      control={control}
                      name="note"
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={3}
                          className="input-base resize-none"
                          placeholder="VD: Gọi trước khi giao, giao giờ hành chính…"
                        />
                      )}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 2: Phương thức thanh toán ─────────────── */}
            <div className="bg-white rounded-sm border border-border overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-5">
                  <span className="text-brand">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <h2 className="font-bold text-sm text-ink uppercase tracking-wide">
                    Phương thức thanh toán
                  </h2>
                </div>

                <Controller
                  control={control}
                  name="paymentMethod"
                  render={({ field: { onChange, value } }) => (
                    <div className="space-y-2">
                      {availableMethods.length === 0 ? (
                        <div className="text-sm text-ink-muted p-4 border border-border rounded-sm bg-surface-soft text-center">
                          Cửa hàng hiện chưa cấu hình phương thức thanh toán
                          nào.
                        </div>
                      ) : (
                        availableMethods.map((method) => (
                          <label
                            key={method.value}
                            className={`flex items-center gap-3 px-4 py-3 border rounded-sm cursor-pointer transition-colors ${
                              value === method.value
                                ? "border-brand bg-brand/5"
                                : "border-border hover:border-brand/40"
                            }`}
                          >
                            <input
                              type="radio"
                              value={method.value}
                              checked={value === method.value}
                              onChange={() => onChange(method.value)}
                              className="w-4 h-4 accent-brand"
                            />
                            <span
                              className={
                                value === method.value
                                  ? "text-brand"
                                  : "text-ink-muted"
                              }
                            >
                              {PAYMENT_ICON_MAP[method.icon]}
                            </span>
                            <div className="flex-1">
                              <div className="font-semibold text-ink text-sm">
                                {method.label}
                              </div>
                              <div className="text-xs text-ink-muted">
                                {method.description}
                              </div>
                            </div>
                            {value === method.value && (
                              <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                            )}
                          </label>
                        ))
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════
              RIGHT: Order summary — sticky
          ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-sm border border-border overflow-hidden sticky top-24">
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink uppercase tracking-wider">
                Đơn hàng
              </h2>
              <span className="text-xs text-ink-muted bg-surface-soft px-2 py-0.5 rounded-sm">
                {items.length} sản phẩm
              </span>
            </div>

            {/* Items */}
            <div className={summaryItemsClassName}>
              {/* Build map variantId → unitPrice từ backend (source of truth) */}
              {(() => {
                const priceMap: Record<string, number> = {};
                if (previewData?.items) {
                  for (const pi of previewData.items)
                    priceMap[pi.variantId] = pi.unitPrice;
                }
                return items.map((item) => (
                  <div key={item.variantId} className="flex gap-3">
                    <div className="relative shrink-0">
                      <div className="w-13 h-13 bg-surface-soft rounded-sm border border-border overflow-hidden">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-ink text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-ink text-xs line-clamp-2 leading-snug">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-ink-muted mt-0.5">
                        {item.variantName}
                      </p>
                      <p className="text-sm font-semibold text-ink mt-1">
                        {priceMap[item.variantId] != null
                          ? priceMap[item.variantId].toLocaleString("vi-VN") +
                            "₫"
                          : item.price.toLocaleString("vi-VN") + "₫"}
                      </p>
                    </div>
                  </div>
                ));
              })()}
            </div>

            {/* Price breakdown */}
            <div className="px-5 py-4 border-t border-border space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Tạm tính</span>
                <span className="font-medium text-ink">
                  {(
                    previewData?.subtotal ??
                    useCartStore.getState().getSubtotal()
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>

              {(previewData?.tierDiscountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand font-medium">
                    Chiết khấu hạng thẻ
                  </span>
                  <span className="font-medium text-brand">
                    -{previewData.tierDiscountAmount.toLocaleString("vi-VN")}₫
                  </span>
                </div>
              )}

              {(previewData?.voucherDiscountAmount ?? 0) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-brand font-medium">Mã giảm giá</span>
                  <span className="font-medium text-brand">
                    -{previewData.voucherDiscountAmount.toLocaleString("vi-VN")}
                    ₫
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-ink-muted">Phí vận chuyển</span>
                <span className="font-medium text-ink">
                  {previewData
                    ? previewData.shippingFee > 0
                      ? `${previewData.shippingFee.toLocaleString("vi-VN")}₫`
                      : "Miễn phí"
                    : "Đang tính..."}
                </span>
              </div>

              {/* Points */}
              <div className="pt-2 border-t border-border/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-ink">
                    Điểm GlowUp
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    Có:{" "}
                    <strong className="text-brand">
                      {liveUserPoints.toLocaleString("vi-VN")}
                    </strong>
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={usedPoints || ""}
                    onChange={(e) => {
                      let v = parseInt(e.target.value) || 0;
                      if (v < 0) v = 0;
                      const cap = maxCanUse;
                      if (v > cap) v = cap;
                      setUsedPoints(v);
                    }}
                    placeholder="0"
                    className="flex-1 bg-surface-soft border border-border rounded-sm py-1.5 px-2 text-xs focus:ring-1 focus:ring-brand focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setUsedPoints(maxCanUse)}
                    className="bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-sm hover:bg-brand-dark transition-colors"
                  >
                    Tối đa
                  </button>
                </div>
                {(previewData?.actualUsedPoints ?? 0) > 0 && (
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-ink-muted">Quy đổi điểm:</span>
                    <span className="font-bold text-brand">
                      -{previewData.actualUsedPoints.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                )}
                <p className="text-[10px] text-ink-muted mt-1">
                  * Tối đa {settings.maxPointsPct ?? 50}% hoá đơn
                </p>
              </div>
            </div>

            {/* Total + CTA */}
            <div className="px-5 py-4 border-t border-border space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="font-bold text-ink">Tổng cộng</span>
                <span className="text-2xl font-bold text-brand">
                  {(
                    previewData?.finalTotalAmount ??
                    useCartStore.getState().getTotal()
                  ).toLocaleString("vi-VN")}
                  ₫
                </span>
              </div>

              <button
                type="submit"
                disabled={createOrderMutation.isPending || !defaultAddr}
                className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-sm transition-colors flex justify-center items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {createOrderMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Đang xử lý...
                  </>
                ) : !defaultAddr ? (
                  "Vui lòng thêm địa chỉ giao hàng"
                ) : (
                  "Xác nhận đặt hàng"
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      <StripePaymentModal
        isOpen={stripeModalOpen}
        onClose={() => {
          // Khi đóng modal thủ công mà chưa thanh toán xong, có thể redirect user về trang quản lý đơn hàng
          // Hoặc để user tự đóng và bấm nút "Thanh toán lại" sau (nếu hỗ trợ)
          setStripeModalOpen(false);
          toast.info(
            "Bạn có thể thanh toán đơn hàng này sau trong mục Đơn mua.",
          );
          navigate("/account?view=orders");
        }}
        clientSecret={stripeClientSecret}
        orderId={stripeOrderId}
        amount={stripeAmount}
      />
    </div>
  );
}
