import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useUpdateInternalNotes } from "../../hooks/useCustomer";
import type { Customer } from "@/admin/services/user.service";
import {
  updateNotesSchema,
  type UpdateNotesFormData,
} from "../../schemas/customer.schema";

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
      description="Add private notes about this customer (visible to staff only)."
      size="md"
      hideFooter={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
        <div className="space-y-2">
          <Label htmlFor="internalNotes">Notes</Label>
          <Textarea
            {...register("internalNotes")}
            id="internalNotes"
            rows={5}
            placeholder="E.g., Prefers evening deliveries..."
            className="focus-visible:ring-brand resize-none"
          />
          {errors.internalNotes && (
            <p className="text-xs text-danger">
              {errors.internalNotes.message}
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateNotesMutation.isPending}>
            {updateNotesMutation.isPending ? "Saving..." : "Save Notes"}
          </Button>
        </div>
      </form>
    </BaseCrudModal>
  );
}
