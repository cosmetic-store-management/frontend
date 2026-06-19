import { type RouteConfig, index, route, layout, prefix } from "@react-router/dev/routes";

export default [
  // ── Storefront ──────────────────────────────────────────
  layout("./public/layout/Layout.tsx", [
    index("./routes/index.tsx"), // Now HomePage is at "/"
    route("products",     "./routes/public/products.tsx"),
    route("categories",   "./routes/public/categories.tsx"),
    route("brands",       "./routes/public/brands.tsx"),
    route("vouchers",     "./routes/public/vouchers.tsx"),
    route("product/:slug", "./routes/public/product-detail.tsx"),
    
    // Protected routes
    layout("./public/layout/ProtectedLayout.tsx", [
      route("cart", "./routes/public/cart.tsx"),
      route("checkout", "./routes/public/checkout.tsx"),
      route("order-success/:code", "./routes/public/order-success.tsx"),
      route("checkout/vnpay_return", "./routes/public/vnpay-return.tsx"),
      route("account", "./routes/public/profile.tsx"),
    ]),

  ]),

  // ── Auth (Public & Admin) ────────────────────────────────────────────────
  layout("./auth/layout/Layout.tsx", [
    // Public
    route("login", "./auth/pages/PublicLoginPage.tsx"),
    route("register", "./auth/pages/PublicRegisterPage.tsx"),
    route("forgot-password", "./auth/pages/PublicForgotPasswordPage.tsx"),
    route("reset-password", "./auth/pages/PublicResetPasswordPage.tsx"),

    // Admin
    ...prefix("admin", [
      route("login", "./auth/pages/AdminLoginPage.tsx", { id: "admin-login" }),
      route("register", "./auth/pages/AdminRegisterPage.tsx", { id: "admin-register" }),
      route("forgot-password", "./auth/pages/ForgotPasswordPage.tsx", { id: "admin-forgot-password" }),
      route("reset-password", "./auth/pages/ResetPasswordPage.tsx", { id: "admin-reset-password" }),
    ]),
  ]),

  // ── Admin ──────────────────────────────────────────────────────────
  layout("./admin/layout/Layout.tsx", [
    ...prefix("admin", [
      index("./routes/admin/dashboard.tsx"),
      route("orders", "./routes/admin/order.tsx"),
      route("pos", "./routes/admin/pos.tsx"),
      route("inventory", "./routes/admin/inventory.tsx"),
      route("products", "./routes/admin/product.tsx"),
      route("categories", "./routes/admin/category.tsx"),
      route("brands", "./routes/admin/brand.tsx"),
      route("variants", "./routes/admin/variant.tsx"),
      route("customers", "./routes/admin/customer.tsx"),
      route("staff", "./routes/admin/staff.tsx"),
      route("reports", "./routes/admin/report.tsx"),
      route("audit-logs", "./routes/admin/audit-log.tsx"),
      route("reviews", "./routes/admin/reviews.tsx"),
      route("vouchers", "./routes/admin/voucher.tsx"),
      route("settings", "./routes/admin/settings.tsx"),
    ]),
  ]),

  // ── 404 — Wildcard (phải ở cuối cùng) ─────────────────────────────────────
  route("*", "./public/pages/NotFoundPage.tsx"),

] satisfies RouteConfig;

