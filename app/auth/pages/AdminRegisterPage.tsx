import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister } from "../hooks/useAdminAuth";
import { registerSchema, type RegisterForm } from "../schemas/auth.schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";

export default function AdminRegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  const onSubmit = (data: RegisterForm) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
        navigate("/admin/login", { replace: true });
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Đăng ký thất bại");
      },
    });
  };

  const isSubmitting = registerMutation.isPending;

  const fields = [
    { id: "name",     label: "Họ tên",          type: "text",     placeholder: "Nguyễn Văn A",   error: errors.name },
    { id: "email",    label: "Email",            type: "email",    placeholder: "you@example.com", error: errors.email },
    { id: "phone",    label: "Số điện thoại",   type: "tel",      placeholder: "0901 234 567",    error: errors.phone },
    { id: "password", label: "Mật khẩu",        type: "password", placeholder: "Tối thiểu 6 ký tự", error: errors.password },
  ] as const;

  return (
    <div className="w-full max-w-sm bg-surface border border-border shadow-ui-card rounded-sm p-8 animate-page-enter">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-ink">Đăng ký</h1>
        <p className="text-sm text-ink-muted mt-1">Tạo tài khoản GlowUp của bạn</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {fields.map(({ id, label, type, placeholder, error }) => (
          <div key={id} className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            <Input
              id={id}
              type={type}
              placeholder={placeholder}
              {...register(id)}
              aria-invalid={!!error}
            />
            {error && <p className="text-xs text-danger">{error.message}</p>}
          </div>
        ))}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Đang tạo tài khoản..." : "Đăng ký"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-ink-muted">
        Đã có tài khoản?{" "}
        <a href="/admin/login" className="text-brand hover:underline font-medium">Đăng nhập</a>
      </p>
    </div>
  );
}
