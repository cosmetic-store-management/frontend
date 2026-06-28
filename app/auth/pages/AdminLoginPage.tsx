import { useNavigate, Link } from "react-router";
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
      onSuccess: () => {
        toast.success("Đăng nhập thành công!");
        // Use hard redirect to ensure clean mount for Admin Dashboard with SSR
        window.location.href = "/admin";
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
      },
    });
  };

  const isSubmitting = loginMutation.isPending;

  return (
    <div className="w-full animate-page-enter">
      <div className="mb-8">
        <h1 className="text-heading-1">Đăng nhập</h1>
        <p className="text-body-sm mt-2">
          Vui lòng nhập thông tin đăng nhập của bạn
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(onSubmit)(e);
        }}
        className="space-y-5"
        noValidate
      >
        <div>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Email"
            className="h-12 bg-white border-zinc-200 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand transition-colors [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:text-ink"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          {errors.email && (
            <p className="text-xs text-danger mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Mật khẩu"
            className="h-12 bg-white border-zinc-200 focus:bg-white focus:border-brand focus:ring-1 focus:ring-brand transition-colors [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:text-ink"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-danger mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full h-12 mt-4 text-[15px]"
        >
          {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
        </Button>
      </form>
    </div>
  );
}
