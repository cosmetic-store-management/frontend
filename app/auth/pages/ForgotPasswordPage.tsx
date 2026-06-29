import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForgotPassword } from "@/auth/hooks/useAuth";
import {
  forgotPasswordSchema,
  type ForgotPasswordForm,
} from "../schemas/auth.schema";
import { toast } from "@/lib/toast";
import { Loader2, ArrowLeft, Mail, Sparkles } from "lucide-react";
import { useStats } from "@/public/hooks/useSetting";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();
  const { stats } = useStats();

  const formatStat = (num: number) => {
    if (num >= 1000) return Math.floor(num / 1000) + "K+";
    if (num >= 100) return Math.floor(num / 100) * 100 + "+";
    if (num >= 10) return Math.floor(num / 10) * 10 + "+";
    return num + "+";
  };

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { identifier: "" },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    forgotPasswordMutation.mutate(data.identifier, {
      onSuccess: () => {
        setSubmitted(true);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Có lỗi xảy ra");
      },
    });
  };

  const isPending = isSubmitting || forgotPasswordMutation.isPending;

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
          <Link
            to="/"
            className="flex items-center justify-center gap-3 mb-10 group"
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="GlowUp Logo"
                className="w-full h-full object-cover scale-[1.45]"
              />
            </div>
            <span
              className="text-3xl font-bold text-white tracking-tight"
              style={{
                fontFamily:
                  "var(--font-display, 'Playfair Display', Georgia, serif)",
              }}
            >
              GlowUp
            </span>
          </Link>

          <h2
            className="text-4xl font-bold text-white mb-4 leading-tight"
            style={{
              fontFamily:
                "var(--font-display, 'Playfair Display', Georgia, serif)",
            }}
          >
            Your beauty,
            <br />
            <em>your story.</em>
          </h2>

          <p
            className="text-base leading-relaxed"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Discover authentic skincare and cosmetics curated for the modern
            woman. Sign in to unlock exclusive offers.
          </p>

          {/* Trust indicators */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { num: formatStat(stats.products), label: "Products" },
              { num: formatStat(stats.customers), label: "Customers" },
              { num: Number(stats.rating).toFixed(1) + "★", label: "Rating" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-white">{num}</p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
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
              className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
              style={{ background: "hsl(352, 72%, 52%)" }}
            >
              <img
                src="/logo.png"
                alt="GlowUp Logo"
                className="w-full h-full object-cover scale-[1.45]"
              />
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

          {!submitted ? (
            <>
              <div className="mb-8">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Link>
                <h1
                  className="text-2xl font-bold text-foreground"
                  style={{
                    fontFamily:
                      "var(--font-display, 'Playfair Display', Georgia, serif)",
                  }}
                >
                  Forgot Password
                </h1>
                <p className="text-sm text-muted-foreground mt-1.5">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    {...register("identifier")}
                    className={`w-full h-11 px-4 rounded-sm border text-sm text-foreground bg-card placeholder:text-muted-foreground/50 focus:outline-none transition-all duration-200 ${
                      errors.identifier
                        ? "border-destructive focus:ring-2 focus:ring-destructive/20"
                        : "border-border focus:border-brand focus:ring-2 focus:ring-brand/15"
                    }`}
                  />
                  {errors.identifier && (
                    <p className="text-xs text-destructive">
                      {errors.identifier.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 rounded-sm text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm hover:shadow-md active:scale-[0.99] mt-2"
                  style={{ background: "hsl(352, 72%, 52%)" }}
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Reset Link
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h1
                className="text-2xl font-bold text-foreground mb-4"
                style={{
                  fontFamily:
                    "var(--font-display, 'Playfair Display', Georgia, serif)",
                }}
              >
                Check your inbox
              </h1>
              <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                If an account exists for{" "}
                <strong>{getValues("identifier")}</strong>, we have sent
                password reset instructions. The link is valid for{" "}
                <strong>1 hour</strong>.
              </p>
              <Link
                to="/login"
                className="inline-flex h-11 items-center justify-center px-8 rounded-sm text-sm font-semibold text-white transition-all duration-200 shadow-sm hover:shadow-md"
                style={{ background: "hsl(352, 72%, 52%)" }}
              >
                Return to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
