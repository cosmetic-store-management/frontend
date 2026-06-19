import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "../hooks/useAdminAuth";
import { forgotPasswordSchema, type ForgotPasswordForm } from "../schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      },
    });
  };

  const isSubmitting = forgotPasswordMutation.isPending;

  if (submitted) {
    return (
      <div className="w-full max-w-sm bg-surface border border-border shadow-sm rounded-sm p-8 text-center animate-page-enter">
        <div className="mb-4 text-4xl">📧</div>
        <h1 className="text-xl font-bold text-ink mb-2">Kiểm tra hộp thư email</h1>
        <p className="text-sm text-ink-muted mb-6">
          Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi tới hộp thư của bạn.
          Link có hiệu lực trong <strong>1 giờ</strong>.
        </p>
        <a href="/admin/login" className="text-sm text-brand hover:underline">
          Quay lại đăng nhập
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm bg-surface border border-border shadow-sm rounded-sm p-8 animate-page-enter">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Quên mật khẩu</h1>
        <p className="text-sm text-ink-muted mt-1">
          Nhập email, chúng tôi sẽ gửi hướng dẫn đặt lại
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Đang gửi..." : "Gửi hướng dẫn"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        <a href="/admin/login" className="text-brand hover:underline font-medium">
          ← Quay lại đăng nhập
        </a>
      </p>
    </div>
  );
}
