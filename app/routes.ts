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
    index("./routes/index.tsx"),
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
      route("account", "./routes/public/account.tsx"),
    ]),
  ]),

  // ── Auth ──────────────────────────────────────────────────────────
  layout("./auth/layout/Layout.tsx", [
    route("login", "./routes/auth/login.tsx"),
    route("register", "./routes/auth/register.tsx"),
    route("forgot-password", "./routes/auth/forgot-password.tsx"),
    route("reset-password", "./routes/auth/reset-password.tsx"),
    route("auth/social-callback", "./routes/auth/callback.tsx"),
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

  // ── 404 — Wildcard ─────────────────────────────────────
  route("*", "./public/pages/NotFoundPage.tsx"),
] satisfies RouteConfig;
