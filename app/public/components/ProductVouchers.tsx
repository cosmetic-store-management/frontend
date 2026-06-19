import { useState } from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { ProductVoucherModal } from "./ProductVoucherModal";

export function ProductVouchers() {
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  // Mock vouchers for display matching Skinfood style
  const displayVouchers = [
    { 
      title: "Giảm 8%", 
      code: "349K", 
      expiry: "Không thời hạn",
      description: "Giảm 8% Tối đa 50,000đ khi mua đơn hàng tối thiểu 349,000đ",
      condition: "Có thể dùng chung với mã khác"
    },
    { 
      title: "Giảm 10%", 
      code: "WELCOME10", 
      expiry: "30/06/2026",
      description: "Giảm 10% Tối đa 100,000đ cho đơn hàng đầu tiên.",
      condition: "Chỉ áp dụng cho khách hàng mới"
    },
    { 
      title: "Freeship", 
      code: "FREESHIPXTRA", 
      expiry: "Không thời hạn",
      description: "Giảm 30k phí vận chuyển cho đơn từ 500k.",
      condition: "Có thể dùng chung với mã khác"
    },
  ];

  return (
    <>
      <div className="flex items-center py-4 border-b border-border mt-2">
        <span className="text-sm text-ink mr-4 shrink-0">
          Mã giảm giá:
        </span>
        
        {/* Wrap Container */}
        <div className="flex-1 relative group">
          <div className="flex flex-wrap gap-2 pb-2 pt-1 items-center">
            {displayVouchers.map((v, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedVoucher(v)}
                className="relative bg-[#f4f7ff] hover:bg-[#ebf0fc] transition-colors h-8 px-4 flex items-center shrink-0 cursor-pointer"
              >
                {/* Left Cutout */}
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                {/* Right Cutout */}
                <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                
                <span className="text-[13px] font-bold text-[#1e40af]">{v.title}</span>
              </button>
            ))}
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
