import { useState } from "react";
import { Ticket, Tag, Truck, Copy, Check, Clock, AlertCircle, BadgeCheck } from "lucide-react";
import { toast } from "@/lib/toast";

interface VoucherCardProps {
  voucher: {
    id?: string;
    code: string;
    discountType: "percent" | "fixed" | "freeship" | "amount";
    discountValue: number;
    minOrderValue: number;
    maxDiscount?: number;
    startDate?: string;
    endDate: string;
    usageLimit?: number;
    usedCount?: number;
    isActive?: boolean;
    title?: string;
    /** status được inject từ wallet/all endpoint */
    status?: "valid" | "used" | "expired" | "exhausted";
  };
}

function getStatus(voucher: VoucherCardProps["voucher"]): "valid" | "used" | "expired" | "exhausted" | "pending" {
  // Nếu backend đã tính sẵn, dùng luôn
  if (voucher.status === "used") return "used";
  if (voucher.status === "expired" || voucher.status === "exhausted") return "expired";

  const now = new Date();
  if (voucher.startDate && new Date(voucher.startDate) > now) return "pending";
  if (new Date(voucher.endDate) < now) return "expired";
  if (voucher.usageLimit && voucher.usedCount !== undefined && voucher.usedCount >= voucher.usageLimit) return "exhausted";
  return "valid";
}

function getDaysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

export function VoucherCard({ voucher }: VoucherCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success("Đã sao chép mã " + voucher.code);
    setTimeout(() => setCopied(false), 2500);
  };

  const getDiscountDisplay = () => {
    if (voucher.discountType === "freeship") return "Miễn phí vận chuyển";
    if (voucher.discountType === "percent") return `Giảm ${voucher.discountValue}%`;
    return `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`;
  };

  const getIcon = () => {
    if (voucher.discountType === "freeship") return <Truck className="w-4 h-4" />;
    if (voucher.discountType === "percent") return <Tag className="w-4 h-4" />;
    return <Ticket className="w-4 h-4" />;
  };

  const status = getStatus(voucher);
  const daysLeft = getDaysLeft(voucher.endDate);
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 3;
  const isDisabled = status !== "valid" && status !== "pending";

  const minOrderText = voucher.minOrderValue > 0
    ? `Đơn tối thiểu ${voucher.minOrderValue.toLocaleString("vi-VN")}đ`
    : "Không giới hạn đơn tối thiểu";

  // Label badge cho trạng thái bất thường
  const statusBadge: Record<string, { label: string; cls: string } | null> = {
    valid: null,
    pending: { label: "Chưa đến hạn", cls: "bg-amber-50 text-amber-600 border-amber-200" },
    used: { label: "Đã sử dụng", cls: "bg-blue-50 text-blue-500 border-blue-200" },
    expired: { label: "Đã hết hạn", cls: "bg-red-50 text-red-500 border-red-200" },
    exhausted: { label: "Đã hết lượt", cls: "bg-gray-50 text-gray-500 border-gray-200" },
  };

  const badge = statusBadge[status];

  return (
    <div className={`border rounded-sm flex flex-col relative overflow-visible transition-all ${
      isDisabled
        ? "bg-surface-soft border-border opacity-60"
        : "bg-brand/5 border-brand/20"
    }`}>
      {/* Notch decoration */}
      <div className={`absolute top-1/2 -left-2 w-4 h-4 rounded-full -translate-y-1/2 border-r ${isDisabled ? "bg-surface border-border" : "bg-white border-brand/20"}`} />
      <div className={`absolute top-1/2 -right-2 w-4 h-4 rounded-full -translate-y-1/2 border-l ${isDisabled ? "bg-surface border-border" : "bg-white border-brand/20"}`} />

      <div className="p-4">
        {/* Status badge */}
        {badge && (
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border mb-2 ${badge.cls}`}>
            <AlertCircle className="w-2.5 h-2.5" />
            {badge.label}
          </span>
        )}

        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <span className={`font-bold text-base flex items-center gap-1.5 ${isDisabled ? "text-ink-muted" : "text-brand"}`}>
            {getIcon()} {voucher.title || getDiscountDisplay()}
          </span>
          {status === "valid" && <BadgeCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />}
        </div>

        {/* Conditions */}
        <span className="text-xs text-ink-muted mt-1 block">{minOrderText}</span>
        {voucher.maxDiscount && voucher.maxDiscount > 0 && (
          <span className="text-xs text-ink-muted block">Tối đa {voucher.maxDiscount.toLocaleString("vi-VN")}đ</span>
        )}

        {/* Validity */}
        <div className="flex items-center gap-3 mt-2">
          {voucher.startDate && (
            <span className="text-[10px] text-ink-muted">
              Từ: {new Date(voucher.startDate).toLocaleDateString("vi-VN")}
            </span>
          )}
          <span className={`text-[10px] flex items-center gap-0.5 font-medium ${
            status === "expired" ? "text-red-400" : isExpiringSoon ? "text-danger" : "text-ink-muted"
          }`}>
            <Clock className="w-2.5 h-2.5" />
            {status === "expired" || status === "used"
              ? `HSD: ${new Date(voucher.endDate).toLocaleDateString("vi-VN")}`
              : isExpiringSoon
                ? `Còn ${daysLeft} ngày`
                : `HSD: ${new Date(voucher.endDate).toLocaleDateString("vi-VN")}`
            }
          </span>
          {voucher.usageLimit !== undefined && voucher.usageLimit > 0 && (
            <span className="text-[10px] text-ink-muted">
              Còn {Math.max(0, voucher.usageLimit - (voucher.usedCount || 0))}/{voucher.usageLimit} lượt
            </span>
          )}
        </div>

        {/* Code + Copy */}
        <div className={`mt-3 pt-3 border-t border-dashed ${isDisabled ? "border-border" : "border-brand/20"} flex justify-between items-center gap-2`}>
          <span className={`text-sm font-mono px-2 py-1 rounded tracking-widest uppercase ${
            isDisabled ? "bg-surface-muted text-ink-muted" : "bg-brand/10 text-brand"
          }`}>
            {voucher.code}
          </span>
          <button
            onClick={handleCopy}
            disabled={isDisabled}
            className={`text-xs font-bold px-3 py-1.5 rounded-sm transition-all flex items-center gap-1 ${
              copied
                ? "bg-success text-white"
                : isDisabled
                  ? "bg-surface-muted text-ink-muted cursor-default"
                  : "bg-brand text-white hover:bg-brand-dark"
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Đã sao chép" : "Sao chép"}
          </button>
        </div>
      </div>
    </div>
  );
}
