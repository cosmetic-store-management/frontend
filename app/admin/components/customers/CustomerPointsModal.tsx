import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useAdjustPoints } from "../../hooks/useCustomer";
import type { Customer } from "@/admin/services/user.service";
import {
  adjustPointsSchema,
  type AdjustPointsFormData,
} from "../../schemas/customer.schema";

interface CustomerPointsModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerPointsModal({ open, onClose, customer }: CustomerPointsModalProps) {
  const adjustPointsMutation = useAdjustPoints();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustPointsFormData>({
    resolver: zodResolver(adjustPointsSchema) as any,
    defaultValues: { pointsChanged: 0, reason: "" },
  });

  useEffect(() => {
    if (customer && open) {
      reset({ pointsChanged: 0, reason: "" });
    }
  }, [customer, open, reset]);

  const onSubmit = async (data: AdjustPointsFormData) => {
    if (!customer) return;
    try {
      await adjustPointsMutation.mutateAsync({
        id: customer.id,
        pointsChanged: data.pointsChanged,
        reason: data.reason,
      });
      toast.success("Points adjusted successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Action failed!");
    }
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Adjust Reward Points"
      description={`Modify points for ${customer?.name} (Current: ${customer?.points || 0})`}
      size="sm"
      hideFooter={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="pointsChanged">
            Points Adjustment <span className="text-danger">*</span>
          </Label>
          <Input
            {...register("pointsChanged", { valueAsNumber: true })}
            id="pointsChanged"
            type="number"
            placeholder="e.g., 50 or -20"
            className="focus-visible:ring-brand"
          />
          <p className="text-xs text-ink-muted">
            Use positive numbers to add, negative numbers to deduct.
          </p>
          {errors.pointsChanged && (
            <p className="text-xs text-danger">
              {errors.pointsChanged.message}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="reason">
            Reason <span className="text-danger">*</span>
          </Label>
          <Textarea
            {...register("reason")}
            id="reason"
            rows={3}
            placeholder="E.g., Compensation for delayed order..."
            className="focus-visible:ring-brand resize-none"
          />
          {errors.reason && (
            <p className="text-xs text-danger">{errors.reason.message}</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={adjustPointsMutation.isPending}>
            {adjustPointsMutation.isPending ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </form>
    </BaseCrudModal>
  );
}
