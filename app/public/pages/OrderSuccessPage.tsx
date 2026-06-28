import { useNavigate, useParams, useSearchParams } from "react-router";
import {
  CheckCircle2,
  Banknote,
  Copy,
  ShoppingBag,
  ClipboardList,
  Loader2,
  Clock,
} from "lucide-react";
import { usePublicSettings } from "@/public/hooks/usePublicSettings";
import { toast } from "@/lib/toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient as api } from "@/lib/client";

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
  navigator.clipboard.writeText(text).then(() => toast.success("Đã sao chép!"));
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
    <div className="mt-8 bg-surface border border-brand/20 rounded-sm overflow-hidden max-w-md mx-auto shadow-ui-card">
      <div className="bg-brand/5 px-6 py-4 border-b border-brand/10 flex items-center gap-2">
        <Banknote className="w-5 h-5 text-brand" />
        <h3 className="font-bold text-brand">Thông tin chuyển khoản</h3>
      </div>
      <div className="p-6 space-y-4 text-sm">
        {finalQrUrl && (
          <div className="flex flex-col items-center justify-center mb-6">
            <img
              src={finalQrUrl}
              alt="QR Code Chuyển Khoản"
              className="w-64 h-64 sm:w-72 sm:h-72 object-contain rounded-sm border border-border/50 p-2 bg-white"
            />
            <p className="text-xs text-ink-muted mt-2">
              Mở app Ngân hàng để quét mã QR
            </p>
          </div>
        )}
        {[
          {
            label: "Ngân hàng",
            value:
              banks.find((b: any) => b.bin === settings?.bankName)?.shortName ||
              settings?.bankName ||
              "Chưa cấu hình",
          },
          {
            label: "Số tài khoản",
            value: settings?.bankAccountNumber || "Chưa cấu hình",
            copy: true,
          },
          {
            label: "Chủ tài khoản",
            value: settings?.bankAccountName || "Chưa cấu hình",
          },
          {
            label: "Số tiền",
            value: `${parseInt(amount || "0").toLocaleString("vi-VN")}₫`,
            highlight: true,
          },
          {
            label: "Nội dung CK",
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
              {copy && value !== "Chưa cấu hình" && (
                <button
                  onClick={() => copyText(value)}
                  className="p-1 rounded hover:bg-surface-soft transition-colors text-ink-muted hover:text-brand"
                  title="Sao chép"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="bg-warning/5 px-6 py-3 border-t border-warning/20">
        <p className="text-xs text-warning-dark font-medium">
          ⚠ Vui lòng chuyển khoản trong vòng <strong>24 giờ</strong>. Đơn hàng
          sẽ tự động hủy nếu không nhận được thanh toán.
        </p>
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

  const { data: settings, isLoading: settingsLoading } = usePublicSettings();
  const { data: banksData } = useQuery({
    queryKey: ["vietqr-banks"],
    queryFn: async () => {
      const res = await fetch("https://api.vietqr.io/v2/banks");
      return res.json();
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
  const banks = banksData?.data || [];

  const queryClient = useQueryClient();

  const { data: orderTrack } = useQuery({
    queryKey: ["order-track", code],
    queryFn: async () => {
      if (!code) return null;
      const res = await api.get<any>(`/orders/track/${code}`);
      return res.data?.order;
    },
    refetchInterval: (query) => {
      // Dừng poll nếu đã thanh toán
      return query.state.data?.paymentStatus === "paid" ? false : 3000;
    },
    enabled: paymentMethod === "bank" || paymentMethod === "qr",
  });

  const isPaid = orderTrack?.paymentStatus === "paid";

  const methodMeta: Record<
    PaymentMethod,
    { label: string; description: string; color: string }
  > = {
    cod: {
      label: "Thanh toán khi nhận hàng",
      description:
        "Shipper sẽ liên hệ bạn để xác nhận giao hàng. Vui lòng chuẩn bị tiền mặt.",
      color: "text-success",
    },
    bank: {
      label: "Chuyển khoản ngân hàng",
      description:
        "Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán.",
      color: "text-brand",
    },
    ewallet: { label: "Ví điện tử", description: "", color: "" },
    qr: { label: "Quét mã QR", description: "", color: "" },
    stripe: { label: "Thẻ quốc tế", description: "", color: "" },
    cash: { label: "Tiền mặt", description: "", color: "" },
    pos_card: { label: "Thẻ POS", description: "", color: "" },
    transfer: { label: "Chuyển khoản", description: "", color: "" },
  };

  const meta = methodMeta[paymentMethod] || methodMeta.cod;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center animate-page-enter">
      {/* Status Icon */}
      <div
        className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${paymentMethod === "bank" && !isPaid ? "bg-warning/10 text-warning" : "bg-success/10 text-success"}`}
      >
        {paymentMethod === "bank" && !isPaid ? (
          <Clock className="w-12 h-12" />
        ) : (
          <CheckCircle2 className="w-12 h-12" />
        )}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-ink mb-3">
        {paymentMethod === "bank" && !isPaid
          ? "Đơn hàng đang chờ thanh toán"
          : "Đặt hàng thành công!"}
      </h1>
      <p className="text-ink-muted mb-2">
        {paymentMethod === "bank" && !isPaid
          ? "Vui lòng quét mã QR bên dưới để hoàn tất thanh toán. Mã đơn hàng của bạn là:"
          : "Cảm ơn bạn đã tin tưởng GlowUp. Mã đơn hàng của bạn là:"}
      </p>
      <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-sm px-4 py-2 mb-4">
        <span className="font-mono font-bold text-ink text-lg">#{code}</span>
        <button
          onClick={() => copyText(`#${code}`)}
          className="text-ink-muted hover:text-brand transition-colors"
        >
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Payment Method Info */}
      <div className={`text-sm font-semibold mb-1 ${meta.color}`}>
        {meta.label}
      </div>
      <p className="text-ink-muted text-sm max-w-md mx-auto">
        {meta.description}
      </p>

      {/* Bank Transfer Details */}
      {paymentMethod === "bank" &&
        (isPaid ? (
          <div className="mt-8 bg-success/10 border border-success/30 rounded-sm overflow-hidden max-w-md mx-auto p-6 animate-pulse-soft">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <h3 className="font-bold text-success text-xl mb-1">
              Thanh toán thành công!
            </h3>
            <p className="text-sm text-ink">
              Hệ thống đã nhận được tiền chuyển khoản của bạn.
            </p>
          </div>
        ) : settingsLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-ink-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Đang tải thông tin ngân hàng...</span>
          </div>
        ) : (
          <BankTransferInfo
            orderCode={code || ""}
            amount={amount}
            settings={settings}
            banks={banks}
          />
        ))}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
        <button
          onClick={() => navigate("/account?view=orders")}
          className="btn-hover flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold py-3 px-8 rounded-sm transition-colors shadow-ui-soft"
        >
          <ClipboardList className="w-4 h-4" />
          Xem đơn hàng của tôi
        </button>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 border border-border text-ink-muted hover:text-ink hover:border-border-dark font-semibold py-3 px-8 rounded-sm transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          Tiếp tục mua sắm
        </button>
      </div>
    </div>
  );
}
