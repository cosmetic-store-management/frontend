import { Ticket, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useGetWalletVouchers } from "../hooks/useVoucher";
import { cn } from "@/lib/utils";

interface VoucherWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  onApply: (code: string) => void;
}

export function VoucherWalletModal({
  isOpen,
  onClose,
  subtotal,
  onApply,
}: VoucherWalletModalProps) {
  const { data: vouchers, isLoading, error } = useGetWalletVouchers();

  return (
    <Dialog open={isOpen} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md w-[95vw] p-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border">
        <DialogHeader className="px-5 py-4 border-b border-border bg-surface shrink-0 flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-bold text-ink flex items-center gap-2">
            <Ticket className="w-5 h-5 text-brand" /> Kho Voucher
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 overflow-y-auto max-h-[60vh] bg-white space-y-4">
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-8 text-danger text-sm">
              Bạn cần đăng nhập để xem kho voucher.
            </div>
          )}

          {!isLoading && vouchers && vouchers.length === 0 && (
            <div className="text-center py-8 text-ink-muted text-sm">
              Bạn chưa có mã giảm giá nào.
            </div>
          )}

          {!isLoading &&
            vouchers &&
            vouchers.map((voucher) => {
              const isEligible = subtotal >= voucher.minOrderValue;
              const diff = voucher.minOrderValue - subtotal;

              return (
                <div
                  key={voucher.id}
                  className={cn(
                    "relative bg-surface border rounded-sm p-4 flex gap-4 transition-all shadow-ui-soft",
                    isEligible ? "border-brand/30" : "border-border opacity-75",
                  )}
                >
                  {/* Dấu cắt (Ticket notch) */}
                  <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-surface-soft rounded-full border-r border-border" />
                  <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-surface-soft rounded-full border-l border-border" />

                  {/* Phần thông tin */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-ink uppercase">
                        {voucher.code}
                      </span>
                      <span className="text-xs font-semibold text-brand bg-brand/10 px-2 py-0.5 rounded-sm">
                        {voucher.discountType === "percent" &&
                          `Giảm ${voucher.discountValue}%`}
                        {voucher.discountType === "fixed" &&
                          `Giảm ${voucher.discountValue.toLocaleString("vi-VN")}đ`}
                        {voucher.discountType === "freeship" && "Freeship"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-2 mb-2">
                      Đơn tối thiểu{" "}
                      {voucher.minOrderValue.toLocaleString("vi-VN")}đ.
                      {voucher.maxDiscount &&
                        ` Giảm tối đa ${voucher.maxDiscount.toLocaleString("vi-VN")}đ.`}
                    </p>

                    {/* Progress hoặc trạng thái */}
                    {!isEligible && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-danger font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Mua thêm {diff.toLocaleString("vi-VN")}đ để sử dụng
                      </div>
                    )}
                    {isEligible && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-success font-medium">
                        Đủ điều kiện áp dụng
                      </div>
                    )}
                  </div>

                  {/* Cột Áp dụng */}
                  <div className="flex flex-col justify-center border-l border-dashed border-border pl-4">
                    <Button
                      size="sm"
                      disabled={!isEligible}
                      className={cn(
                        "h-8 px-4 text-xs font-semibold",
                        isEligible
                          ? "bg-brand text-white hover:bg-brand-hover shadow-ui-soft"
                          : "bg-background text-ink-muted",
                      )}
                      onClick={() => {
                        if (isEligible) {
                          onApply(voucher.code);
                          onClose();
                        }
                      }}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
