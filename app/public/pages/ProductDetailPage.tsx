import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";

import { Star, ArrowLeft, Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import { useProduct } from "@/public/hooks/useProducts";
import { useCartStore } from "@/public/store/cart.store";
import { toast } from "@/lib/toast";
import { ProductReviews } from "../components/products/ProductReviews";
import { ProductImageGallery } from "../components/products/ProductImageGallery";
import { ExpandableContent } from "../components/common/ExpandableContent";
import { RelatedProducts } from "../components/products/RelatedProducts";
import { ProductVouchers } from "../components/products/ProductVouchers";
import { ProductRecommendations } from "../components/products/ProductRecommendations";
import { useAuth } from "@/auth/hooks/useAuth";
import {
  useRecordViewed,
  useFavorites,
  useToggleFavorite,
} from "@/public/hooks/useUser";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";
import { useFavoriteStore } from "@/public/store/favorite.store";

export function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const variantId = searchParams.get("variant");

  const addItem = useCartStore((s) => s.addItem);
  const { isLoggedIn } = useAuth();
  const recordViewedMutation = useRecordViewed();
  const toggleFavoriteMutation = useToggleFavorite();
  const { data: favorites } = useFavorites();

  const { data: product, isLoading, isError } = useProduct(slug as string);

  useEffect(() => {
    if (product && isLoggedIn) {
      recordViewedMutation.mutate(product.id);
    }
    {
       
    }
  }, [product?.id, isLoggedIn]);

  // Removed old document.title useEffect to use react-helmet-async

  const localFavorites = useFavoriteStore((state) => state.itemIds);
  const toggleLocalFavorite = useFavoriteStore((state) => state.toggleFavorite);

  const [rawQuantity, setRawQuantity] = useState(1);
  const [prevSlug, setPrevSlug] = useState(slug);

  if (slug !== prevSlug) {
    setPrevSlug(slug);
    setRawQuantity(1);
  }

  const selectedVariant = (() => {
    if (!product || !product.variants?.length) return null;
    if (variantId) {
      const found = product.variants.find(
        (v: any) => String(v.id) === variantId || String(v.sku) === variantId,
      );
      if (found) return found;
    }
    return product.variants[0];
  })();

  const stock = selectedVariant ? selectedVariant.stock : 0;
  const quantity = Math.max(1, Math.min(rawQuantity, stock > 0 ? stock : 1));
  const setQuantity = setRawQuantity;

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <p className="text-ink-muted mb-8">
          This product does not exist or has been removed.
        </p>
        <Link
          to="/products"
          className="btn-primary inline-flex justify-center"
        >
          Back to products
        </Link>
      </div>
    );
  }

  const variants = (product.variants || []).filter((v: any) => v.isActive !== false);
  const allVariantsInactive = (product.variants || []).length > 0 && variants.length === 0;
  const minPrice =
    variants.length > 0 ? Math.min(...variants.map((v: any) => v.price)) : 0;
  const maxPrice =
    variants.length > 0 ? Math.max(...variants.map((v: any) => v.price)) : 0;

  const displayPrice = selectedVariant
    ? selectedVariant.price.toLocaleString("vi-VN") + "₫"
    : minPrice === maxPrice
      ? minPrice.toLocaleString("vi-VN") + "₫"
      : `${minPrice.toLocaleString("vi-VN")}₫ - ${maxPrice.toLocaleString("vi-VN")}₫`;

  const isOutOfStock = stock === 0;

  const isFavorite = isLoggedIn
    ? favorites?.some((p: any) => p.id === product.id)
    : localFavorites.includes(product.id);

  const handleToggleFavorite = () => {
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

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Please select a variant");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id || selectedVariant.sku,
      name: product.name,
      variantName: selectedVariant.name || selectedVariant.sku || "Default",
      price:
        selectedVariant.discountPrice &&
          selectedVariant.discountPrice < selectedVariant.price
          ? selectedVariant.discountPrice
          : selectedVariant.price,
      quantity,
      imageUrl: product.imageUrl,
      stock: selectedVariant.stock ?? 999,
      slug: product.slug,
    });
    toast.success("Added to cart!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (selectedVariant) {
      if (!isLoggedIn) {
        navigate("/login?returnUrl=/checkout");
      } else {
        navigate("/checkout");
      }
    }
  };

  return (
    <div className="max-w-300 w-full mx-auto px-4 py-8 animate-page-enter">
      {/* Breadcrumb / Back */}
      <div className="flex items-center text-[13px] text-muted-foreground mb-6">
        <button
          onClick={() => navigate(-1)}
          className="hover:text-foreground transition-colors flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-sm bg-muted hover:bg-muted/80"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Go Back
        </button>
      </div>

      <>
        <title>
          {(product as any).metaTitle || `${product.name} | GlowUp Cosmetics`}
        </title>
        <meta
          name="description"
          content={
            (product as any).metaDescription ||
            product.description?.substring(0, 160).replace(/<[^>]+>/g, "") ||
            "Shop authentic cosmetics at GlowUp Cosmetics"
          }
        />
        {(product as any).metaKeywords && (
          <meta name="keywords" content={(product as any).metaKeywords} />
        )}
        <meta
          property="og:title"
          content={(product as any).metaTitle || product.name}
        />
        <meta
          property="og:description"
          content={
            (product as any).metaDescription ||
            product.description?.substring(0, 160).replace(/<[^>]+>/g, "")
          }
        />
        <meta property="og:image" content={product.imageUrl} />
      </>

      <div className="premium-card p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[45%_1fr] gap-8 md:gap-10 lg:gap-14">
          {/* Product Images - Left Column */}
          <div className="space-y-4 w-full overflow-hidden">
            <ProductImageGallery
              productName={product.name}
              mainImage={
                product.imageUrl ||
                "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80"
              }
              imageUrls={product.imageUrls || []}
              selectedVariantImage={selectedVariant?.imageUrl}
              isActive={product.isActive}
            />
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1
              className="text-2xl sm:text-3xl font-bold text-foreground mb-3 leading-tight"
              style={{
                fontFamily:
                  "var(--font-display, 'Playfair Display', Georgia, serif)",
              }}
            >
              {product.name}
            </h1>

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3 text-sm text-ink-muted">
                {(product.numReviews ?? 0) > 0 ? (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 text-warning fill-warning"
                      />
                    ))}
                    <span className="ml-1">({product.numReviews} reviews)</span>
                  </div>
                ) : (
                  <span className="text-ink-muted">No reviews yet</span>
                )}
                <div className="w-px h-4 bg-border"></div>
                <span>{product.soldCount || 0} sold</span>
              </div>

              <button
                onClick={handleToggleFavorite}
                aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                className={cn(
                  "p-2 rounded-full hover:bg-surface transition-colors flex items-center justify-center",
                  isFavorite
                    ? "text-danger"
                    : "text-ink-muted hover:text-danger",
                )}
              >
                <Heart
                  className={cn("w-6 h-6", isFavorite && "fill-danger")}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {/* Price block */}
            <div className="flex items-baseline gap-3 mb-4">
              {selectedVariant?.discountPrice &&
                selectedVariant.discountPrice < selectedVariant.price ? (
                <>
                  <span
                    className="text-3xl font-black tracking-tight"
                    style={{ color: "hsl(352, 72%, 48%)" }}
                  >
                    {selectedVariant.discountPrice.toLocaleString("vi-VN")}₫
                  </span>
                  <span className="text-lg text-muted-foreground line-through font-medium">
                    {selectedVariant.price.toLocaleString("vi-VN")}₫
                  </span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-sm text-white"
                    style={{ background: "hsl(352, 72%, 52%)" }}
                  >
                    -
                    {Math.round(
                      (1 -
                        selectedVariant.discountPrice / selectedVariant.price) *
                      100,
                    )}
                    %
                  </span>
                </>
              ) : (
                <span className="text-3xl font-black text-foreground tracking-tight">
                  {displayPrice}
                </span>
              )}
            </div>

            <ProductVouchers />

            {/* Variant Selection */}
            {variants.length > 1 && (
              <div className="mt-5 mb-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Select variant
                </p>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v: any, idx: number) => (
                    <button
                      key={v.id || v.name || idx}
                      onClick={() => {
                        setSearchParams(
                          { variant: String(v.id || v.sku) },
                          { replace: true, preventScrollReset: true },
                        );
                      }}
                      disabled={v.stock === 0}
                      className={`flex items-center gap-2 h-10 px-4 rounded-sm border-2 text-sm font-semibold transition-all duration-150 ${selectedVariant?.id === v.id ||
                          (selectedVariant && selectedVariant.name === v.name)
                          ? "border-brand bg-brand/5 text-brand shadow-sm"
                          : v.stock === 0
                            ? "border-border opacity-40 cursor-not-allowed"
                            : "border-border hover:border-brand/50 text-foreground"
                        }`}
                    >
                      {v.imageUrl && (
                        <img
                          src={v.imageUrl || product.imageUrl}
                          className="w-6 h-6 rounded-md object-cover shrink-0"
                          alt=""
                        />
                      )}
                      {v.name || v.sku || `0${idx + 1}`}
                      {v.stock === 0 && (
                        <span className="text-[10px] ml-1 opacity-60">
                          Out of stock
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Area */}
            <div
              className={`space-y-4 ${variants.length > 1 ? "mt-6 pt-5 border-t border-border" : "mt-6"}`}
            >
              {/* Qty + Stock */}
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-sm h-11 w-32 overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                    className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-brand transition-colors disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      let val = parseInt(e.target.value) || 1;
                      val = Math.max(1, Math.min(val, stock));
                      setQuantity(val);
                    }}
                    onBlur={(e) => {
                      if (!e.target.value || parseInt(e.target.value) < 1)
                        setQuantity(1);
                    }}
                    className="flex-1 w-full h-full text-center font-bold text-foreground border-x border-border focus:outline-none bg-transparent text-sm"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                    aria-label="Increase quantity"
                    className="w-10 h-full flex items-center justify-center text-muted-foreground hover:text-brand transition-colors disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {selectedVariant && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <span>In stock:</span>
                    <span
                      className={`font-semibold ${stock <= 5 ? "text-destructive" : "text-foreground"}`}
                    >
                      {stock}
                    </span>
                  </span>
                )}
              </div>

              {/* CTAs */}
              {allVariantsInactive ? (
                <div className="mt-4 p-4 border border-destructive bg-destructive/5 rounded-sm text-center">
                  <p className="text-sm font-semibold text-destructive">
                    This product is temporarily unavailable
                  </p>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || !product.isActive}
                    className="flex-1 flex justify-center items-center gap-2 border-2 border-brand text-brand font-bold py-3.5 px-6 rounded-sm transition-all duration-150 hover:bg-brand/5 hover:shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag className="w-5 h-5" /> Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock || !product.isActive}
                    className="btn-primary flex-1 py-3.5 px-6 shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      {!allVariantsInactive && (
        <div className="fixed bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-md border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-100 md:hidden flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || !product.isActive}
            className="flex-1 flex justify-center items-center gap-2 border-2 border-brand text-brand font-bold py-3 rounded-sm transition-all hover:bg-brand/5 active:scale-[0.98] disabled:opacity-40 text-sm"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={isOutOfStock || !product.isActive}
            className="btn-primary flex-1 py-3 text-sm disabled:opacity-40"
          >
            Buy Now
          </button>
        </div>
      )}

      {/* Block 2: Related products */}
      {product.categoryId && (
        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />
      )}

      {/* Product Detail + Reviews */}
      <div className="mt-4 premium-card overflow-visible! p-6 md:p-10">
        <h2
          className="text-2xl font-bold text-foreground mb-6 text-center"
          style={{
            fontFamily:
              "var(--font-display, 'Playfair Display', Georgia, serif)",
          }}
        >
          Product Details
        </h2>
        <ExpandableContent maxHeight={250}>
          <div
            className="prose prose-sm sm:prose-base max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                product.description || "No product details available.",
              ),
            }}
          />
        </ExpandableContent>

        <div className="mt-10">
          {product && <ProductReviews product={product} />}
        </div>
      </div>

      {/* Block 5: Recommendations for you */}
      <div className="mt-4">
        {product && <ProductRecommendations productId={product.id} />}
      </div>
    </div>
  );
}
