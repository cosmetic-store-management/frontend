import { useState } from "react";
import { Link } from "react-router";
import { useForgotPassword } from "@/auth/hooks/usePublicAuth";
import { toast } from "@/lib/toast";
import { Phone } from "lucide-react";

export default function PublicForgotPasswordPage() {
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate(phone, {
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
      <div className="container mx-auto px-4 py-16 max-w-md animate-page-enter">
        <div className="w-full bg-surface border border-border shadow-sm rounded-sm p-8 text-center">
          <div className="mb-4 text-4xl">📧</div>
          <h1 className="text-xl font-bold text-ink mb-2">Kiểm tra hộp thư email</h1>
          <p className="text-sm text-ink-muted mb-6">
            Nếu tài khoản gắn với số <strong>{phone}</strong> có email, hướng dẫn đặt lại mật khẩu đã được gửi.
            Link có hiệu lực trong <strong>1 giờ</strong>.
          </p>
          <Link to="/login" className="text-sm text-brand hover:underline">
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md animate-page-enter">
      <div className="w-full bg-surface border border-border shadow-sm rounded-sm p-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-ink">Khôi phục mật khẩu</h1>
          <p className="text-sm text-ink-muted mt-2">
            Nhập số điện thoại của bạn, chúng tôi sẽ gửi link đặt lại qua email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">Số điện thoại</label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-hover w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-sm shadow-ui-card transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {isSubmitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Gửi yêu cầu"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="text-brand hover:underline font-medium">
            ← Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
