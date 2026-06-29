import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { User, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useAuth } from "@/auth/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { changePassword } from "@/auth/services/auth.service";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
    newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu mới"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function AdminAccountTab() {
  const { user } = useAuth();

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Đổi mật khẩu thành công!");
      reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Đổi mật khẩu thất bại");
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = (data: PasswordForm) => {
    changePasswordMutation.mutate({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Thông tin hồ sơ */}
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <User className="w-5 h-5 text-brand" />
          <h3 className="font-semibold text-base text-ink">
            Thông tin cá nhân
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-ink">Họ và tên</Label>
            <Input
              value={user?.name || ""}
              disabled
              className="bg-surface-soft/50 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-ink">Email</Label>
            <Input
              value={user?.email || ""}
              disabled
              className="bg-surface-soft/50 cursor-not-allowed"
            />
          </div>
          <div className="space-y-1.5 text-left">
            <Label className="text-xs font-semibold text-ink">Vai trò</Label>
            <Input
              value={user?.role || ""}
              disabled
              className="bg-surface-soft/50 cursor-not-allowed uppercase"
            />
          </div>
        </div>
      </div>

      {/* Đổi mật khẩu */}
      <div className="premium-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <Lock className="w-5 h-5 text-brand" />
          <h3 className="font-semibold text-base text-ink">Đổi mật khẩu</h3>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-1.5 text-left">
            <Label
              htmlFor="currentPassword"
              className="text-xs font-semibold text-ink"
            >
              Mật khẩu hiện tại <span className="text-danger">*</span>
            </Label>
            <Input
              id="currentPassword"
              type="password"
              {...register("currentPassword")}
              placeholder="••••••••"
            />
            {errors.currentPassword && (
              <p className="text-xs text-danger">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <Label
              htmlFor="newPassword"
              className="text-xs font-semibold text-ink"
            >
              Mật khẩu mới <span className="text-danger">*</span>
            </Label>
            <Input
              id="newPassword"
              type="password"
              {...register("newPassword")}
              placeholder="Tối thiểu 6 ký tự"
            />
            {errors.newPassword && (
              <p className="text-xs text-danger">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5 text-left">
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-semibold text-ink"
            >
              Xác nhận mật khẩu mới <span className="text-danger">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="Nhập lại mật khẩu mới"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-danger">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="min-w-30"
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Cập nhật mật khẩu
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
