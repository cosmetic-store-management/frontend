import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useResetPassword } from "@/auth/hooks/usePublicAuth";
import { toast } from "@/lib/toast";
import { Lock } from "lucide-react";

export default function PublicResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const resetPasswordMutation = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Không tìm thấy token. Link không hợp lệ.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }

    resetPasswordMutation.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          toast.success("Đặt lại mật khẩu thành công!");
          navigate("/login");
        },
        onError: (err) => {
          toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
        },
      }
    );
  };

  const isSubmitting = resetPasswordMutation.isPending;

  if (!token) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md animate-page-enter">
        <div className="w-full bg-surface border border-border shadow-sm rounded-sm p-8 text-center text-danger">
          <p className="font-bold">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md animate-page-enter">
      <div className="w-full bg-surface border border-border shadow-sm rounded-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-ink">Đặt lại mật khẩu</h1>
          <p className="text-sm text-ink-muted mt-2">Vui lòng nhập mật khẩu mới của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">Mật khẩu mới</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-hover w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-sm shadow-ui-card transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Lưu mật khẩu mới"}
          </button>
        </form>
      </div>
    </div>
  );
}
