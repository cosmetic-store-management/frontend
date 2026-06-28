import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@/admin/types/user";
import { useEffect } from "react";

const updateNotesSchema = z.object({
  internalNotes: z
    .string()
    .max(1000, "Ghi chú không được vượt quá 1000 ký tự")
    .optional()
    .or(z.literal("")),
});

type UpdateNotesFormData = z.infer<typeof updateNotesSchema>;

interface StaffNotesModalProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateNotesFormData) => void;
  isLoading: boolean;
}

export function StaffNotesModal({
  user,
  onOpenChange,
  onSubmit,
  isLoading,
}: StaffNotesModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateNotesFormData>({
    resolver: zodResolver(updateNotesSchema),
    defaultValues: { internalNotes: "" },
  });

  useEffect(() => {
    if (user) {
      reset({ internalNotes: user.internalNotes || "" });
    }
  }, [user, reset]);

  return (
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] animate-scale-in text-left">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-ink">
            Ghi chú nội bộ
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted mt-1">
            Ghi chú về hiệu suất, thái độ hoặc các thông tin đặc biệt của{" "}
            <strong>{user?.name}</strong>.
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
                placeholder="Ví dụ: Nhân viên hoàn thành xuất sắc KPI tháng 10..."
                rows={6}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Xác nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
