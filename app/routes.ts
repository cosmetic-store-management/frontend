import {
  type RouteConfig,
  index,
  route,
  layout,
  prefix,
} from "@react-router/dev/routes";

export default [
  // ── Storefront ──────────────────────────────────────────
  layout("./public/layout/Layout.tsx", [
    index("./routes/index.tsx"), // Now HomePage is at "/"
    route("products", "./routes/public/products.tsx"),
    route("categories", "./routes/public/categories.tsx"),
    route("brands", "./routes/public/brands.tsx"),
    route("vouchers", "./routes/public/vouchers.tsx"),
    route("product/:slug", "./routes/public/product-detail.tsx"),
    route("flash-sale", "./routes/public/flash-sale.tsx"),

    route("cart", "./routes/public/cart.tsx"),

    // Protected routes
    layout("./public/layout/ProtectedLayout.tsx", [
      route("checkout", "./routes/public/checkout.tsx"),
      route("order-success/:code", "./routes/public/order-success.tsx"),
      route("payment/:code", "./routes/public/payment.tsx"),
      route("account", "./routes/public/profile.tsx"),
    ]),

    // Public Auth
    route("login", "./auth/pages/PublicLoginPage.tsx"),
    route("register", "./auth/pages/PublicRegisterPage.tsx"),
    route("forgot-password", "./auth/pages/PublicForgotPasswordPage.tsx"),
    route("reset-password", "./auth/pages/PublicResetPasswordPage.tsx"),
    route("auth/social-callback", "./auth/pages/SocialCallbackPage.tsx"),
  ]),

  // ── Auth (Admin) ────────────────────────────────────────────────
  layout("./auth/layout/Layout.tsx", [
    // Admin
    ...prefix("admin", [
      route("login", "./auth/pages/AdminLoginPage.tsx", { id: "admin-login" }),
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
      route("flash-sales", "./routes/admin/flash-sale.tsx"),
    ]),
  ]),

  // ── 404 — Wildcard (phải ở cuối cùng) ─────────────────────────────────────
  route("*", "./public/pages/NotFoundPage.tsx"),
] satisfies RouteConfig;
