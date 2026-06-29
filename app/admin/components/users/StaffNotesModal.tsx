import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateStaffNotesSchema as updateNotesSchema,
  type UpdateStaffNotesFormData as UpdateNotesFormData,
} from "@/admin/schemas/user.schema";
import type { User } from "@/admin/types/user";
import { useEffect } from "react";

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
    <BaseCrudModal
      open={!!user}
      onOpenChange={onOpenChange}
      title="Ghi chú nội bộ"
      description={`Ghi chú về hiệu suất, thái độ hoặc các thông tin đặc biệt của ${user?.name}.`}
      size="sm"
      primaryActionText="Xác nhận"
      secondaryActionText="Huỷ"
      onPrimaryAction={handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        id="staff-notes-form"
      >
        <Label htmlFor="internalNotes" className="sr-only">{i18next.t("Nội dung ghi chú")}</Label>
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
          <p className="text-xs text-danger">{errors.internalNotes.message}</p>
        )}
      </form>
    </BaseCrudModal>
  );
}
