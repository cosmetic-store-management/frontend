import React from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { ShoppingCart, Heart } from "lucide-react";
import { useAuth } from "@/auth/hooks/useAuth";
import { useToggleFavorite, useFavorites } from "../../hooks/useUser";
import { toast } from "@/lib/toast";
import { useFavoriteStore } from "@/public/store/favorite.store";

interface ProductCardProps {
  product: any;
  layout?: "grid" | "list";
  priority?: boolean;
}

/** Sản phẩm mới nếu createdAt < 30 ngày trước */
function isNewProduct(createdAt?: string | Date): boolean {
  if (!createdAt) return false;
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return new Date(createdAt).getTime() > thirtyDaysAgo;
}

/** Phân bổ nhãn FREESHIP linh hoạt dựa trên product ID */
const FREESHIP_LABELS = [
  "FREE SHIPPING",
  "NATIONWIDE",
  "LOCAL DELIVERY",
] as const;
function getFreeshiplabel(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return FREESHIP_LABELS[hash % FREESHIP_LABELS.length];
}

export const ProductCard = React.memo(function ProductCard({
  product,
  layout = "grid",
  priority = false,
}: ProductCardProps) {
  const variants = product.variants || [];

  // Calculate selling price and original price
  let minSellingPrice = product.price || 0;
  let maxSellingPrice = product.price || 0;
  let maxOriginalPrice = product.originalPrice || 0;
  let hasDiscount = false;
  let discountPct = 0;

  if (variants.length > 0) {
    const sellingPrices = variants.map((v: any) => v.discountPrice || v.price);
    const originalPrices = variants.map((v: any) => v.price);

    minSellingPrice = Math.min(...sellingPrices);
    maxSellingPrice = Math.max(...sellingPrices);
    maxOriginalPrice = Math.max(...originalPrices);

    if (maxOriginalPrice > minSellingPrice) {
      hasDiscount = true;
      discountPct = Math.round((1 - minSellingPrice / maxOriginalPrice) * 100);
    }
  } else if (product.originalPrice && product.originalPrice > minSellingPrice) {
    hasDiscount = true;
    maxOriginalPrice = product.originalPrice;
    discountPct = Math.round((1 - minSellingPrice / maxOriginalPrice) * 100);
  }

  const priceDisplay =
    minSellingPrice === maxSellingPrice
      ? minSellingPrice.toLocaleString("vi-VN") + "đ"
      : `${minSellingPrice.toLocaleString("vi-VN")}đ – ${maxSellingPrice.toLocaleString("vi-VN")}đ`;

  const isOutOfStock =
    variants.length > 0 && variants.every((v: any) => v.stock === 0);
  const isInactive = product.isActive === false;
  
  const isNew = isNewProduct(product.createdAt);
  const isHot = !isNew && (product.soldCount || 0) >= 100;

  // Ảnh hover — imageUrls[0] nếu có (khác imageUrl chính)
  const hoverImage: string | null = (() => {
    const urls: string[] = Array.isArray(product.imageUrls)
      ? product.imageUrls
      : [];
    const alt = urls.find((u) => u !== product.imageUrl);
    return alt ?? null;
  })();

  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: favorites = [] } = useFavorites();
  const toggleFavoriteMutation = useToggleFavorite();
  const { itemIds: localFavorites, toggleFavorite: toggleLocalFavorite } = useFavoriteStore();
  
  const isFavorite = isLoggedIn
    ? favorites.some((fav: any) => fav.id === product.id)
    : localFavorites.includes(product.id);

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      toggleLocalFavorite(product.id);
      toast.success(
        localFavorites.includes(product.id)
          ? "Removed from wishlist"
          : "Added to wishlist"
      );
      return;
    }
    toggleFavoriteMutation.mutate(product.id);
  };

  // ────────────────────────── LIST ──────────────────────────
  if (layout === "list") {
    return (
      <Link
        to={`/product/${product.slug}`}
        className="premium-card group flex flex-row h-36"
      >
        <div className="relative w-36 h-full shrink-0 overflow-hidden bg-surface-soft">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt=""
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-muted/30">
              <ShoppingCart className="w-8 h-8" />
            </div>
          )}
          {isOutOfStock && !isInactive && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60">
              <span className="bg-foreground text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
                Sold Out
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-col flex-1 p-3 justify-between min-w-0">
          {product.brandName && (
            <span className="text-[11px] text-ink-muted uppercase tracking-wider">
              {product.brandName}
            </span>
          )}
          <h3 className="text-sm font-medium text-ink line-clamp-2 leading-snug transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[#C81D25] font-bold text-sm">
                {priceDisplay}
              </span>
              {hasDiscount && (
                <span className="ml-2 text-xs text-ink-muted line-through">
                  {maxOriginalPrice.toLocaleString("vi-VN")}đ
                </span>
              )}
            </div>
            <button onClick={handleToggleFavorite} className="p-1 shrink-0" aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}>
              <Heart
                className={`w-4 h-4 ${isFavorite ? "fill-[#C81D25] text-[#C81D25]" : "text-ink-muted/50"}`}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>
      </Link>
    );
  }

  // ────────────────────────── GRID ──────────────────────────
  return (
    <Link
      to={`/product/${product.slug}`}
      className="premium-card group flex flex-col h-full"
    >
      {/* ── Image ── */}
      <div className="relative aspect-square overflow-hidden bg-surface-soft">
        {/* Primary image */}
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt=""
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${hoverImage ? "group-hover:opacity-0" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ink-muted/20">
            <ShoppingCart className="w-10 h-10" />
          </div>
        )}

        {/* Hover / secondary image (opacity crossfade) */}
        {hoverImage && (
          <img
            src={hoverImage}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        {/* Discount overlay removed as requested */}

        {/* Out of stock overlay */}
        {isOutOfStock && !isInactive && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <span className="bg-foreground text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider">
              Out of stock
            </span>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-2.5 flex flex-col flex-1">
        {/* Badges row: FREESHIP + NEW / HOT */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          <span className="bg-[#0b2b5e] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-tight">
            {getFreeshiplabel(product.id || product._id || product.name || "")}
          </span>
          {isNew && (
            <span className="bg-brand text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-tight">
              NEW
            </span>
          )}
          {isHot && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-tight"
              style={{ background: "hsl(22, 90%, 50%)", color: "white" }}
            >
              HOT
            </span>
          )}
        </div>

        {/* Brand */}
        {product.brandName && (
          <span className="text-[10px] text-ink-muted uppercase tracking-wider line-clamp-1 mb-0.5">
            {product.brandName}
          </span>
        )}

        {/* Product name */}
        <h3 className="text-[13px] font-medium text-ink line-clamp-2 leading-snug transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        <div className="mt-auto pt-1.5 flex items-end justify-between gap-1">
          <div className="min-w-0">
            <div className="text-[#C81D25] font-bold text-[14px] leading-tight">
              {priceDisplay}
            </div>
            {hasDiscount && (
              <div className="text-[11px] text-ink-muted line-through leading-tight mt-0.5">
                {maxOriginalPrice.toLocaleString("vi-VN")}đ
              </div>
            )}
          </div>
          {hasDiscount && (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mb-1 text-white"
              style={{ background: "hsl(352, 72%, 52%)" }}
            >
              -{discountPct}%
            </div>
          )}
        </div>

        {/* Sold count + heart (luôn hiện — giống Skinfood) */}
        <div className="mt-1 flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            {product.soldCount > 0 && (
              <>
                <span className="font-semibold text-foreground">
                  {product.soldCount >= 1000
                    ? (product.soldCount / 1000).toFixed(1).replace(".0", "") +
                      "k"
                    : product.soldCount}
                </span>{" "}
                sold
              </>
            )}
          </span>
          <button
            onClick={handleToggleFavorite}
            className="p-1 hover:scale-110 transition-transform -mr-0.5 shrink-0"
            aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`w-4.5 h-4.5 ${isFavorite ? "fill-[#C81D25] text-[#C81D25]" : "text-ink-muted/60"}`}
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>
    </Link>
  );
});
