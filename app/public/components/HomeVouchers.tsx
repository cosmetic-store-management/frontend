import { useState } from "react";
import { Ticket, Tag, Truck, Gift, Check, ChevronRight } from "lucide-react";
import { Link } from "react-router";
import { usePublicVouchers, useCollectVoucher, useGetWalletVouchers } from "../hooks/useVoucher";
import { usePublicAuthStore } from "@/store";
import { toast } from "@/lib/toast";
import type { PublicVoucher } from "../services/voucher.service";

function getVoucherMeta(voucher: PublicVoucher) {
  if (voucher.discountType === "freeship") {
    return {
      icon: <Truck className="w-3.5 h-3.5" />,
      title: "Freeship",
      desc: voucher.minOrderValue > 0 ? `Đơn từ ${(voucher.minOrderValue / 1000).toFixed(0)}K` : "Tất cả đơn hàng",
    };
  }
  if (voucher.discountType === "percent") {
    return {
      icon: <Tag className="w-3.5 h-3.5" />,
      title: `Giảm ${voucher.discountValue}%`,
      desc: voucher.maxDiscount && voucher.maxDiscount > 0
        ? `Tối đa ${(voucher.maxDiscount / 1000).toFixed(0)}K`
        : voucher.minOrderValue > 0 ? `Đơn từ ${(voucher.minOrderValue / 1000).toFixed(0)}K` : "Mọi đơn hàng",
    };
  }
  return {
    icon: <Ticket className="w-3.5 h-3.5" />,
    title: `Giảm ${(voucher.discountValue / 1000).toFixed(0)}K`,
    desc: voucher.minOrderValue > 0 ? `Đơn từ ${(voucher.minOrderValue / 1000).toFixed(0)}K` : "Mọi đơn hàng",
  };
}

function HomeSingleVoucher({ voucher, isSaved, onCollect, isLoading }: {
  voucher: PublicVoucher;
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
    <div className="bg-brand/5 border border-brand/20 rounded-sm p-3 flex flex-col relative shrink-0 min-w-[180px] max-w-[220px]">
      <div className="absolute top-1/2 -left-2 w-4 h-4 bg-bg rounded-full -translate-y-1/2 border-r border-brand/20" />
      <div className="absolute top-1/2 -right-2 w-4 h-4 bg-bg rounded-full -translate-y-1/2 border-l border-brand/20" />

      <span className="font-bold text-brand text-sm flex items-center gap-1.5 leading-tight">
        {icon} {title}
      </span>
      <span className="text-[10px] text-ink-muted mt-0.5">{desc}</span>

      <div className="mt-2.5 pt-2.5 border-t border-dashed border-brand/20 flex justify-between items-center gap-1">
        <span className="text-[9px] font-mono bg-brand/10 text-brand px-1.5 py-0.5 rounded uppercase tracking-widest truncate">
          {voucher.code}
        </span>
        <button
          onClick={handleCollect}
          disabled={isLoading || saved}
          className={`text-[10px] font-bold px-2.5 py-1 rounded-sm transition-all flex items-center gap-1 shrink-0 disabled:cursor-default ${
            saved
              ? "bg-success/10 text-success"
              : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          {saved ? <><Check className="w-2.5 h-2.5" /> Đã lưu</> : <><Gift className="w-2.5 h-2.5" /> Lưu mã</>}
        </button>
      </div>
    </div>
  );
}

export function HomeVouchers() {
  const { user } = usePublicAuthStore();
  const { data: vouchers, isLoading } = usePublicVouchers();
  const { data: walletVouchers } = useGetWalletVouchers();
  const collectMutation = useCollectVoucher();

  const savedCodes = new Set((walletVouchers || []).map((v: any) => v.code));



  const handleCollect = (code: string) => {
    if (!user) {
      toast.error("Vui lòng đăng nhập để lưu mã giảm giá");
      return;
    }
    collectMutation.mutate(code, {
      onSuccess: () => toast.success("Đã lưu vào Kho Voucher của bạn!"),
      onError: (e: any) => {
        if (!e?.message?.includes("đã lưu")) {
          toast.error(e?.message || "Không thể lưu mã");
        }
      },
    });
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-black text-ink uppercase tracking-wider">
          Mã Giảm Giá
        </h2>
        {user && (
          <Link
            to="/account?view=coupon"
            className="text-sm font-semibold text-brand underline flex items-center gap-1 transition-colors"
          >
            Kho của tôi <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar">
        {isLoading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="min-w-[180px] h-[88px] bg-surface-soft border border-border rounded-sm animate-pulse shrink-0" />
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
