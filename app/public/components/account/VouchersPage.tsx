import { useState, useMemo } from "react";
import { Ticket } from "lucide-react";
import { useAllWalletVouchers } from "@/public/hooks/useVoucher";
import { VoucherCard } from "@/public/components/vouchers/VoucherCard";

export function VouchersPage() {
  const { data: allVouchers = [], isLoading } = useAllWalletVouchers();
  const [activeTab, setActiveTab] = useState<"valid" | "used" | "invalid">("valid");

  const filteredVouchers = useMemo(() => {
    return allVouchers.filter((v: any) => {
      if (activeTab === "valid") return v.status === "valid";
      if (activeTab === "used") return v.status === "used";
      if (activeTab === "invalid") return v.status === "expired" || v.status === "exhausted";
      return true;
    });
  }, [allVouchers, activeTab]);

  return (
    <div className="animate-slide-up bg-surface rounded-sm px-6 py-6 flex-1">
      <div className="mb-6">
        <h1 className="text-lg font-bold text-ink mb-1">Vouchers</h1>
        <p className="text-sm text-ink-muted">
          Manage your saved discount codes and vouchers.
        </p>
      </div>

      <div className="flex items-center border-b border-border/50 mb-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {[
          { key: "valid", label: "Valid" },
          { key: "used", label: "Used" },
          { key: "invalid", label: "Invalid" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === tab.key
                ? "border-brand text-brand"
                : "border-transparent text-ink-muted hover:text-brand"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
        </div>
      ) : filteredVouchers.length === 0 ? (
        <div className="text-center py-16">
          <Ticket className="w-10 h-10 text-border mx-auto mb-3" />
          <p className="text-sm text-ink-muted">
            You don't have any {activeTab} vouchers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-5">
          {filteredVouchers.map((voucher: any) => (
            <VoucherCard
              key={voucher._id || voucher.id}
              voucher={voucher}
            />
          ))}
        </div>
      )}
    </div>
  );
}
