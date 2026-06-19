import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "../hooks/useAdminAuth";
import { loginSchema, type LoginForm } from "../schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: (user) => {
        toast.success("Đăng nhập thành công!");
        navigate("/admin", { replace: true });
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
      },
    });
  };

  const isSubmitting = loginMutation.isPending;

  return (
    <div className="w-full max-w-sm bg-surface border border-border shadow-ui-card rounded-sm p-8 animate-page-enter">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Đăng nhập</h1>
        <p className="text-sm text-ink-muted mt-1">Chào mừng bạn trở lại GlowUp</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(onSubmit)(e); }} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div className="flex justify-end">
          <a href="/admin/forgot-password" className="text-xs text-brand hover:underline">
            Quên mật khẩu?
          </a>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Chưa có tài khoản?{" "}
        <a href="/admin/register" className="text-brand hover:underline font-medium">
          Đăng ký ngay
        </a>
      </p>
    </div>
  );
}
