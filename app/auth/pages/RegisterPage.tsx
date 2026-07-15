import { Link, useNavigate } from "react-router";
import { Loader2, Sparkles, Eye, EyeOff, Check, UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegister, useSocialLogin } from "@/auth/hooks/useAuth";
import { registerSchema, type RegisterForm } from "../schemas/auth.schema";
import { toast } from "@/lib/toast";
import { useState } from "react";


const PERKS = [
  "Earn points on every purchase",
  "Exclusive member-only offers",
  "Early access to new arrivals",
  "Easy order tracking & returns",
];

export default function RegisterPage() {
  
  const registerMutation = useRegister();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerMutation.mutateAsync({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      toast.success("Welcome to GlowUp! 🌸 Your account has been created.");
      navigate("/");
    } catch (err: any) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again.",
      );
    }
  };

  const handleSocialLogin = (provider: 'facebook' | 'google') => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/${provider}`;
  };

  const isPending = isSubmitting || registerMutation.isPending;

  const Field = ({
    label,
    name,
    type = "text",
    placeholder,
    error,
    rightEl,
  }: {
    label: string;
    name: any;
    type?: string;
    placeholder: string;
    error?: string;
    rightEl?: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          placeholder={placeholder}
          {...register(name)}
          className={`w-full h-11 px-4 ${rightEl ? "pr-11" : ""} rounded-sm border text-sm text-foreground bg-card placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 ${
            error
              ? "border-destructive focus:ring-2 focus:ring-destructive/20"
              : "border-border focus:border-brand focus:ring-2 focus:ring-brand/15"
          }`}
        />
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightEl}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* ── Left: Brand Panel ── */}
      <div
        className="hidden lg:flex lg:w-5/12 flex-col items-center justify-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(150deg, hsl(20, 70%, 16%) 0%, hsl(352, 65%, 22%) 50%, hsl(345, 50%, 30%) 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div
          className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-20"
          style={{ background: "hsl(352, 72%, 52%)" }}
        />
        <div
          className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full opacity-15"
          style={{ background: "hsl(20, 80%, 50%)" }}
        />

        <div className="relative z-10 text-center px-12 max-w-xs">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center justify-center gap-3 mb-8 group"
          >
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="GlowUp Logo"
                className="w-full h-full object-cover scale-[1.45]"
              />
            </div>
            <span
              className="text-2xl font-bold text-white tracking-tight notranslate"
              style={{
                fontFamily:
                  "var(--font-display, 'Playfair Display', Georgia, serif)",
              }}
            >
              GlowUp
            </span>
          </Link>

          <h2
            className="text-3xl font-bold text-white mb-3 leading-tight"
            style={{
              fontFamily:
                "var(--font-display, 'Playfair Display', Georgia, serif)",
            }}
          >
            {"Join the glow"}
            <br />
            <em>{"community."}</em>
          </h2>

          <p
            className="text-sm leading-relaxed mb-8"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            {"Create your free account and unlock a world of beauty perks."}
          </p>

          <ul className="space-y-3 text-left">
            {PERKS.map((perk) => (
              <li key={perk} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255,255,255,0.15)" }}
                >
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.75)" }}
                >
                  {perk}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right: Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div
              className="w-8 h-8 rounded-sm flex items-center justify-center"
              style={{ background: "hsl(352, 72%, 52%)" }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-xl font-bold"
              style={{
                fontFamily:
                  "var(--font-display, 'Playfair Display', Georgia, serif)",
                color: "hsl(352, 72%, 38%)",
              }}
            >
              GlowUp
            </span>
          </div>

          <div className="mb-7">
            <h1
              className="text-2xl font-bold text-foreground"
              style={{
                fontFamily:
                  "var(--font-display, 'Playfair Display', Georgia, serif)",
              }}
            >
              {"Create account"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {"It's free and only takes a minute."}
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <Field
              label="Full Name"
              name="name"
              placeholder={"Nguyen Thi Lan"}
              error={errors.name?.message}
            />
            <Field
              label="Email"
              name="email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
            />
            <Field
              label="Phone Number"
              name="phone"
              type="tel"
              placeholder="0901 234 567"
              error={errors.phone?.message}
            />
            <Field
              label="Password"
              name="password"
              type={showPw ? "text" : "password"}
              placeholder={"Min. 6 characters"}
              error={errors.password?.message}
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />
            <Field
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              placeholder={"Repeat password"}
              error={errors.confirmPassword?.message}
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />


            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-11 rounded-sm text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 mt-4 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99]"
              style={{ background: "hsl(352, 72%, 52%)" }}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  {"Create Account"}
                </>
              )}
            </button>

            {/* Social Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-background text-xs text-muted-foreground">
                  {"or sign up with"}
                </span>
              </div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                className="h-11 rounded-sm border border-border flex items-center justify-center gap-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted/60 hover:border-[#1877F2]/40"
              >
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.325v21.351C0 23.403.597 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.597 1.323-1.324V1.325C24 .597 23.403 0 22.675 0z" />
                </svg>
                Facebook
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="h-11 rounded-sm border border-border flex items-center justify-center gap-2.5 text-sm font-medium text-foreground transition-all duration-150 hover:bg-muted/60 hover:border-red-300/50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>
          </form>

          {/* Login CTA */}
          <div className="mt-8 text-center pb-8 lg:pb-0">
            <p className="text-sm text-muted-foreground">
              {"Already have an account?"}{" "}
              <Link
                to="/login"
                className="font-semibold transition-colors"
                style={{ color: "hsl(352, 72%, 48%)" }}
              >
                {"Sign in"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
