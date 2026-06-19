import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPassword } from "../hooks/useAdminAuth";
import { resetPasswordSchema, type ResetPasswordForm } from "../schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const tokenFromUrl   = searchParams.get("token") ?? "";
  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromUrl, password: "", confirmPassword: "" },
  });

  // Keep form value in sync with URL param change
  useEffect(() => {
    if (tokenFromUrl) {
      setValue("token", tokenFromUrl);
    }
  }, [tokenFromUrl, setValue]);

  const onSubmit = (data: ResetPasswordForm) => {
    resetPasswordMutation.mutate({ token: data.token, newPassword: data.password }, {
      onSuccess: () => {
        toast.success("Đặt lại mật khẩu thành công!");
        navigate("/admin/login", { replace: true });
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      },
    });
  };

  const isSubmitting = resetPasswordMutation.isPending;

  return (
    <div className="w-full max-w-sm bg-surface border border-border shadow-sm rounded-sm p-8 animate-page-enter">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Đặt lại mật khẩu</h1>
        <p className="text-sm text-ink-muted mt-1">Nhập mật khẩu mới của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {!tokenFromUrl && (
          <div className="space-y-1.5">
            <Label htmlFor="token">Token</Label>
            <Input
              id="token"
              type="text"
              placeholder="Dán token từ email"
              {...register("token")}
              aria-invalid={!!errors.token}
              className="font-mono"
            />
            {errors.token && (
              <p className="text-xs text-danger">{errors.token.message}</p>
            )}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="password">Mật khẩu mới</Label>
          <Input
            id="password"
            type="password"
            placeholder="Tối thiểu 6 ký tự"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Đang cập nhật..." : "Đặt lại mật khẩu"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        <a href="/admin/login" className="text-brand hover:underline font-medium">
          Quay lại đăng nhập
        </a>
      </p>
    </div>
  );
}
