import { Link, useNavigate, useLocation } from "react-router";
import { Lock, Loader2, Sparkles, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLogin } from "@/auth/hooks/usePublicAuth";
import {
  publicLoginSchema,
  type PublicLoginForm,
} from "../schemas/public-auth.schema";
import { toast } from "@/lib/toast";
import { useState } from "react";

export default function PublicLoginPage() {
  const loginMutation = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PublicLoginForm>({
    resolver: zodResolver(publicLoginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  const onSubmit = async (data: PublicLoginForm) => {
    try {
      const isEmail = data.identifier.includes("@");
      const payload = isEmail
        ? { email: data.identifier, password: data.password }
        : { phone: data.identifier, password: data.password };

      await loginMutation.mutateAsync(payload);
      toast.success("Welcome back! ✨");
      const params = new URLSearchParams(location.search);
      const returnUrl = params.get("returnUrl");
      {
        /* eslint-disable-next-line  */
      }
      window.location.href = returnUrl || "/";
    } catch (err: any) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    }
  };

  const isPending = isSubmitting || loginMutation.isPending;

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Brand Panel ── */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, hsl(352, 72%, 18%) 0%, hsl(345, 60%, 28%) 60%, hsl(20, 60%, 22%) 100%)",
        }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-20"
          style={{ background: "hsl(352, 72%, 52%)" }}
        />
        <div
          className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full opacity-15"
          style={{ background: "hsl(20, 80%, 50%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: "white" }}
        />

        <div className="relative z-10 text-center px-12 max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span
              className="text-3xl font-bold text-white tracking-tight"
              style={{ fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)" }}
            >
              GlowUp
            </span>
          </div>

          <h2
            className="text-4xl font-bold text-white mb-4 leading-tight"
            style={{ fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)" }}
          >
            Your beauty,
            <br />
            <em>your story.</em>
          </h2>

          <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            Discover authentic skincare and cosmetics curated for the modern woman. Sign in to unlock exclusive offers.
          </p>

          {/* Trust indicators */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { num: "10K+", label: "Products" },
              { num: "50K+", label: "Customers" },
              { num: "4.9★", label: "Rating" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-white">{num}</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-16 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "hsl(352, 72%, 52%)" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{
                fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                color: "hsl(352, 72%, 38%)",
              }}
            >
              GlowUp
            </span>
          </div>

          <div className="mb-8">
            <h1
              className="text-2xl font-bold text-foreground"
              style={{ fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)" }}
            >
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Sign in to your account to continue shopping.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email / Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Email or Phone
              </label>
              <input
                type="text"
                placeholder="hello@example.com"
                {...register("identifier")}
                className={`w-full h-11 px-4 rounded-xl border text-sm text-foreground bg-card placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 ${
                  errors.identifier
                    ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                    : "border-border focus:border-brand focus:ring-2 focus:ring-brand/15"
                }`}
              />
              {errors.identifier && (
                <p className="text-xs text-destructive">{errors.identifier.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className={`w-full h-11 px-4 pr-11 rounded-xl border text-sm text-foreground bg-card placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 ${
                    errors.password
                      ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                      : "border-border focus:border-brand focus:ring-2 focus:ring-brand/15"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  {...(register as any)("remember")}
                  className="w-4 h-4 rounded border-border accent-brand cursor-pointer"
                />
                <span className="text-sm text-foreground">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm font-medium transition-colors"
                style={{ color: "hsl(352, 72%, 48%)" }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 mt-2 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99]"
              style={{ background: "hsl(352, 72%, 52%)" }}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>

            {/* Social Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-background text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <a
                href={`${import.meta.env.VITE_API_URL}/auth/facebook`}
                className="h-11 rounded-xl border border-border flex items-center justify-center gap-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted/60 hover:border-[#1877F2]/40"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z" />
                </svg>
                Facebook
              </a>
              <a
                href={`${import.meta.env.VITE_API_URL}/auth/google`}
                className="h-11 rounded-xl border border-border flex items-center justify-center gap-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted/60 hover:border-red-300/50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </a>
            </div>
          </form>

          {/* Register CTA */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold transition-colors"
                style={{ color: "hsl(352, 72%, 48%)" }}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
