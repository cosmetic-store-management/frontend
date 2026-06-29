import { useState } from "react";
import { Ticket, Tag, Truck, Gift, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import {
  useVouchers,
  useCollectVoucher,
  useGetWalletVouchers,
} from "../../hooks/useVoucher";
import { useAuthStore } from "@/auth/store/auth.store";
import { toast } from "@/lib/toast";
import type { Voucher } from "../../services/voucher.service";

function getVoucherMeta(voucher: Voucher) {
  if (voucher.discountType === "freeship") {
    return {
      icon: <Truck className="w-4 h-4" />,
      title: "Free Shipping",
      desc:
        voucher.minOrderValue > 0
          ? `Min ${(voucher.minOrderValue / 1000).toFixed(0)}K`
          : "All orders",
    };
  }
  if (voucher.discountType === "percent") {
    return {
      icon: <Tag className="w-4 h-4" />,
      title: `${voucher.discountValue}% off`,
      desc:
        voucher.maxDiscount && voucher.maxDiscount > 0
          ? `Min ${(voucher.minOrderValue / 1000).toFixed(0)}K • Max ${(voucher.maxDiscount / 1000).toFixed(0)}K`
          : voucher.minOrderValue > 0
            ? `Min ${(voucher.minOrderValue / 1000).toFixed(0)}K`
            : "Any order",
    };
  }
  return {
    icon: <Ticket className="w-4 h-4" />,
    title: `${(voucher.discountValue / 1000).toFixed(0)}K off`,
    desc:
      voucher.minOrderValue > 0
        ? `Min ${(voucher.minOrderValue / 1000).toFixed(0)}K`
        : "Any order",
  };
}

function HomeSingleVoucher({
  voucher,
  isSaved,
  onCollect,
  isLoading,
}: {
  voucher: Voucher;
  isSaved: boolean;
  onCollect: (code: string) => void;
  isLoading: boolean;
}) {
  const [justSaved, setJustSaved] = useState(false);
  const { icon, title, desc } = getVoucherMeta(voucher);

  const handleCollect = () => {
    if (isSaved || justSaved) return;
    onCollect(voucher.code);
    setJustSaved(true);
  };

  const saved = isSaved || justSaved;

  return (
    <div className="bg-brand/5 border border-brand/20 rounded-sm p-4 flex flex-col relative shrink-0 min-w-56 max-w-64 transition-colors hover:bg-brand/10">
      <div className="absolute top-1/2 -left-px w-2 h-4 bg-background rounded-r-full -translate-y-1/2 border border-l-0 border-brand/20" />
      <div className="absolute top-1/2 -right-px w-2 h-4 bg-background rounded-l-full -translate-y-1/2 border border-r-0 border-brand/20" />

      <span className="font-black text-brand text-xl flex items-center gap-2 leading-tight tracking-tight">
        {icon} {title}
      </span>
      <span className="text-[11px] text-ink-muted mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
        {desc}
      </span>

      <div className="mt-3.5 pt-3.5 border-t border-dashed border-brand/20 flex justify-between items-center gap-2">
        <span className="text-[11px] font-mono bg-brand/10 text-brand px-2 py-1 rounded-sm uppercase tracking-widest truncate">
          {voucher.code}
        </span>
        <button
          onClick={handleCollect}
          disabled={isLoading || saved}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 shrink-0 disabled:cursor-default ${
            saved
              ? "bg-success/10 text-success"
              : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-3 h-3" /> Saved
            </>
          ) : (
            <>
              <Gift className="w-3 h-3" /> Save
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export function HomeVouchers() {
  const { user } = useAuthStore();
  const { data: vouchers, isLoading } = useVouchers();
  const { data: walletVouchers } = useGetWalletVouchers();
  const collectMutation = useCollectVoucher();

  const savedCodes = new Set((walletVouchers || []).map((v: any) => v.code));

  const handleCollect = (code: string) => {
    if (!user) {
      toast.error("Sign in to save vouchers");
      return;
    }
    collectMutation.mutate(code, {
      onSuccess: () => toast.success("Voucher saved to your wallet!"),
      onError: (e: any) => {
        if (!e?.message?.includes("đã lưu")) {
          toast.error(e?.message || "Unable to save voucher");
        }
      },
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-gradient uppercase tracking-wider">
          Deals & Vouchers
        </h2>
        {user && (
          <Link
            to="/account?view=coupon"
            className="text-sm font-semibold text-brand underline flex items-center gap-1 transition-colors"
          >
            My wallet <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="min-w-45 h-22 bg-surface-soft border border-border rounded-sm animate-pulse shrink-0"
              />
            ))
          : vouchers!.map((v) => (
              <HomeSingleVoucher
                key={v.id}
                voucher={v}
                isSaved={savedCodes.has(v.code)}
                onCollect={handleCollect}
                isLoading={collectMutation.isPending}
              />
            ))}
      </div>
    </section>
  );
}
