import { useState } from "react";
import {
  Ticket,
  Tag,
  Truck,
  Check,
  Copy,
  Wallet,
  Gift,
  Clock,
  AlertCircle,
  LogIn,
} from "lucide-react";
import {
  useVouchers,
  useCollectVoucher,
  useUncollectVoucher,
  useGetWalletVouchers,
} from "../hooks/useVoucher";
import { useAuthStore } from "@/auth/store/auth.store";
import { Link } from "react-router";
import { toast } from "@/lib/toast";
import type { Voucher } from "../services/voucher.service";

function getVoucherMeta(voucher: Voucher) {
  if (voucher.discountType === "freeship") {
    return {
      icon: <Truck className="w-5 h-5" />,
      title: "Free shipping",
      badge: "FREESHIP",
      color: "text-sky-600 bg-sky-50 border-sky-200",
      badgeColor: "bg-sky-100 text-sky-700",
    };
  }
  if (voucher.discountType === "percent") {
    return {
      icon: <Tag className="w-5 h-5" />,
      title: `Discount ${voucher.discountValue}%`,
      badge: `${voucher.discountValue}%`,
      color: "text-brand bg-brand/5 border-brand/20",
      badgeColor: "bg-brand/10 text-brand",
    };
  }
  return {
    icon: <Ticket className="w-5 h-5" />,
    title: `Discount ${voucher.discountValue.toLocaleString("en-US")} ₫`,
    badge: `${voucher.discountValue.toLocaleString("en-US")} ₫`,
    color: "text-amber-600 bg-amber-50 border-amber-200",
    badgeColor: "bg-amber-100 text-amber-700",
  };
}

function VoucherCardFull({
  voucher,
  isSaved,
  onCollect,
  onUncollect,
  isLoading,
}: {
  voucher: Voucher;
  isSaved: boolean;
  onCollect: (code: string) => void;
  onUncollect: (code: string) => void;
  isLoading: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const { icon, title, badge, color, badgeColor } = getVoucherMeta(voucher);
  {
    /* eslint-disable-next-line  */
  }
  const now = new Date().getTime();
  const daysLeft = Math.ceil(
    (new Date(voucher.endDate).getTime() - now) / 86400000,
  );
  const isExpiringSoon = daysLeft <= 3 && daysLeft > 0;
  const usagePercent =
    voucher.usageLimit > 0
      ? Math.round((voucher.usedCount / voucher.usageLimit) * 100)
      : 0;
  const isFull =
    voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit;

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    setCopied(true);
    toast.success("Copied code " + voucher.code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`relative border rounded-sm flex overflow-hidden transition-all ${isFull ? "opacity-60" : ""} ${color}`}
    >
      {/* Notch left */}
      <div className="absolute left-[30%] -top-2 w-4 h-4 bg-surface-soft rounded-full border border-current opacity-30" />
      <div className="absolute left-[30%] -bottom-2 w-4 h-4 bg-surface-soft rounded-full border border-current opacity-30" />

      {/* Left icon column */}
      <div className="w-[30%] flex flex-col items-center justify-center py-5 border-r border-dashed border-current/30 shrink-0">
        <div className="w-12 h-12 rounded-full bg-current/10 flex items-center justify-center mb-2">
          {icon}
        </div>
        <span
          className={`text-[11px] font-black tracking-wider uppercase px-2 py-0.5 rounded-sm ${badgeColor}`}
        >
          {badge}
        </span>
      </div>

      {/* Right content */}
      <div className="flex-1 p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-ink text-sm">{title}</h3>
            <p className="text-xs text-ink-muted mt-0.5">
              Minimum order{" "}
              {voucher.minOrderValue > 0
                ? `${voucher.minOrderValue.toLocaleString("en-US")} ₫`
                : "0 ₫"}
              {voucher.maxDiscount &&
                voucher.maxDiscount > 0 &&
                ` · Max discount ${voucher.maxDiscount.toLocaleString("en-US")} ₫`}
            </p>
          </div>
        </div>

        {/* Progress bar for usage */}
        {voucher.usageLimit > 0 && (
          <div>
            <div className="flex justify-between text-[10px] text-ink-muted mb-1">
              <span>
                Used {voucher.usedCount}/{voucher.usageLimit}
              </span>
              <span>
                {isFull
                  ? "Sold out"
                  : `${voucher.usageLimit - voucher.usedCount} left`}
              </span>
            </div>
            <div className="h-1.5 bg-black/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-current/50 rounded-full transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mt-1 gap-2">
          {/* Expiry */}
          <div
            className={`flex items-center gap-1 text-[11px] ${isExpiringSoon ? "text-danger font-bold" : "text-ink-muted"}`}
          >
            <Clock className="w-3 h-3" />
            {isExpiringSoon
              ? `${daysLeft} days left`
              : `Expires: ${new Date(voucher.endDate).toLocaleDateString("en-US")}`}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              title="Copy code"
              className="flex items-center gap-1 text-[11px] font-mono bg-black/10 hover:bg-black/20 px-2 py-1 rounded transition-colors"
            >
              {copied ? (
                <Check className="w-3 h-3" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
              <span className="tracking-wider uppercase">{voucher.code}</span>
            </button>

            {!isFull && (
              <button
                onClick={() =>
                  isSaved ? onUncollect(voucher.code) : onCollect(voucher.code)
                }
                disabled={isLoading}
                className={`text-[11px] font-bold px-3 py-1 rounded-sm transition-all disabled:opacity-50 flex items-center gap-1 ${
                  isSaved
                    ? "bg-success/10 text-success hover:bg-danger/10 hover:text-danger border border-success/30"
                    : "bg-brand text-white hover:bg-brand-dark "
                }`}
              >
                {isSaved ? (
                  <>
                    <Check className="w-3 h-3" />{"Collected"}</>
                ) : (
                  <>
                    <Gift className="w-3 h-3" />{"Claim code"}</>
                )}
              </button>
            )}
            {isFull && (
              <span className="text-[11px] font-bold text-ink-muted border border-border px-3 py-1 rounded-sm">{"Sold out"}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VouchersPage() {
  const { user } = useAuthStore();
  const { data: publicVouchers, isLoading: loadingPublic } = useVouchers();
  const { data: walletVouchers, isLoading: loadingWallet } =
    useGetWalletVouchers();
  const collectMutation = useCollectVoucher();
  const uncollectMutation = useUncollectVoucher();

  const [tab, setTab] = useState<"all" | "wallet">("all");

  const savedCodes = new Set((walletVouchers || []).map((v: any) => v.code));

  const handleCollect = (code: string) => {
    if (!user) {
      toast.error("Please log in to save vouchers");
      return;
    }
    collectMutation.mutate(code, {
      onSuccess: () => toast.success("Voucher saved to your wallet!"),
      onError: (e: any) => toast.error(e?.message || "Unable to save voucher"),
    });
  };

  const handleUncollect = (code: string) => {
    uncollectMutation.mutate(code, {
      onSuccess: () => toast.success("Voucher removed from your wallet"),
      onError: (e: any) => toast.error(e?.message || "Something went wrong"),
    });
  };

  const isMutating = collectMutation.isPending || uncollectMutation.isPending;

  const displayedVouchers =
    tab === "all" ? publicVouchers || [] : walletVouchers || [];
  const isLoading = tab === "all" ? loadingPublic : loadingWallet;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
          style={{
            background: "hsl(352, 72%, 52%, 0.1)",
            color: "hsl(352, 72%, 52%)",
          }}
        >
          <Ticket className="w-7 h-7" />
        </div>
        <h1
          className="text-2xl md:text-3xl font-bold text-foreground"
          style={{
            fontFamily:
              "var(--font-display, 'Playfair Display', Georgia, serif)",
          }}
        >
          Voucher Store
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Collect vouchers and use them at checkout
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted border border-border rounded-sm p-1 mb-6 w-fit mx-auto">
        <button
          onClick={() => setTab("all")}
          className={`px-6 py-2 text-sm font-semibold rounded-sm transition-all ${
            tab === "all"
              ? "text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={tab === "all" ? { background: "hsl(352, 72%, 52%)" } : {}}
        >
          <span className="flex items-center gap-1.5">
            <Gift className="w-4 h-4" /> All vouchers
          </span>
        </button>
        <button
          onClick={() => setTab("wallet")}
          className={`px-6 py-2 text-sm font-semibold rounded-sm transition-all ${
            tab === "wallet"
              ? "text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          style={tab === "wallet" ? { background: "hsl(352, 72%, 52%)" } : {}}
        >
          <span className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4" />
            My wallet
            {walletVouchers && walletVouchers.length > 0 && (
              <span
                className="ml-1 min-w-4.5 h-4.5 inline-flex items-center justify-center text-[10px] font-black bg-white rounded-full px-1"
                style={{ color: "hsl(352, 72%, 52%)" }}
              >
                {walletVouchers.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Not logged in warning for wallet tab */}
      {tab === "wallet" && !user && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
            <LogIn className="w-8 h-8 text-brand" />
          </div>
          <p className="text-ink-muted text-sm">{"Log in to view your voucher wallet"}</p>
          <Link
            to="/auth/login"
            className="px-6 py-2.5 text-white font-bold rounded-sm hover:opacity-90 transition-all shadow-sm text-sm"
            style={{ background: "hsl(352, 72%, 52%)" }}
          >
            Sign in
          </Link>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-28 bg-surface-soft border border-border rounded-sm animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading &&
        (!displayedVouchers || displayedVouchers.length === 0) &&
        (tab === "all" || user) && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-surface-muted flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-ink-muted" />
            </div>
            <p className="text-ink-muted text-sm">
              {tab === "wallet"
                ? 'You have not saved any vouchers yet. Browse and save them in the "All vouchers" tab!'
                : "No vouchers are available yet."}
            </p>
            {tab === "wallet" && (
              <button
                onClick={() => setTab("all")}
                className="px-5 py-2 text-white rounded-sm font-semibold text-sm hover:opacity-90 transition-all shadow-sm"
                style={{ background: "hsl(352, 72%, 52%)" }}
              >
                Browse vouchers
              </button>
            )}
          </div>
        )}

      {/* Voucher list */}
      {!isLoading &&
        displayedVouchers &&
        displayedVouchers.length > 0 &&
        (tab === "all" || user) && (
          <div className="grid gap-4 sm:grid-cols-2">
            {displayedVouchers.map((v: Voucher) => (
              <VoucherCardFull
                key={v.id}
                voucher={v}
                isSaved={savedCodes.has(v.code)}
                onCollect={handleCollect}
                onUncollect={handleUncollect}
                isLoading={isMutating}
              />
            ))}
          </div>
        )}
    </div>
  );
}
