import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createPortal } from "react-dom";

type DeleteModalProps = {
  open: boolean;
  loading?: boolean;
  submitError?: string | null;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export default function DeleteModal({
  open,
  loading = false,
  submitError = null,
  title = "Xác nhận xóa",
  description = "Bạn có chắc muốn xóa dữ liệu này? Hành động này không thể hoàn tác.",
  confirmText = "Xóa",
  cancelText = "Hủy",
  onClose,
  onConfirm,
}: DeleteModalProps) {
  if (!open) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/20 px-4 py-6">
      <button
        type="button"
        aria-label="Close overlay"
        onClick={onClose}
        className="absolute inset-0"
      />

      <div className="relative z-10 w-full max-w-md bg-surface shadow-ui-card sm:rounded-sm overflow-y-auto max-h-[90vh] p-6 sm:p-7">
        {/* Nút X */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-sm text-ink-muted transition-colors hover:bg-surface-soft hover:text-ink focus:outline-none focus:ring-2 focus:ring-brand"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Nội dung */}
        <div className="flex items-start gap-4 mt-1 mb-8 pr-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-danger/10 text-danger">
            <AlertCircle className="h-5 w-5" />
          </div>

          <div className="flex-1 space-y-2 mt-0.5">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-wrap">
              {description}
            </p>
          </div>
        </div>

        {/* Footer (Actions) */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
          <div className="flex-1 w-full sm:w-auto">
            {submitError && (
              <p className="text-sm font-medium text-danger truncate">{submitError}</p>
            )}
          </div>
          <div className="flex w-full sm:w-auto gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 sm:flex-none h-10 border-border bg-surface px-5 text-ink hover:bg-surface-soft shadow-sm"
            >
              {cancelText}
            </Button>

            <Button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 sm:flex-none h-10 bg-danger px-5 text-white shadow-sm hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-70 transition-colors"
            >
              {loading ? "Đang xử lý..." : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
