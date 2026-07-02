

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
      title="Reset password"
      size="sm"
      primaryActionText="Confirm"
      secondaryActionText="Cancel"
      onPrimaryAction={onConfirm}
      isLoading={isLoading}
      isDanger={true}
    >
      <div className="text-[15px] text-ink-muted leading-relaxed">{"The account password for"}<strong>{user.name}</strong>{`will be reset to
        the default value:`}<br />
        <br />
        <code className="bg-surface-muted px-2 py-1 rounded-sm text-brand font-bold text-sm">
          GlowUp@123456
        </code>
        <br />
        <br />{"Are you sure you want to reset it?"}</div>
    </BaseCrudModal>
  );
}
