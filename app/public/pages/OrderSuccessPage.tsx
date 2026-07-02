import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  CheckCircle2,
  Banknote,
  Copy,
  ShoppingBag,
  ClipboardList,
  Loader2,
  Clock,
  ChevronLeft,
  Timer,
} from "lucide-react";
import { useSetting } from "@/public/hooks/useSetting";
import { toast } from "@/lib/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient as api } from "@/lib/client";
import DeleteModal from "@/components/ui/delete-modal";
import { useCartStore } from "@/public/store/cart.store";
import { useBanks } from "@/public/hooks/useBank";
import { useOrderTrack, useCancelCheckout } from "@/public/hooks/useOrder";

type PaymentMethod =
  | "cod"
  | "bank"
  | "ewallet"
  | "qr"
  | "stripe"
  | "cash"
  | "pos_card"
  | "transfer";

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
}

function BankTransferInfo({
  orderCode,
  amount,
  settings,
  banks,
}: {
  orderCode: string;
  amount: string;
  settings: any;
  banks: any[];
}) {
  const transferNote = `GLOWUP ${orderCode}`;

  // Kiểm tra và tạo URL QR động (VietQR)
  const hasDynamicQrInfo = settings?.bankName && settings?.bankAccountNumber;
  const dynamicQrUrl = hasDynamicQrInfo
    ? `https://img.vietqr.io/image/${settings.bankName.trim()}-${settings.bankAccountNumber.trim()}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(settings.bankAccountName || "")}`
    : "";

  const finalQrUrl = dynamicQrUrl || settings?.bankQrCodeUrl;

  return (
    <div className="mt-8 bg-card border border-brand/20 rounded-sm overflow-hidden max-w-md mx-auto shadow-md">
      <div
        className="px-6 py-4 border-b border-brand/10 flex items-center gap-2"
        style={{ background: "hsl(352, 72%, 52%, 0.05)" }}
      >
        <Banknote className="w-5 h-5" style={{ color: "hsl(352, 72%, 52%)" }} />
        <h3 className="font-bold" style={{ color: "hsl(352, 72%, 52%)" }}>
          Bank transfer details
        </h3>
      </div>
      <div className="p-6 space-y-4 text-sm">
        {finalQrUrl && (
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src={finalQrUrl}
              alt="QR Code"
              className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-sm border border-border/50 p-2 bg-white"
            />
            <p className="text-xs text-ink-muted mt-2">
              Open banking app to scan QR code
            </p>
          </div>
        )}
        {[
          {
            label: "Bank",
            value:
              banks.find((b: any) => b.bin === settings?.bankName)?.shortName ||
              settings?.bankName ||
              "Not configured",
          },
          {
            label: "Account Number",
            value: settings?.bankAccountNumber || "Not configured",
            copy: true,
          },
          {
            label: "Account Name",
            value: settings?.bankAccountName || "Not configured",
          },
          {
            label: "Amount",
            value: `${parseInt(amount || "0").toLocaleString("vi-VN")}₫`,
            highlight: true,
          },
          {
            label: "Transfer Note",
            value: transferNote,
            copy: true,
            highlight: true,
          },
        ].map(({ label, value, copy, highlight }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-ink-muted w-36 shrink-0">{label}</span>
            <div
              className={`flex items-center gap-2 font-semibold ${highlight ? "text-brand" : "text-ink"}`}
            >
              <span className="text-right">{value}</span>
              {copy && value !== "Not configured" && (
                <button
                  onClick={() => copyText(value)}
                  className="p-1 rounded hover:bg-surface-soft transition-colors text-ink-muted hover:text-brand"
                  title="Copy"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OrderSuccessPage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentMethod = (searchParams.get("method") || "cod") as PaymentMethod;
  const amount = searchParams.get("amount") || "0";

  const { settings, isLoading: settingsLoading } = useSetting();
  const { data: banks = [] } = useBanks();

  const queryClient = useQueryClient();

  const { data: orderTrack } = useOrderTrack(code || "", paymentMethod);
  const cancelCheckoutMutation = useCancelCheckout();

  const isPaid = orderTrack?.paymentStatus === "paid";
  const isCancelled = orderTrack?.orderStatus === "cancelled";

  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const hasAutoCancelled = useRef(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Clear cart if payment is confirmed via polling
    if (isPaid) {
      clearCart();
      if (window.location.pathname.startsWith("/payment")) {
        navigate(
          `/order-success/${code}?method=${paymentMethod}&amount=${amount}`,
          { replace: true },
        );
      }
    }

    // Clear cart if user lands directly on order-success (e.g. Stripe redirect)
    if (window.location.pathname.startsWith("/order-success")) {
      clearCart();
    }
  }, [isPaid, clearCart, navigate, code, paymentMethod, amount]);

  // Đếm ngược
  useEffect(() => {
    if (paymentMethod !== "bank" && paymentMethod !== "qr") return;
    if (timeLeft <= 0 || isPaid || isCancelled) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isPaid, isCancelled, paymentMethod]);

  // Hết giờ tự động hủy
  useEffect(() => {
    if (paymentMethod !== "bank" && paymentMethod !== "qr") return;
    if (
      timeLeft <= 0 &&
      !isPaid &&
      !isCancelled &&
      !hasAutoCancelled.current &&
      code
    ) {
      hasAutoCancelled.current = true;
      cancelCheckoutMutation.mutate(code);
    }
  }, [
    timeLeft,
    isPaid,
    isCancelled,
    code,
    paymentMethod,
    cancelCheckoutMutation,
  ]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleBack = () => {
    if (
      (paymentMethod === "bank" || paymentMethod === "qr") &&
      !isPaid &&
      !isCancelled &&
      timeLeft > 0 &&
      code
    ) {
      setConfirmOpen(true);
    } else {
      navigate(-1);
    }
  };

  const confirmCancelOrder = () => {
    setConfirmOpen(false);
    if (code) {
      cancelCheckoutMutation.mutate(code);
    }
    navigate(-1);
  };

  const methodMeta: Record<
    PaymentMethod,
    { label: string; description: string; color: string }
  > = {
    cod: {
      label: "Cash on Delivery",
      description:
        "The shipper will contact you to confirm delivery. Please prepare cash.",
      color: "text-success",
    },
    bank: {
      label: "Bank Transfer",
      description: "Your order will be processed once we confirm the payment.",
      color: "text-brand",
    },
    ewallet: { label: "E-wallet", description: "", color: "" },
    qr: { label: "QR Code", description: "", color: "" },
    stripe: { label: "Credit Card", description: "", color: "" },
    cash: { label: "Cash", description: "", color: "" },
    pos_card: { label: "POS Card", description: "", color: "" },
    transfer: { label: "Transfer", description: "", color: "" },
  };

  const meta = methodMeta[paymentMethod] || methodMeta.cod;

  return (
    <div className="max-w-300 w-full mx-auto px-4 py-8 sm:py-16 animate-page-enter">
      {/* Back Button */}
      {(paymentMethod === "bank" || paymentMethod === "qr") &&
        !isPaid &&
        !isCancelled && (
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-ink-muted hover:text-foreground transition-colors w-fit"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="text-sm font-medium">Back</span>
            </button>
          </div>
        )}

      {!((paymentMethod === "bank" || paymentMethod === "qr") && !isPaid) ? (
        <div className="max-w-2xl mx-auto text-center relative animate-fade-up">
          {/* Animated Success Icon */}
          <div className="w-24 h-24 bg-success/10 rounded-sm flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>

          <h1
            className="text-3xl font-bold text-foreground mb-3"
            style={{
              fontFamily:
                "var(--font-display, 'Playfair Display', Georgia, serif)",
            }}
          >
            Order Confirmed! 🎉
          </h1>
          <p className="text-ink-muted mb-8 max-w-md mx-auto">
            Thank you for shopping with GlowUp. Your order has been placed
            successfully and is being processed.
          </p>

          {/* Receipt Card */}
          <div className="bg-white rounded-sm p-6 shadow-sm border border-border mx-auto max-w-sm mb-10 text-left">
            <p className="text-xs text-ink-muted font-bold mb-1 uppercase tracking-widest">
              Order Reference
            </p>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl font-bold text-ink">
                #{code}
              </span>
              <button
                onClick={() => copyText(`#${code}`)}
                className="p-2 hover:bg-surface-muted rounded-sm transition-colors text-ink-muted hover:text-brand"
                title="Copy Order Code"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="h-px bg-border my-4"></div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-ink-muted font-medium">Payment Method</span>
              <span className={`font-semibold ${meta.color}`}>
                {meta.label}
              </span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigate("/account?view=orders")}
              className="btn-hover w-full sm:w-auto flex justify-center items-center gap-2 text-white font-bold py-3 px-8 rounded-sm transition-all shadow-sm hover:shadow-md active:scale-[0.99]"
              style={{ background: "hsl(352, 72%, 52%)" }}
            >
              <ClipboardList className="w-4 h-4" />
              View My Orders
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white hover:bg-surface-muted text-ink font-semibold py-3 px-8 rounded-sm transition-all active:scale-[0.99] border border-border"
            >
              <ShoppingBag className="w-4 h-4" />
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto text-center relative animate-fade-up">
          {/* Status Icon */}
          <div className="w-24 h-24 rounded-sm flex items-center justify-center mx-auto mb-6 bg-warning/10 text-warning">
            <Clock className="w-12 h-12" />
          </div>

          {/* Title */}
          <h1
            className="text-3xl font-bold text-foreground mb-3"
            style={{
              fontFamily:
                "var(--font-display, 'Playfair Display', Georgia, serif)",
            }}
          >
            Waiting for payment
          </h1>

          {/* Timer for bank transfer */}
          {!isCancelled && (
            <div className="flex items-center justify-center gap-2 text-warning font-bold mb-4 text-lg">
              <Timer className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
          {isCancelled && (
            <div className="text-danger font-bold mb-4 text-lg">
              Order cancelled due to payment timeout
            </div>
          )}

          <p className="text-ink-muted mb-6">
            Please scan the QR code below to complete your payment.
          </p>

          {/* Bank Transfer Details */}
          {settingsLoading ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-ink-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading bank details...</span>
            </div>
          ) : (
            <BankTransferInfo
              orderCode={code || ""}
              amount={amount}
              settings={settings}
              banks={banks}
            />
          )}
        </div>
      )}

      <DeleteModal
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmCancelOrder}
        title="Leave this page?"
        description="Are you sure you want to leave this page? Your pending order will be cancelled."
        cancelText="Cancel"
        confirmText="Yes, leave"
      />
    </div>
  );
}
