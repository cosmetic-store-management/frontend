import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { AlertCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { useUpdateCustomerStatus } from "../../hooks/useCustomer";
import { useState } from "react";

interface CustomerLockModalProps {
  open: boolean;
  onClose: () => void;
  lockTarget: { id: string; isActive: boolean } | null;
}

export function CustomerLockModal({ open, onClose, lockTarget }: CustomerLockModalProps) {
  const updateStatusMutation = useUpdateCustomerStatus();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const title = lockTarget?.isActive ? "Confirm Lock" : "Confirm Unlock";
  const description = lockTarget?.isActive 
    ? "Are you sure you want to lock this customer's account? They will not be able to log in or place orders."
    : "Are you sure you want to unlock this customer's account?";

  const handleConfirm = async () => {
    if (!lockTarget) return;
    setSubmitError(null);
    try {
      await updateStatusMutation.mutateAsync({
        id: lockTarget.id,
        isActive: !lockTarget.isActive,
      });
      toast.success(
        `Account ${lockTarget.isActive ? "locked" : "unlocked"} successfully!`,
      );
      onClose();
    } catch (err: any) {
      setSubmitError(err.message || "Action failed!");
    }
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(isOpen) => !isOpen && onClose()}
      title={title}
      size="sm"
      primaryActionText={updateStatusMutation.isPending ? "Loading..." : "Confirm"}
      secondaryActionText="Cancel"
      onPrimaryAction={handleConfirm}
      onSecondaryAction={onClose}
      isLoading={updateStatusMutation.isPending}
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
