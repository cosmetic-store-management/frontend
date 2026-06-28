import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { User } from "@/admin/types/user";

interface StaffResetPasswordModalProps {
  user: User | null;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function StaffResetPasswordModal({
  user,
  isLoading,
  onOpenChange,
  onConfirm,
}: StaffResetPasswordModalProps) {
  if (!user) return null;

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="animate-scale-in max-w-sm text-left">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-ink">
            Đặt lại mật khẩu
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted mt-2">
            Mật khẩu của tài khoản <strong>{user.name}</strong> sẽ được đặt lại
            về mặc định là:
            <br />
            <br />
            <code className="bg-surface-muted px-2 py-1 rounded-sm text-brand font-bold text-sm">
              GlowUp@123456
            </code>
            <br />
            <br />
            Bạn có chắc chắn muốn đặt lại không?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Huỷ
          </Button>
          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : null}
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
