import { X, Copy } from "lucide-react";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { toast } from "@/lib/toast";

interface VoucherData {
  title: string;
  code: string;
  expiry: string;
  description: string;
  condition: string;
}

interface ProductVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  voucher: VoucherData | null;
}

export function ProductVoucherModal({
  isOpen,
  onClose,
  voucher,
}: ProductVoucherModalProps) {
  if (!voucher) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    toast.success("Đã sao chép mã giảm giá!");
    onClose();
  };

  return (
    <BaseCrudModal
      open={isOpen}
      onOpenChange={onClose}
      title="Product Voucher"
      size="sm"
      hideHeader={true}
      hideFooter={true}
    >
      <div className="-m-6 relative">
        {/* Header */}
        <div className="bg-[#fff0f0] px-4 py-4 flex items-center justify-between relative">
          <h2 className="text-[#8b0000] font-bold text-base uppercase tracking-wide">
            Giảm giá đơn hàng
          </h2>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          <h3 className="text-xl font-bold text-ink mb-6">{voucher.title}</h3>

          <div className="w-full space-y-4 mb-6">
            <div className="flex items-center">
              <span className="text-ink-muted w-16 text-sm">Mã:</span>
              <div className="flex items-center gap-2 font-bold text-ink text-sm">
                {voucher.code}
                <button
                  onClick={handleCopy}
                  className="text-ink-muted hover:text-ink transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <span className="text-ink-muted w-16 text-sm">HSD:</span>
              <span className="font-bold text-ink text-sm">
                {voucher.expiry}
              </span>
            </div>
          </div>

          <div className="w-full text-sm text-ink-muted leading-relaxed mb-6">
            {voucher.description}
          </div>

          {voucher.condition && (
            <div className="w-full bg-[#e8f5e9] text-[#2e7d32] text-xs px-4 py-3 rounded-sm mb-6">
              {voucher.condition}
            </div>
          )}

          <button
            onClick={handleCopy}
            className="w-full bg-[#8b0000] hover:bg-[#700000] text-white font-bold py-3 rounded-sm transition-colors uppercase text-sm"
          >
            Sao chép
          </button>
        </div>
      </div>
    </BaseCrudModal>
  );
}
