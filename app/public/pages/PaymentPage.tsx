import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  CheckCircle2,
  Copy,
  Loader2,
  Clock,
  ChevronLeft,
  Timer,
} from "lucide-react";
import { useSetting } from "@/public/hooks/useSetting";
import { useBanks } from "@/public/hooks/useBank";
import { useOrderTrack, useCancelCheckout } from "@/public/hooks/useOrder";
import { toast } from "@/lib/toast";
import { useCartStore } from "@/public/store/cart.store";
import DeleteModal from "@/components/ui/delete-modal";

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

  // Check and build dynamic QR URL (VietQR)
  const hasDynamicQrInfo = settings?.bankName && settings?.bankAccountNumber;
  const dynamicQrUrl = hasDynamicQrInfo
    ? `https://img.vietqr.io/image/${settings.bankName.trim()}-${settings.bankAccountNumber.trim()}-qr_only.png?amount=${amount}&addInfo=${encodeURIComponent(transferNote)}&accountName=${encodeURIComponent(settings.bankAccountName || "")}`
    : "";

  const finalQrUrl = dynamicQrUrl || settings?.bankQrCodeUrl;

  return (
    <div className="mx-auto max-w-105 bg-white rounded shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-8">
      {finalQrUrl && (
        <div className="flex flex-col items-center justify-center mb-8">
          <img
            src={finalQrUrl}
            alt="Bank Transfer QR Code"
            className="w-72 h-72 object-contain bg-white"
          />
          <p className="text-[13px] text-gray-500 mt-4">{"Open your banking app to scan the QR code"}</p>
        </div>
      )}
      <div className="space-y-4 pt-2">
        {[
          {
            label: "Bank",
            value:
              banks.find((b: any) => b.bin === settings?.bankName)?.shortName ||
              settings?.bankName ||
              "Not configured",
          },
          {
            label: "Account number",
            value: settings?.bankAccountNumber || "Not configured",
            copy: true,
          },
          {
            label: "Account holder",
            value: settings?.bankAccountName || "Not configured",
          },
          {
            label: "Amount",
            value: `${parseInt(amount || "0").toLocaleString("en-US")} ₫`,
          },
          {
            label: "Transfer note",
            value: transferNote,
            copy: true,
          },
        ].map(({ label, value, copy }) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="text-gray-500 shrink-0">{label}</span>
            <div className="flex items-center gap-1.5 font-bold text-gray-900">
              <span className="text-right">{value}</span>
              {copy && value !== "Not configured" && (
                <button
                  onClick={() => copyText(value)}
                  className="p-1 rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600 -mr-1"
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

export function PaymentPage() {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const paymentMethod = (searchParams.get("method") || "cod") as PaymentMethod;
  const amount = searchParams.get("amount") || "0";

  const { settings, isLoading: settingsLoading } = useSetting();
  const { data: banks = [] } = useBanks();

  const { data: orderTrack } = useOrderTrack(code || "", paymentMethod);

  const cancelCheckoutMutation = useCancelCheckout();

  const isPaid = orderTrack?.paymentStatus === "paid";
  const isCancelled = orderTrack?.orderStatus === "cancelled";
  const { clearCart } = useCartStore();

  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const hasAutoCancelled = useRef(false);
  const [isConfirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (isPaid) {
      clearCart();
    }
  }, [isPaid, clearCart]);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0 || isPaid || isCancelled) return;
    const timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isPaid, isCancelled]);

  // Auto-cancel when time expires
  useEffect(() => {
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
  }, [timeLeft, isPaid, isCancelled, code, cancelCheckoutMutation]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleBack = () => {
    if (!isPaid && !isCancelled && timeLeft > 0 && code) {
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

  return (
    <div className="w-full max-w-300 mx-auto px-4 py-8 sm:py-12 animate-page-enter">
      {/* Back Button */}
      <div className="mb-4 sm:mb-8">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{"Back"}</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto text-center">
        {/* Status Icon */}
        <div
          className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${paymentMethod === "bank" && !isPaid ? "bg-[#F3E8DF] text-[#D97706]" : "bg-green-100 text-green-600"}`}
        >
          {paymentMethod === "bank" && !isPaid ? (
            <Clock className="w-9 h-9" />
          ) : (
            <CheckCircle2 className="w-9 h-9" />
          )}
        </div>

        {/* Title */}
        <h1 className="text-[26px] font-bold text-gray-900 mb-3">
          {paymentMethod === "bank" && !isPaid
            ? "Order Pending Payment"
            : "Order Placed Successfully!"}
        </h1>
        <p className="text-gray-500 mb-8">
          {paymentMethod === "bank" && !isPaid
            ? "Please scan the QR code below to complete the payment."
            : "Thank you for choosing GlowUp. Your order has been received."}
        </p>

        {/* Bank Transfer Details */}
        {paymentMethod === "bank" &&
          (isPaid ? (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-sm overflow-hidden mx-auto max-w-105 p-8 animate-pulse-soft">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="font-bold text-green-700 text-xl mb-2">{"Payment Successful!"}</h3>
              <p className="text-sm text-green-800">{"We have received your bank transfer."}</p>
            </div>
          ) : settingsLoading ? (
            <div className="mt-8 flex items-center justify-center gap-2 text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">{"Loading bank information..."}</span>
            </div>
          ) : timeLeft <= 0 ? (
            <div className="mt-8 bg-red-50 border border-red-200 rounded-sm mx-auto max-w-105 p-8">
              <p className="text-red-600 font-bold mb-2">{"Payment Time Expired"}</p>
              <p className="text-sm text-red-500">{"Please place a new order."}</p>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 bg-brand text-white px-6 py-2 rounded-sm text-sm font-medium hover:bg-brand/90 transition-colors"
              >
                Back
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <BankTransferInfo
                orderCode={code || ""}
                amount={amount}
                settings={settings}
                banks={banks}
              />
              <div className="flex items-center gap-2 bg-[#fff7ed] text-[#ea580c] px-6 py-3 rounded-sm font-semibold text-[15px] w-full max-w-105 justify-center">
                <Timer className="h-4.5 w-4.5" strokeWidth={2.5} />
                <span>Order will expire in: {formatTime(timeLeft)}</span>
              </div>
            </div>
          ))}
      </div>

      {/* Cancel Confirmation Modal */}
      <DeleteModal
        open={isConfirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmCancelOrder}
        title="Confirm Leave"
        description="Are you sure you want to leave? The pending order will be cancelled and cannot be recovered."
        cancelText="Cancel"
        confirmText="Confirm"
      />
    </div>
  );
}
