import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { ProductVoucherModal } from "./ProductVoucherModal";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";

export function ProductVouchers() {
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  const { data: vouchers = [] } = useQuery({
    queryKey: ["public", "vouchers"],
    queryFn: async () => {
      const res = await apiClient.get<{ vouchers: any[] }>("/vouchers/public");
      return res.vouchers.map((v) => ({
        title:
          v.discountType === "percent"
            ? `Giảm ${v.discountValue}%`
            : v.discountType === "fixed"
              ? `Giảm ${v.discountValue / 1000}K`
              : "Freeship",
        code: v.code,
        expiry: v.endDate
          ? new Date(v.endDate).toLocaleDateString("vi-VN")
          : "Không thời hạn",
        description: `Áp dụng cho đơn từ ${v.minOrderValue.toLocaleString()}đ.`,
        condition: "Có giới hạn số lượt sử dụng",
        raw: v,
      }));
    },
  });

  return (
    <>
      <div className="flex items-center py-4 border-b border-border mt-2">
        <span className="text-sm text-ink mr-4 shrink-0">{i18next.t("Mã giảm giá:")}</span>

        <div className="flex-1 relative group overflow-x-auto no-scrollbar">
          <div className="flex flex-wrap gap-2 pb-2 pt-1 items-center min-w-max">
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
              <span className="text-sm text-ink-muted italic">{i18next.t("Đang cập nhật mã giảm giá...")}</span>
            )}
          </div>
        </div>
      </div>

      <ProductVoucherModal
        isOpen={!!selectedVoucher}
        onClose={() => setSelectedVoucher(null)}
        voucher={selectedVoucher}
      />
    </>
  );
}
