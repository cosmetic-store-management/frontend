import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { User } from "@/admin/types/user";
import { useEffect } from "react";

const updateStaffInfoSchema = z.object({
  name: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  phone: z.string().min(10, "SĐT không hợp lệ"),
});

type UpdateStaffInfoFormData = z.infer<typeof updateStaffInfoSchema>;

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
    <Dialog open={!!user} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md animate-scale-in text-left">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-ink">
            Cập nhật thông tin
          </DialogTitle>
          <DialogDescription className="text-xs text-ink-muted mt-1">
            Chỉnh sửa thông tin liên hệ của nhân viên{" "}
            <strong>{user?.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="iName" className="text-xs font-semibold text-ink">
              Họ tên nhân viên *
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="iName"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              )}
            />
            {errors.name && (
              <p className="text-xs text-danger">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iEmail" className="text-xs font-semibold text-ink">
              Email tài khoản
            </Label>
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
            <Label htmlFor="iPhone" className="text-xs font-semibold text-ink">
              Số điện thoại *
            </Label>
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

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Huỷ
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Xác nhận
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
