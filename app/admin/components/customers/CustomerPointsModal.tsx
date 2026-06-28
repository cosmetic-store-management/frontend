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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import type { Customer } from "@/admin/services/user.service";
import {
  adjustPointsSchema,
  type AdjustPointsFormData,
} from "../../schemas/customer.schema";

type CustomerPointsModalProps = {
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: AdjustPointsFormData) => Promise<void>;
  loading: boolean;
};

export function CustomerPointsModal({
  customer,
  onClose,
  onSubmit,
  loading,
}: CustomerPointsModalProps) {
  const open = !!customer;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustPointsFormData>({
    resolver: zodResolver(adjustPointsSchema) as any,
    defaultValues: { pointsChanged: 0, reason: "" },
  });

  useEffect(() => {
    if (open) {
      reset({ pointsChanged: 0, reason: "" });
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="pr-6">
          <DialogTitle>Điều chỉnh điểm thưởng</DialogTitle>
          <DialogDescription>
            Cộng hoặc trừ điểm thưởng của{" "}
            <strong className="text-brand">{customer?.name}</strong>.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-brand/5 text-brand text-sm border border-brand/20 p-3 rounded-sm flex justify-between items-center">
            <span>Điểm hiện tại:</span>
            <span className="font-bold text-lg">{customer?.points}</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="pointsChanged">
                Số điểm (+/-) <span className="text-danger">*</span>
              </Label>
              <Controller
                control={control}
                name="pointsChanged"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="pointsChanged"
                    type="number"
                    placeholder="Ví dụ: -500"
                    className="focus-visible:ring-brand"
                  />
                )}
              />
              {errors.pointsChanged && (
                <p className="text-xs text-danger">
                  {errors.pointsChanged.message}
                </p>
              )}
            </div>
            <div className="space-y-3">
              <Label htmlFor="pointsReason">
                Lý do điều chỉnh <span className="text-danger">*</span>
              </Label>
              <Controller
                control={control}
                name="reason"
                render={({ field }) => (
                  <Textarea
                    {...field}
                    id="pointsReason"
                    placeholder="Ví dụ: Đổi trả đơn hàng #12345"
                    className="resize-none focus-visible:ring-brand"
                  />
                )}
              />
              {errors.reason && (
                <p className="text-xs text-danger">{errors.reason.message}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Xác nhận"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
