import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { BaseCrudModal } from "./base-crud-modal";

export type DeleteModalProps = {
  open: boolean;
  title?: string;
  description?: ReactNode;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  submitError?: string | null;
  cancelText?: string;
  confirmText?: string;
  loadingText?: string;
  disableConfirm?: boolean;
};

export default function DeleteModal({
  open,
  title = "Xác nhận xóa",
  description = "Bạn có chắc chắn muốn xoá dữ liệu này khỏi hệ thống? Hành động này không thể hoàn tác.",
  onClose,
  onConfirm,
  loading = false,
  submitError = null,
  cancelText = "Cancel",
  confirmText = "Confirm",
  loadingText = "Loading...",
  disableConfirm = false,
}: DeleteModalProps) {
  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={title}
      size="sm"
      primaryActionText={loading ? loadingText : confirmText}
      secondaryActionText={cancelText}
      onPrimaryAction={onConfirm}
      onSecondaryAction={onClose}
      isLoading={loading}
      isDisabled={disableConfirm}
      isDanger={true}
      hideHeader={true}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center shrink-0 mt-0.5">
          <AlertCircle className="w-5 h-5 text-danger" />
        </div>
        <div className="flex-1">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          <div className="mt-1.5 text-sm text-ink-muted leading-relaxed">
            {description}
          </div>

          {submitError && (
            <div className="w-full mt-4 p-3 bg-danger/10 text-danger rounded-sm text-sm font-medium border border-danger/20 text-left">
              {submitError}
            </div>
          )}
        </div>
      </div>
    </BaseCrudModal>
  );
}
