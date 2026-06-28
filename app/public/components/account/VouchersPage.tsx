import { useState } from "react";
import { useAllWalletVouchers } from "@/public/hooks/useVoucher";
import { VoucherCard } from "@/public/components/VoucherCard";

type VoucherTab = "valid" | "used" | "expired";

export function VouchersPage() {
  const { data: allVouchers = [], isLoading } = useAllWalletVouchers();
  const [tab, setTab] = useState<VoucherTab>("valid");

  const validVouchers = allVouchers.filter((v: any) => v.status === "valid");
  const usedVouchers = allVouchers.filter((v: any) => v.status === "used");
  const expiredVouchers = allVouchers.filter(
    (v: any) => v.status === "expired" || v.status === "exhausted",
  );

  const TABS: { key: VoucherTab; label: string; count: number }[] = [
    { key: "valid", label: "Khả dụng", count: validVouchers.length },
    { key: "used", label: "Đã sử dụng", count: usedVouchers.length },
    { key: "expired", label: "Hết hạn", count: expiredVouchers.length },
  ];

  const activeVouchers =
    tab === "valid"
      ? validVouchers
      : tab === "used"
        ? usedVouchers
        : expiredVouchers;

  return (
    <div className="animate-slide-up bg-surface px-6 py-6 flex-1">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink mb-1">Kho Voucher</h2>
        <p className="text-xs text-ink-muted">Mã giảm giá đã lưu của bạn</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 border-b-2 -mb-px ${
              tab === t.key
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-ink"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span
                className={`inline-flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-bold rounded-full ${
                  tab === t.key
                    ? "bg-brand text-white"
                    : "bg-border/70 text-ink-muted"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
        </div>
      ) : activeVouchers.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-ink-muted">
            {tab === "valid"
              ? "Bạn chưa có mã khả dụng. Hãy lưu mã từ trang chủ!"
              : tab === "used"
                ? "Bạn chưa sử dụng mã giảm giá nào."
                : "Không có mã giảm giá đã hết hạn."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeVouchers.map((voucher: any) => (
            <VoucherCard
              key={voucher._id || voucher.id}
              voucher={{
                ...voucher,
                status: tab === "used" ? "expired" : undefined,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
