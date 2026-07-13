import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/lib/toast";
import { useUpdateInternalNotes } from "../../hooks/useCustomer";
import type { Customer } from "@/admin/services/user.service";
import {
  updateNotesSchema,
  type UpdateNotesFormData,
} from "../../schemas/customer.schema";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

interface CustomerNotesModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
}

export function CustomerNotesModal({ open, onClose, customer }: CustomerNotesModalProps) {
  const updateNotesMutation = useUpdateInternalNotes();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateNotesFormData>({
    resolver: zodResolver(updateNotesSchema),
    defaultValues: { internalNotes: "" },
  });

  useEffect(() => {
    if (customer && open) {
      reset({ internalNotes: customer.internalNotes || "" });
    }
  }, [customer, open, reset]);

  const onSubmit = async (data: UpdateNotesFormData) => {
    if (!customer) return;
    try {
      await updateNotesMutation.mutateAsync({
        id: customer.id,
        internalNotes: data.internalNotes || "",
      });
      toast.success("Internal notes updated successfully!");
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Action failed!");
    }
  };

  return (
    <BaseCrudModal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="Internal Notes"
      size="sm-md"
      primaryActionText="Confirm"
      onPrimaryAction={handleSubmit(onSubmit)}
      onSecondaryAction={onClose}
      isLoading={updateNotesMutation.isPending}
    >
      <div className="text-left -mt-3">
        {/* Customer Info Summary Card (Inventory Style Compliance) */}
        <div className="flex items-center justify-between gap-4 bg-surface-soft/50 border border-border rounded-sm p-3.5 mb-4 text-left">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 shrink-0 rounded-full bg-surface-soft text-ink flex items-center justify-center border border-border font-bold text-sm tracking-wider">
              {customer ? getInitials(customer.name) : "—"}
            </div>
            <div className="text-left min-w-0">
              <h4 className="font-semibold text-sm text-ink truncate max-w-[300px]" title={customer?.name || ""}>
                {customer?.name || "—"}
              </h4>
              <p className="text-[11px] text-ink-muted mt-1.5">
                Contact: <span className="font-mono text-ink font-medium">{customer?.phone || customer?.email || "—"}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="internalNotes" className="text-xs font-semibold text-ink">
              Notes
            </Label>
            <Textarea
              {...register("internalNotes")}
              id="internalNotes"
              rows={5}
              placeholder="Prefers evening deliveries..."
              className="focus-visible:ring-brand resize-none text-ink"
            />
            {errors.internalNotes && (
              <p className="text-xs text-danger">
                {errors.internalNotes.message}
              </p>
            )}
          </div>
          <button type="submit" className="hidden" />
        </form>
      </div>
    </BaseCrudModal>
  );
}
