import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "@/lib/toast";
import { useAdjustPoints, useCustomerPointHistory } from "../../hooks/useCustomer";
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
  const { data: history = [], isLoading: loadingHistory } = useCustomerPointHistory(
    customer?.id || ""
  );

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
      reset({ pointsChanged: 0, reason: "" });
    } catch (err: any) {
      toast.error(err.message || "Action failed!");
    }
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Adjust Reward Points"
      size="md"
      primaryActionText="Confirm"
      onPrimaryAction={handleSubmit(onSubmit)}
      onSecondaryAction={onClose}
      isLoading={adjustPointsMutation.isPending}
    >
      <div className="text-left -mt-3">
        {/* Customer Information Grid (Product Modal Style Compliance) */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Customer</p>
            <p className="mt-1.5 text-sm font-semibold text-ink truncate">{customer?.name}</p>
          </div>
          <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Current Points</p>
            <p className="mt-1.5 text-sm font-bold text-ink">{customer?.points || 0} pts</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pointsChanged" className="text-xs font-semibold text-ink">
              Points Adjustment <span className="text-danger">*</span>
            </Label>
            <Input
              {...register("pointsChanged", { valueAsNumber: true })}
              id="pointsChanged"
              type="number"
              placeholder="50 or -20"
              className="focus-visible:ring-brand h-9"
            />
            <p className="text-[10px] text-ink-muted/80 leading-normal">
              Use positive numbers to add, negative numbers to deduct.
            </p>
            {errors.pointsChanged && (
              <p className="text-xs text-danger">
                {errors.pointsChanged.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-semibold text-ink">
              Reason <span className="text-danger">*</span>
            </Label>
            <Textarea
              {...register("reason")}
              id="reason"
              rows={3}
              placeholder="Compensation for delayed order..."
              className="focus-visible:ring-brand resize-none"
            />
            {errors.reason && (
              <p className="text-xs text-danger">{errors.reason.message}</p>
            )}
          </div>
          <button type="submit" className="hidden" />
        </form>

        {/* Point History Log (Audit Log Trail) */}
        <div className="mt-6 pt-5 border-t border-border">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mb-3.5">
            Adjustment Audit Log
          </h4>

          {loadingHistory ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-brand" />
              <span className="text-xs text-ink-muted font-medium">Loading history...</span>
            </div>
          ) : history.length === 0 ? (
            <p className="text-xs text-ink-muted/80 text-center py-4 bg-surface-soft/30 border border-dashed border-border rounded-sm">
              No point adjustments recorded yet.
            </p>
          ) : (
            <div className="border border-border rounded-sm max-h-[160px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-surface-muted/60 text-ink-muted font-semibold sticky top-0 border-b border-border z-10">
                  <tr>
                    <th className="py-2 px-3 font-semibold w-[22%]">Date</th>
                    <th className="py-2 px-3 font-semibold text-center w-[18%]">Amount</th>
                    <th className="py-2 px-3 font-semibold w-[35%]">Reason</th>
                    <th className="py-2 px-3 font-semibold w-[25%]">Author</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {history.map((tx: any) => (
                    <tr key={tx._id} className="hover:bg-surface-soft/40 transition-colors">
                      <td className="py-2 px-3 text-ink-muted whitespace-nowrap">
                        {new Date(tx.createdAt).toLocaleDateString("en-US")}
                      </td>
                      <td className={`py-2 px-3 text-center font-bold font-mono ${tx.pointsChanged >= 0 ? "text-emerald-600" : "text-danger"}`}>
                        {tx.pointsChanged >= 0 ? `+${tx.pointsChanged}` : tx.pointsChanged}
                      </td>
                      <td className="py-2 px-3 text-ink truncate max-w-[120px]" title={tx.reason}>
                        {tx.reason}
                      </td>
                      <td className="py-2 px-3 text-ink-muted truncate" title={tx.performedBy?.name || "System"}>
                        {tx.performedBy?.name || "System"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BaseCrudModal>
  );
}
