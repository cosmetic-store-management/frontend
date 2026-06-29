import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { toast } from "@/lib/toast";
import { useUpdateCustomerStatus } from "../../hooks/useCustomer";

interface CustomerLockModalProps {
  open: boolean;
  onClose: () => void;
  lockTarget: { id: string; isActive: boolean } | null;
}

export function CustomerLockModal({ open, onClose, lockTarget }: CustomerLockModalProps) {
  const updateStatusMutation = useUpdateCustomerStatus();

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={lockTarget?.isActive ? "Lock Account" : "Unlock Account"}
      size="sm"
      hideHeader={true}
      hideFooter={true}
    >
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 mb-4 ring-8 ${
            lockTarget?.isActive
              ? "bg-danger/10 ring-danger/5"
              : "bg-success/10 ring-success/5"
          }`}
        >
          {lockTarget?.isActive ? (
            <Lock className="w-7 h-7 text-danger" />
          ) : (
            <Unlock className="w-7 h-7 text-success" />
          )}
        </div>
        <h2 className="text-xl font-bold text-ink">
          {lockTarget?.isActive ? "Lock Account" : "Unlock Account"}
        </h2>
        <div className="text-[15px] text-ink-muted leading-relaxed mt-2">
          Are you sure you want to{" "}
          <strong
            className={lockTarget?.isActive ? "text-danger" : "text-success"}
          >
            {lockTarget?.isActive ? "lock" : "unlock"}
          </strong>{" "}
          this customer's account?
          {lockTarget?.isActive && (
            <span className="block mt-1">
              They will not be able to log in or place orders.
            </span>
          )}
        </div>
      </div>
      
      {/* We use our own footer to customize the button colors fully */}
      <div className="flex justify-end gap-3 pt-6 mt-2 border-t border-surface-muted -mx-6 -mb-6 px-6 pb-6 bg-surface/50">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="w-full sm:w-auto h-10 px-8 font-medium rounded-sm bg-white"
        >
          Cancel
        </Button>
        <Button
          variant="default"
          className={`w-full sm:w-auto h-10 px-8 font-medium rounded-sm text-white transition-colors ${
            lockTarget?.isActive
              ? "bg-danger hover:bg-danger/90"
              : "bg-success hover:bg-success/90"
          }`}
          onClick={async () => {
            if (!lockTarget) return;
            try {
              await updateStatusMutation.mutateAsync({
                id: lockTarget.id,
                isActive: !lockTarget.isActive,
              });
              toast.success(
                `Account ${
                  lockTarget.isActive ? "locked" : "unlocked"
                } successfully!`,
              );
              onClose();
            } catch (err: any) {
              toast.error(err.message || "Action failed!");
            }
          }}
          disabled={updateStatusMutation.isPending}
        >
          {updateStatusMutation.isPending ? "Processing..." : "Confirm"}
        </Button>
      </div>
    </BaseCrudModal>
  );
}
