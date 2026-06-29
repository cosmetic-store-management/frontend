import { BaseCrudModal } from "@/components/ui/base-crud-modal";
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
    <BaseCrudModal
      open={!!user}
      onOpenChange={onOpenChange}
      title="Đặt lại mật khẩu"
      size="sm"
      primaryActionText="Xác nhận"
      secondaryActionText="Huỷ"
      onPrimaryAction={onConfirm}
      isLoading={isLoading}
      isDanger={true}
    >
      <div className="text-[15px] text-ink-muted leading-relaxed">
        Mật khẩu của tài khoản <strong>{user.name}</strong> sẽ được đặt lại về
        mặc định là:
        <br />
        <br />
        <code className="bg-surface-muted px-2 py-1 rounded-sm text-brand font-bold text-sm">
          GlowUp@123456
        </code>
        <br />
        <br />
        Bạn có chắc chắn muốn đặt lại không?
      </div>
    </BaseCrudModal>
  );
}
