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
            <Ticket className="w-5 h-5 text-brand" /> My Wallet
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
              Please login to view your vouchers.
            </div>
          )}

          {!isLoading && vouchers && vouchers.length === 0 && (
            <div className="text-center py-8 text-ink-muted text-sm">
              You don't have any vouchers yet.
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
                  <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-r border-border" />
                  <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-l border-border" />

                  {/* Phần thông tin */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-ink uppercase leading-none">
                        {voucher.code}
                      </span>
                      <span className="text-[11px] font-bold text-brand bg-brand/10 px-2 py-0.5 rounded-sm whitespace-nowrap shrink-0 flex items-center justify-center">
                        {voucher.discountType === "percent" &&
                          `${voucher.discountValue}% off`}
                        {voucher.discountType === "fixed" &&
                          `${voucher.discountValue.toLocaleString("vi-VN")}₫ off`}
                        {voucher.discountType === "freeship" && "Free Shipping"}
                      </span>
                    </div>
                    <p className="text-xs text-ink-muted line-clamp-2 mb-2">
                      Min. spend{" "}
                      {voucher.minOrderValue.toLocaleString("vi-VN")}₫.
                      {voucher.maxDiscount &&
                        ` Capped at ${voucher.maxDiscount.toLocaleString("vi-VN")}₫.`}
                    </p>

                    {/* Progress hoặc trạng thái */}
                    {!isEligible && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-danger font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Spend {diff.toLocaleString("vi-VN")}₫ more to use
                      </div>
                    )}
                    {isEligible && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-success font-medium">
                        Eligible to apply
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
                      Apply
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
