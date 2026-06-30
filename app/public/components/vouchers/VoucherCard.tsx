import { useState, useEffect } from "react";
import {
  Ticket,
  Tag,
  Truck,
  Copy,
  Check,
  Clock,
  AlertCircle,
  BadgeCheck,
} from "lucide-react";
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
    expiresAt?: string; // Thời gian giữ chỗ (TTL)
  };
}

function getStatus(
  voucher: VoucherCardProps["voucher"],
): "valid" | "used" | "expired" | "exhausted" | "pending" {
  // Nếu backend đã tính sẵn, dùng luôn
  if (voucher.status === "used") return "used";
  if (voucher.status === "expired" || voucher.status === "exhausted")
    return "expired";

  const now = new Date();
  if (voucher.startDate && new Date(voucher.startDate) > now) return "pending";
  if (new Date(voucher.endDate) < now) return "expired";
  if (
    voucher.usageLimit &&
    voucher.usedCount !== undefined &&
    voucher.usedCount >= voucher.usageLimit
  )
    return "exhausted";
  return "valid";
}

function getDaysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

export function VoucherCard({ voucher }: VoucherCardProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [isFomo, setIsFomo] = useState(false);

  useEffect(() => {
    const targetTime = voucher.expiresAt || voucher.endDate;
    if (!targetTime) return;

    const calculateTime = () => {
      const diff = new Date(targetTime).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        setIsFomo(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      );
      setIsFomo(diff < 5 * 60 * 1000); // Dưới 5 phút thì nhấp nháy đỏ
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [voucher.expiresAt]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success("Copied code " + voucher.code);
    setTimeout(() => setCopied(false), 2500);
  };

  const getDiscountDisplay = () => {
    if (voucher.discountType === "freeship") return "Free Shipping";
    if (voucher.discountType === "percent")
      return `${voucher.discountValue}% OFF`;
    return `${(voucher.discountValue / 1000).toLocaleString("en-US")}K OFF`;
  };

  const getIcon = () => {
    if (voucher.discountType === "freeship")
      return <Truck className="w-4 h-4" />;
    if (voucher.discountType === "percent") return <Tag className="w-4 h-4" />;
    return <Ticket className="w-4 h-4" />;
  };

  const status = getStatus(voucher);
  const daysLeft = getDaysLeft(voucher.endDate);
  const isExpiringSoon = daysLeft > 0 && daysLeft <= 3;
  const isDisabled = status !== "valid" && status !== "pending";

  const minOrderText =
    voucher.minOrderValue > 0
      ? `Min. spend ${(voucher.minOrderValue / 1000).toLocaleString("en-US")}K`
      : "No min. spend";

  // Label badge cho trạng thái bất thường
  const statusBadge: Record<string, { label: string; cls: string } | null> = {
    valid: null,
    pending: {
      label: "Upcoming",
      cls: "bg-amber-50 text-amber-600 border-amber-200",
    },
    used: {
      label: "Used",
      cls: "bg-blue-50 text-blue-500 border-blue-200",
    },
    expired: {
      label: "Expired",
      cls: "bg-red-50 text-red-500 border-red-200",
    },
    exhausted: {
      label: "Fully Claimed",
      cls: "bg-gray-50 text-gray-500 border-gray-200",
    },
  };

  const badge = statusBadge[status];

  return (
    <div
      className={`border rounded-sm flex flex-col relative overflow-visible transition-all ${isDisabled
          ? "bg-surface-soft border-border opacity-70 grayscale-[0.8]"
          : "bg-brand/5 border-brand/20"
        }`}
    >
      {/* Notch decoration */}
      <div
        className={`absolute top-1/2 -left-px w-2 h-4 rounded-r-full -translate-y-1/2 border border-l-0 ${isDisabled ? "bg-surface border-border" : "bg-white border-brand/20"}`}
      />
      <div
        className={`absolute top-1/2 -right-px w-2 h-4 rounded-l-full -translate-y-1/2 border border-r-0 ${isDisabled ? "bg-surface border-border" : "bg-white border-brand/20"}`}
      />

      <div className="p-4">
        {/* Status badge */}
        {badge && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border mb-2 ${badge.cls}`}
          >
            <AlertCircle className="w-2.5 h-2.5" />
            {badge.label}
          </span>
        )}

        {/* Title */}
        <div className="flex items-start justify-between gap-2">
          <span
            className={`font-black text-lg flex items-center gap-2 tracking-tight ${isDisabled ? "text-ink-muted" : "text-brand"}`}
          >
            {getIcon()} {voucher.title || getDiscountDisplay()}
          </span>
          {status === "valid" && (
            <BadgeCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
          )}
        </div>

        {/* Conditions */}
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-muted">
          {voucher.minOrderValue > 0 && (
            <span>Min. spend ${(voucher.minOrderValue / 1000).toLocaleString("en-US")}K</span>
          )}
          {voucher.maxDiscount && voucher.maxDiscount > 0 && (
            <>
              {voucher.minOrderValue > 0 && <span className="w-1 h-1 rounded-full bg-border/80 hidden sm:block"></span>}
              <span>Max ${(voucher.maxDiscount / 1000).toLocaleString("en-US")}K</span>
            </>
          )}
        </div>

        {/* Validity */}
        <div className="flex flex-wrap items-center gap-3 mt-2.5">
          {status === "pending" && voucher.startDate && (
            <span className="text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
              Valid from{" "}
              {new Date(voucher.startDate).toLocaleDateString("en-GB")}
            </span>
          )}

          {status !== "pending" && (
            <span
              className={`text-[11px] flex items-center gap-1.5 font-medium ${status === "expired" || status === "used"
                  ? "text-red-400"
                  : isFomo
                    ? "text-danger"
                    : "text-ink-muted"
                }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {status === "expired" || status === "used"
                ? `Ended`
                : `Expires in: ${timeLeft}`}
            </span>
          )}
        </div>

        {/* Code + Copy */}
        <div
          className={`mt-3 pt-3 border-t border-dashed ${isDisabled ? "border-border" : "border-brand/20"} flex justify-between items-center gap-2`}
        >
          <span
            className={`text-sm font-mono px-2 py-1 rounded tracking-widest uppercase ${isDisabled
                ? "bg-surface-muted text-ink-muted"
                : "bg-brand/10 text-brand"
              }`}
          >
            {voucher.code}
          </span>
          <button
            onClick={handleCopy}
            disabled={isDisabled}
            className={`text-xs font-bold px-3 py-1.5 rounded-sm transition-all flex items-center gap-1 ${copied
                ? "bg-success text-white"
                : isDisabled
                  ? "bg-surface-muted text-ink-muted cursor-default"
                  : "bg-brand text-white hover:bg-brand-dark"
              }`}
          >
            {copied ? (
              <Check className="w-3 h-3" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}
