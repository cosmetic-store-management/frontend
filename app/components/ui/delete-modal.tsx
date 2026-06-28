import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

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
  cancelText = "Hủy",
  confirmText = "Xác nhận",
  loadingText = "Đang xử lý...",
  disableConfirm = false,
}: DeleteModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="animate-scale-in sm:max-w-[480px] p-6">
        <DialogHeader className="flex flex-row items-start gap-4 space-y-0 text-left">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-6 h-6 text-danger" />
          </div>
          <div className="space-y-2 flex-1">
            <DialogTitle className="text-xl font-bold text-ink">
              {title}
            </DialogTitle>
            <DialogDescription className="text-[15px] text-ink-muted leading-relaxed">
              {description}
            </DialogDescription>
          </div>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
          <div className="flex-1 w-full sm:w-auto min-w-0">
            {submitError && (
              <p className="text-sm font-medium text-danger text-left">
                {submitError}
              </p>
            )}
          </div>
          <div className="flex w-full sm:w-auto gap-3 shrink-0">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none h-10 px-6 font-medium text-ink bg-surface border-border hover:bg-surface-muted"
              onClick={onClose}
            >
              {cancelText}
            </Button>
            <Button
              variant="default"
              className="flex-1 sm:flex-none h-10 px-6 font-medium"
              onClick={onConfirm}
              disabled={loading || disableConfirm}
            >
              {loading ? loadingText : confirmText}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
