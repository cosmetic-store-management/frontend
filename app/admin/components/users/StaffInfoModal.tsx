import { BaseCrudModal } from "@/components/ui/base-crud-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateStaffInfoSchema,
  type UpdateStaffInfoFormData,
} from "@/admin/schemas/user.schema";
import type { User } from "@/admin/types/user";
import { useEffect } from "react";

interface StaffInfoModalProps {
  user: User | null;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UpdateStaffInfoFormData) => void;
  isLoading: boolean;
}

export function StaffInfoModal({
  user,
  onOpenChange,
  onSubmit,
  isLoading,
}: StaffInfoModalProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UpdateStaffInfoFormData>({
    resolver: zodResolver(updateStaffInfoSchema),
    defaultValues: { name: "", email: "", phone: "" },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        email: user.email || "",
        phone: user.phone,
      });
    }
  }, [user, reset]);

  return (
    <BaseCrudModal
      open={!!user}
      onOpenChange={onOpenChange}
      title="Cập nhật thông tin"
      description={`Chỉnh sửa thông tin liên hệ của nhân viên ${user?.name}.`}
      size="md"
      primaryActionText="Xác nhận"
      secondaryActionText="Huỷ"
      onPrimaryAction={handleSubmit(onSubmit)}
      isLoading={isLoading}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        id="staff-info-form"
      >
        <div className="space-y-1.5">
          <Label htmlFor="iName" className="text-xs font-semibold text-ink">{"Họ tên nhân viên *"}</Label>
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <Input {...field} id="iName" placeholder="Ví dụ: Nguyễn Văn A" />
            )}
          />
          {errors.name && (
            <p className="text-xs text-danger">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="iEmail" className="text-xs font-semibold text-ink">{"Email tài khoản"}</Label>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                {...field}
                id="iEmail"
                type="email"
                placeholder="Ví dụ: staff@glowup.vn"
              />
            )}
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="iPhone" className="text-xs font-semibold text-ink">{"Số điện thoại *"}</Label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input {...field} id="iPhone" placeholder="Ví dụ: 0912345678" />
            )}
          />
          {errors.phone && (
            <p className="text-xs text-danger">{errors.phone.message}</p>
          )}
        </div>
      </form>
    </BaseCrudModal>
  );
}
