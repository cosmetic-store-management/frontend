import { useState, useRef, useEffect } from "react";
import { Ticket, Tag, Truck, Gift, Check, ChevronRight, ChevronLeft } from "lucide-react";
import { Link } from "react-router";
import {
  useVouchers,
  useCollectVoucher,
  useGetWalletVouchers,
} from "../../hooks/useVoucher";
import { useAuthStore } from "@/auth/store/auth.store";
import { toast } from "@/lib/toast";
import { useNavigate } from "react-router";
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
  savedStatus,
  onCollect,
  isLoading,
}: {
  voucher: Voucher;
  savedStatus: string;
  onCollect: (code: string) => void;
  isLoading: boolean;
}) {
  const [justSaved, setJustSaved] = useState(false);
  const { icon, title, desc } = getVoucherMeta(voucher);

  const handleCollect = () => {
    if (savedStatus !== "none" || justSaved) return;
    onCollect(voucher.code);
    setJustSaved(true);
  };

  const saved = savedStatus === "valid" || justSaved;
  const isExpired = savedStatus === "expired" || savedStatus === "used" || savedStatus === "exhausted";

  return (
    <div className={`border rounded-sm p-4 flex flex-col relative shrink-0 min-w-56 max-w-64 transition-colors ${
      isExpired ? "bg-surface-soft border-border opacity-70 grayscale-[0.8]" : "bg-brand/5 border-brand/20 hover:bg-brand/10"
    }`}>
      <div className={`absolute top-1/2 -left-px w-2 h-4 bg-background rounded-r-full -translate-y-1/2 border border-l-0 ${isExpired ? "border-border" : "border-brand/20"}`} />
      <div className={`absolute top-1/2 -right-px w-2 h-4 bg-background rounded-l-full -translate-y-1/2 border border-r-0 ${isExpired ? "border-border" : "border-brand/20"}`} />

      <span className={`font-black text-xl flex items-center gap-2 leading-tight tracking-tight ${isExpired ? "text-ink-muted" : "text-brand"}`}>
        {icon} {title}
      </span>
      <span className="text-[11px] text-ink-muted mt-1.5 whitespace-nowrap overflow-hidden text-ellipsis">
        {desc}
      </span>

      <div className={`mt-3.5 pt-3.5 border-t border-dashed flex justify-between items-center gap-2 ${isExpired ? "border-border" : "border-brand/20"}`}>
        <span className={`text-[11px] font-mono px-2 py-1 rounded-sm uppercase tracking-widest truncate ${isExpired ? "bg-surface-muted text-ink-muted" : "bg-brand/10 text-brand"}`}>
          {voucher.code}
        </span>
        <button
          onClick={handleCollect}
          disabled={isLoading || saved || isExpired}
          className={`text-[11px] font-bold px-3 py-1.5 rounded-sm transition-all flex items-center gap-1.5 shrink-0 disabled:cursor-default ${
            isExpired
              ? "bg-surface-muted text-ink-muted"
              : saved
                ? "bg-success/10 text-success"
                : "bg-brand text-white hover:bg-brand-dark"
          }`}
        >
          {isExpired ? (
             savedStatus === "used" ? "Used" : savedStatus === "exhausted" ? "Claimed" : "Expired"
          ) : saved ? (
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
  const navigate = useNavigate();

  const savedVoucherMap = new Map((walletVouchers || []).map((v: any) => [v.code, v.status]));

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScroll);
    };
  }, [vouchers]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleCollect = (code: string) => {
    if (!user) {
      navigate("/login?returnUrl=/");
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

      <div className="relative group">
        {/* Nút Left */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 md:-left-4 top-[40%] -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-border/50 text-ink hover:text-brand hover:border-brand hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous vouchers"
          >
            <ChevronLeft className="w-6 h-6 ml-[-2px]" strokeWidth={2} />
          </button>
        )}

        {/* Nút Right */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 md:-right-4 top-[40%] -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md border border-border/50 text-ink hover:text-brand hover:border-brand hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next vouchers"
          >
            <ChevronRight className="w-6 h-6 mr-[-2px]" strokeWidth={2} />
          </button>
        )}

        <div 
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-3 pb-2 no-scrollbar snap-x snap-mandatory pt-1 px-1 -mx-1"
        >
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="min-w-45 h-22 bg-surface-soft border border-border rounded-sm animate-pulse shrink-0 snap-start"
                />
              ))
            : (vouchers || []).map((v) => (
                <div key={v.id} className="snap-start shrink-0">
                  <HomeSingleVoucher
                    voucher={v}
                    savedStatus={savedVoucherMap.get(v.code) || "none"}
                    onCollect={handleCollect}
                    isLoading={collectMutation.isPending}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
