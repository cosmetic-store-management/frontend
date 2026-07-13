import { TicketPercent, Clock, AlertCircle, Copy } from "lucide-react";
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
  savedStatus: string;
  onCollect: () => void;
  isLoading: boolean;
}

export function ProductVoucherModal({
  isOpen,
  onClose,
  voucher,
  savedStatus,
  onCollect,
  isLoading,
}: ProductVoucherModalProps) {
  if (!voucher) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.code);
    toast.success("Voucher code copied to clipboard!");
    onClose();
  };

  return (
    <BaseCrudModal
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      title=""
      size="sm"
      hideHeader={true}
      hideFooter={true}
    >
      <div className="pt-4 pb-2 flex flex-col items-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center mb-5">
          <TicketPercent className="w-8 h-8 text-brand" strokeWidth={1.5} />
        </div>

        {/* Titles */}
        <h3 className="text-2xl font-black text-ink mb-2 text-center tracking-tight">
          {voucher.title}
        </h3>
        <p className="text-sm text-ink-muted text-center mb-8 px-4 leading-relaxed">
          {voucher.description}
        </p>

        {/* Details Card */}
        <div className="w-full bg-surface-soft rounded-sm p-4 mb-6 space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Voucher Code
            </span>
            <span className="font-mono font-bold text-brand bg-brand/5 px-2.5 py-1 rounded-sm border border-brand/10">
              {voucher.code}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
              Valid Until
            </span>
            <div className="flex items-center gap-1.5 text-sm font-medium text-ink">
              <Clock className="w-4 h-4 text-ink-muted" />
              {voucher.expiry}
            </div>
          </div>
        </div>

        {/* Condition Alert */}
        {voucher.condition && (
          <div className="w-full flex items-start gap-2.5 bg-brand/5 text-brand text-xs px-4 py-3 rounded-sm mb-8 border border-brand/10">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">
              {voucher.condition}
            </span>
          </div>
        )}

        {/* Action Button */}
        {savedStatus === "valid" ? (
          <button
            onClick={handleCopy}
            className="w-full group flex items-center justify-center gap-2 bg-ink hover:bg-ink/90 text-surface font-bold py-3.5 rounded-sm transition-all uppercase text-sm tracking-wider shadow-sm hover:shadow-md"
          >
            <Copy className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Copy Code
          </button>
        ) : savedStatus === "expired" || savedStatus === "used" || savedStatus === "exhausted" ? (
          <button
            disabled
            className="w-full group flex items-center justify-center gap-2 bg-surface-muted text-ink-muted font-bold py-3.5 rounded-sm transition-all uppercase text-sm tracking-wider cursor-not-allowed"
          >
            {savedStatus === "used" ? "Used" : savedStatus === "exhausted" ? "Fully Claimed" : "Expired"}
          </button>
        ) : (
          <button
            onClick={onCollect}
            disabled={isLoading}
            className="w-full group flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-sm transition-all uppercase text-sm tracking-wider shadow-sm hover:shadow-md disabled:opacity-70"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <TicketPercent className="w-4 h-4 group-hover:scale-110 transition-transform" />
            )}
            {isLoading ? "Saving..." : "Save Voucher"}
          </button>
        )}
      </div>
    </BaseCrudModal>
  );
}
