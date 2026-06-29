import { Link, useNavigate } from "react-router";
import { Home, ArrowLeft, Search } from "lucide-react";

/**
 * NotFoundPage — Trang 404 thân thiện với người dùng.
 * Phong cách: Red brand, Yellow bg, Flat design (rounded-sm).
 */
export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Visual */}
        <div className="relative inline-block">
          <div
            className="text-[160px] sm:text-[200px] font-black leading-none tracking-tighter"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--brand)) 0%, hsl(var(--brand-dark)) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            404
          </div>
          {/* Decorative dot */}
          <div className="absolute -top-4 -right-4 w-10 h-10 bg-brand/20 rounded-full animate-ping" />
          <div className="absolute -bottom-2 -left-6 w-6 h-6 bg-brand/30 rounded-full" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Page not found
          </h1>
          <p className="text-base text-ink-muted max-w-md mx-auto leading-relaxed">
            Oops! This page has been removed, renamed, or never existed. Check
            the URL or explore GlowUp.
          </p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
          {[
            { label: "Home", to: "/", icon: <Home className="w-4 h-4" /> },
            {
              label: "Products",
              to: "/products",
              icon: <Search className="w-4 h-4" />,
            },
            {
              label: "Categories",
              to: "/categories",
              icon: <Search className="w-4 h-4" />,
            },
          ].map(({ label, to, icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-sm border border-border bg-white hover:bg-brand hover:text-white hover:border-brand transition-all duration-200 text-sm font-medium text-ink "
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate(-1)}
            className="btn-hover flex items-center gap-2 px-6 py-3 rounded-sm border border-border bg-white text-sm font-medium text-ink hover:bg-surface-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <Link
            to="/"
            className="btn-hover flex items-center gap-2 px-6 py-3 rounded-sm bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors "
          >
            <Home className="w-4 h-4" />
            Back to home
          </Link>
        </div>

        {/* Brand */}
        <p className="text-xs text-ink-muted/50 pt-4">
          GlowUp Cosmetics · Error 404
        </p>
      </div>
    </div>
  );
}
