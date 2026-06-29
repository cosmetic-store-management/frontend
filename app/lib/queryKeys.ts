/**
 * Centralized TanStack Query key registry.
 * Import QK thay vì hard-code string arrays trực tiếp trong hooks.
 * Giúp tránh cache key typos và dễ invalidate từ bất kỳ đâu.
 */
export const QK = {
  // ── Auth / User ─────────────────────────────────────────────
  me: () => ["me"] as const,

  // ── Products ──────────────────────────────────────────────
  products: (filters?: unknown) => ["products", filters] as const,
  product: (slug: string) => ["product", slug] as const,

  // ── Catalog (với full filter/pagination state) ─────────────
  catalog: (params: unknown) => ["catalog", params] as const,

  // ── Categories ────────────────────────────────────────────
  categories: () => ["public_categories"] as const,

  // ── Brands ────────────────────────────────────────────────
  brands: () => ["brands"] as const,

  // ── User Interactions ─────────────────────────────────────
  favorites: () => ["favorites"] as const,
  recentlyViewed: (page: number) => ["recentlyViewed", page] as const,

  // ── Orders ────────────────────────────────────────────────
  myOrders: () => ["myOrders"] as const,

  // ── Vouchers ──────────────────────────────────────────────
  myVouchers: () => ["myVouchers"] as const,
  publicVouchers: () => ["publicVouchers"] as const,
  walletVouchers: () => ["walletVouchers"] as const,
  allWalletVouchers: () => ["allWalletVouchers"] as const,

  // ── Reviews ───────────────────────────────────────────────
  reviews: (productId: string, params?: unknown) =>
    ["reviews", productId, params] as const,

  // ── User Account ──────────────────────────────────────────
  myAccount: () => ["myAccount"] as const,
  tier: () => ["myTierInfo"] as const,

  // ── Product Recommendations ───────────────────────────────
  recommendations: (id: string, limit: number) =>
    ["product_recommendations", id, limit] as const,

  // ── Settings ──────────────────────────────────────────────
  settings: () => ["publicSettings"] as const,

  // ── Single Order ──────────────────────────────────────────
  order: (id: string) => ["order", id] as const,
} as const;
