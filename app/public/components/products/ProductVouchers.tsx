import { useState } from "react";
import { ProductVoucherModal } from "./ProductVoucherModal";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import { useGetWalletVouchers, useCollectVoucher } from "../../hooks/useVoucher";
import { useAuthStore } from "@/auth/store/auth.store";
import { toast } from "@/lib/toast";

export function ProductVouchers() {
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const user = useAuthStore((s) => s.user);

  const { data: savedVouchers = [] } = useGetWalletVouchers();
  const savedVoucherMap = new Map(savedVouchers.map((v: any) => [v.code, v.status]));
  const collectMutation = useCollectVoucher();

  const handleCollect = (code: string) => {
    if (!user) {
      toast.error("Sign in to save vouchers");
      return;
    }
    collectMutation.mutate(code, {
      onSuccess: () => toast.success("Voucher saved to your wallet!"),
      onError: (e: any) => {
        if (!e?.message?.includes("đã lưu") && !e?.message?.includes("already saved")) {
          toast.error(e?.message || "Unable to save voucher");
        }
      },
    });
  };

  const { data: vouchers = [] } = useQuery({
    queryKey: ["public", "vouchers"],
    queryFn: async () => {
      const res = await apiClient.get<{ vouchers: any[] }>("/vouchers/public");
      return res.vouchers.map((v) => ({
        title:
          v.discountType === "percent"
            ? `${v.discountValue}% OFF`
            : v.discountType === "fixed"
              ? `${v.discountValue / 1000}K OFF`
              : "Free Shipping",
        code: v.code,
        expiry: v.endDate
          ? new Date(v.endDate).toLocaleDateString("vi-VN")
          : "No expiration",
        description: `Min. spend ${v.minOrderValue.toLocaleString()}đ`,
        condition: "Limited usage per customer",
        raw: v,
      }));
    },
  });

  return (
    <>
      <div className="flex items-start py-4 border-b border-border mt-2">
        <span className="text-sm text-ink mr-4 shrink-0 mt-1.5">{"Vouchers:"}</span>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2 items-center">
            {vouchers.map((v: any, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedVoucher(v)}
                className="relative bg-[#f4f7ff] hover:bg-[#ebf0fc] transition-colors h-8 px-4 flex items-center shrink-0 cursor-pointer"
              >
                {/* Left Cutout */}
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                {/* Right Cutout */}
                <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>

                <span className="text-[13px] font-bold text-[#1e40af]">
                  {v.title}
                </span>
              </button>
            ))}
            {vouchers.length === 0 && (
              <span className="text-sm text-ink-muted italic">{"No vouchers available"}</span>
            )}
          </div>
        </div>
      </div>

      <ProductVoucherModal
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        voucher={selectedVoucher}
        savedStatus={selectedVoucher ? savedVoucherMap.get(selectedVoucher.code) || "none" : "none"}
        onCollect={() => {
          if (selectedVoucher) handleCollect(selectedVoucher.code);
        }}
        isLoading={collectMutation.isPending}
      />
    </>
  );
}
