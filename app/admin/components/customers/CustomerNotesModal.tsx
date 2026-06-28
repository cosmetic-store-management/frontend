import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Customer } from "@/admin/services/user.service";
import {
  updateNotesSchema,
  type UpdateNotesFormData,
} from "../../schemas/customer.schema";

type CustomerNotesModalProps = {
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: UpdateNotesFormData) => Promise<void>;
  loading: boolean;
};

export function CustomerNotesModal({
  customer,
  onClose,
  onSubmit,
  loading,
}: CustomerNotesModalProps) {
  const open = !!customer;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateNotesFormData>({
    resolver: zodResolver(updateNotesSchema),
    defaultValues: { internalNotes: "" },
  });

  useEffect(() => {
    if (open && customer) {
      reset({ internalNotes: customer.internalNotes || "" });
    }
  }, [open, customer, reset]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader className="pr-6">
          <DialogTitle>Ghi chú nội bộ</DialogTitle>
          <DialogDescription>
            Ghi chú về sở thích, thói quen mua sắm, hoặc các vấn đề của khách
            hàng.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Label htmlFor="internalNotes" className="sr-only">
            Nội dung ghi chú
          </Label>
          <Controller
            control={control}
            name="internalNotes"
            render={({ field }) => (
              <Textarea
                {...field}
                id="internalNotes"
                placeholder="Ví dụ: Khách hay mua son màu đỏ, từng phàn nàn về giao hàng..."
                rows={5}
                className="resize-none focus-visible:ring-brand"
              />
            )}
          />
          {errors.internalNotes && (
            <p className="text-xs text-danger">
              {errors.internalNotes.message}
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy bỏ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Lưu ghi chú"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
