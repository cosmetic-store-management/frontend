import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { Phone, Lock, LogIn } from "lucide-react";
import { useLogin } from "@/auth/hooks/usePublicAuth";
import { toast } from "@/lib/toast";

export default function PublicLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await loginMutation.mutateAsync({ phone, password });
      toast.success("Đăng nhập thành công!");
      
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get("returnUrl");
      navigate(returnUrl || "/");
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Đăng nhập thất bại");
    }
  };

  return (
    <div className="bg-surface border border-border rounded-sm p-8 shadow-ui-card card-hover transition-all">
      <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">Đăng nhập</h1>
          <p className="text-ink-muted">Đăng nhập để theo dõi đơn hàng và nhận ưu đãi!</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">Số điện thoại</label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại của bạn"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input 
                type="password" 
                required 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Link to="/forgot-password" className="text-xs font-semibold text-brand hover:underline">Quên mật khẩu?</Link>
          </div>

          <button 
            type="submit" 
            disabled={loginMutation.isPending}
            className="btn-hover w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-sm shadow-ui-card transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {loginMutation.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><LogIn className="w-5 h-5" /> Đăng nhập</>}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-ink-muted">
          Bạn chưa có tài khoản? <Link to="/register" className="font-bold text-brand hover:underline">Đăng ký ngay</Link>
        </div>
      </div>
  );
}
