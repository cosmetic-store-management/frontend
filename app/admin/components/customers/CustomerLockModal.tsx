import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type CustomerLockModalProps = {
  target: { id: string; isActive: boolean } | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
};

export function CustomerLockModal({
  target,
  onClose,
  onConfirm,
  loading,
}: CustomerLockModalProps) {
  const open = !!target;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader className="pr-6">
          <DialogTitle>
            Xác nhận {target?.isActive ? "khóa" : "mở khóa"} tài khoản
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn {target?.isActive ? "khóa" : "mở khóa"} tài
            khoản này không?
          </DialogDescription>
        </DialogHeader>

        {target?.isActive && (
          <div className="bg-danger/10 text-danger text-sm border border-danger/20 p-3 rounded-sm">
            Khách hàng sẽ không thể đăng nhập hoặc mua sắm sau khi bị khóa.
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Huỷ
          </Button>
          <Button
            type="button"
            variant={target?.isActive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
