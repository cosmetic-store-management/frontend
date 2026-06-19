import { useNavigate, useParams, useSearchParams } from "react-router";
import { CheckCircle2, Banknote, Copy, ShoppingBag, ClipboardList, Loader2 } from "lucide-react";
import { usePublicSettings } from "@/public/hooks/usePublicSettings";
import { toast } from "@/lib/toast";

type PaymentMethod = "cod" | "bank" | "vnpay";

function copyText(text: string) {
  navigator.clipboard.writeText(text).then(() => toast.success("Đã sao chép!"));
}

function BankTransferInfo({ orderCode, amount, settings }: { orderCode: string; amount: string; settings: any }) {
  const transferNote = `GLOWUP ${orderCode}`;

  return (
    <div className="mt-8 bg-surface border border-brand/20 rounded-sm overflow-hidden max-w-md mx-auto shadow-ui-card">
      <div className="bg-brand/5 px-6 py-4 border-b border-brand/10 flex items-center gap-2">
        <Banknote className="w-5 h-5 text-brand" />
        <h3 className="font-bold text-brand">Thông tin chuyển khoản</h3>
      </div>
      <div className="p-6 space-y-4 text-sm">
        {[
          { label: "Ngân hàng", value: settings?.bankName || "Chưa cấu hình" },
          { label: "Số tài khoản", value: settings?.bankAccountNumber || "Chưa cấu hình", copy: true },
          { label: "Chủ tài khoản", value: settings?.bankAccountName || "Chưa cấu hình" },
          { label: "Số tiền", value: `${parseInt(amount || "0").toLocaleString("vi-VN")}₫`, highlight: true },
          { label: "Nội dung CK", value: transferNote, copy: true, highlight: true },
        ].map(({ label, value, copy, highlight }) => (
          <div key={label} className="flex items-center justify-between gap-3">
            <span className="text-ink-muted w-36 shrink-0">{label}</span>
            <div className={`flex items-center gap-2 font-semibold ${highlight ? "text-brand" : "text-ink"}`}>
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
          ⚠ Vui lòng chuyển khoản trong vòng <strong>24 giờ</strong>. Đơn hàng sẽ tự động hủy nếu không nhận được thanh toán.
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

  const methodMeta: Record<PaymentMethod, { label: string; description: string; color: string }> = {
    cod: {
      label: "Thanh toán khi nhận hàng",
      description: "Shipper sẽ liên hệ bạn để xác nhận giao hàng. Vui lòng chuẩn bị tiền mặt.",
      color: "text-success",
    },
    bank: {
      label: "Chuyển khoản ngân hàng",
      description: "Đơn hàng sẽ được xử lý sau khi chúng tôi xác nhận thanh toán.",
      color: "text-brand",
    },
    vnpay: {
      label: "VNPay",
      description: "Thanh toán của bạn đã được ghi nhận thành công.",
      color: "text-[#005BAA]",
    },
  };

  const meta = methodMeta[paymentMethod] || methodMeta.cod;

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl text-center animate-page-enter">
      {/* Success Icon */}
      <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-12 h-12 text-success" />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-ink mb-3">Đặt hàng thành công!</h1>
      <p className="text-ink-muted mb-2">
        Cảm ơn bạn đã tin tưởng GlowUp. Mã đơn hàng của bạn là:
      </p>
      <div className="inline-flex items-center gap-2 bg-surface border border-border rounded-sm px-4 py-2 mb-4">
        <span className="font-mono font-bold text-ink text-lg">#{code}</span>
        <button onClick={() => copyText(`#${code}`)} className="text-ink-muted hover:text-brand transition-colors">
          <Copy className="w-4 h-4" />
        </button>
      </div>

      {/* Payment Method Info */}
      <div className={`text-sm font-semibold mb-1 ${meta.color}`}>{meta.label}</div>
      <p className="text-ink-muted text-sm max-w-md mx-auto">{meta.description}</p>

      {/* Bank Transfer Details */}
      {paymentMethod === "bank" && (
        settingsLoading ? (
          <div className="mt-8 flex items-center justify-center gap-2 text-ink-muted">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Đang tải thông tin ngân hàng...</span>
          </div>
        ) : (
          <BankTransferInfo orderCode={code || ""} amount={amount} settings={settings} />
        )
      )}

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
