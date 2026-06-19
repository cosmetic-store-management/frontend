import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import { useRegister } from "@/auth/hooks/usePublicAuth";
import { toast } from "@/lib/toast";

export default function PublicRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const registerMutation = useRegister();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp!");
      return;
    }
    
    try {
      await registerMutation.mutateAsync({ name, email, phone, password });
      toast.success("Đăng ký thành công! Chào mừng bạn đến với GlowUp 🌸");
      navigate("/");
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Đăng ký thất bại");
    }
  };

  return (
    <div className="bg-surface border border-border rounded-sm p-8 shadow-ui-card card-hover transition-all">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink mb-2">Đăng ký</h1>
          <p className="text-ink-muted">Tạo tài khoản GlowUp để mua sắm dễ dàng hơn</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">Họ và tên</label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Nhập họ và tên"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">Email</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Nhập email (Tùy chọn)"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-ink">Số điện thoại</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted font-semibold text-sm">+84</span>
              <input 
                type="tel" 
                required 
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-[3.2rem] pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
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
                placeholder="Tạo mật khẩu"
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
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full bg-surface-soft border border-border rounded-sm py-3 pl-10 pr-4 text-sm focus:ring-1 focus:ring-brand focus:outline-none"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={registerMutation.isPending}
            className="btn-hover w-full bg-brand hover:bg-brand-dark text-white font-bold py-3.5 rounded-sm shadow-ui-soft transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
          >
            {registerMutation.isPending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><UserPlus className="w-5 h-5" /> Tạo tài khoản</>}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-ink-muted">
          Đã có tài khoản? <Link to="/login" className="font-bold text-brand hover:underline">Đăng nhập</Link>
        </div>
      </div>
  );
}
