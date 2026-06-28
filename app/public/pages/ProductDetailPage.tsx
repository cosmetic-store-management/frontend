import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router";
import { Helmet } from "react-helmet-async";

import { Star, ArrowLeft, Minus, Plus, ShoppingBag, Heart } from "lucide-react";
import { useProduct } from "@/public/hooks/useProducts";
import { useCartStore } from "@/store/cart.store";
import { toast } from "@/lib/toast";
import { ProductReviews } from "../components/ProductReviews";
import { ProductImageGallery } from "../components/ProductImageGallery";
import { ExpandableContent } from "../components/ExpandableContent";
import { RelatedProducts } from "../components/RelatedProducts";
import { ProductVouchers } from "../components/ProductVouchers";
import { ProductRecommendations } from "../components/ProductRecommendations";
import { useAuth } from "@/auth/hooks/usePublicAuth";
import {
  useRecordViewed,
  useFavorites,
  useToggleFavorite,
} from "@/public/hooks/useUser";
import { cn } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { ProductDetailSkeleton } from "@/components/ui/skeleton";

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
      /* eslint-disable-next-line  */
    }
  }, [product?.id, isLoggedIn]);

  // Removed old document.title useEffect to use react-helmet-async

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);

  // Reset state khi chuyển sang sản phẩm khác
  useEffect(() => {
    {
      /* eslint-disable-next-line  */
    }
    setSelectedVariant(null);
    {
      /* eslint-disable-next-line  */
    }
    setQuantity(1);
  }, [slug]);

  // Sync variant từ URL hoặc tự chọn variant đầu tiên
  useEffect(() => {
    if (!product || !product.variants?.length) return;

    if (variantId) {
      const found = product.variants.find(
        (v: any) => String(v.id) === variantId || String(v.sku) === variantId,
      );
      if (found) {
        {
          /* eslint-disable-next-line  */
        }
        setSelectedVariant(found);
        return;
      }
    }

    // Chỉ auto-select nếu chưa có variant hoặc variant không thuộc product này
    const belongsToProduct = product.variants.some(
      (v: any) => v.id === selectedVariant?.id,
    );
    if (!belongsToProduct) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, variantId, selectedVariant]);

  // Cap quantity khi variant thay đổi
  useEffect(() => {
    if (selectedVariant) {
      {
        /* eslint-disable-next-line  */
      }
      setQuantity((prev) => Math.max(1, Math.min(prev, selectedVariant.stock)));
    }
  }, [selectedVariant]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (isError || !product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy sản phẩm</h2>
        <p className="text-ink-muted mb-8">
          Sản phẩm này không tồn tại hoặc đã bị xóa.
        </p>
        <Link
          to="/products"
          className="btn-hover bg-brand text-white px-6 py-2 rounded-full font-bold"
        >
          Quay lại danh sách sản phẩm
        </Link>
      </div>
    );
  }

  const variants = product.variants || [];
  const minPrice =
    variants.length > 0 ? Math.min(...variants.map((v: any) => v.price)) : 0;
  const maxPrice =
    variants.length > 0 ? Math.max(...variants.map((v: any) => v.price)) : 0;

  const displayPrice = selectedVariant
    ? selectedVariant.price.toLocaleString("vi-VN") + "₫"
    : minPrice === maxPrice
      ? minPrice.toLocaleString("vi-VN") + "₫"
      : `${minPrice.toLocaleString("vi-VN")}₫ - ${maxPrice.toLocaleString("vi-VN")}₫`;

  const stock = selectedVariant ? selectedVariant.stock : 0;
  const isOutOfStock = stock === 0;

  const isFavorite = favorites?.some((p: any) => p.id === product.id);

  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      toast.error("Vui lòng đăng nhập để lưu sản phẩm yêu thích");
      return;
    }
    toggleFavoriteMutation.mutate(product.id);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error("Vui lòng chọn loại sản phẩm");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id || selectedVariant.sku,
      name: product.name,
      variantName: selectedVariant.name || selectedVariant.sku || "Mặc định",
      price: selectedVariant.price,
      quantity,
      imageUrl: product.imageUrl,
      stock: selectedVariant.stock ?? 999,
      slug: product.slug,
    });
    toast.success("Đã thêm vào giỏ hàng!");
  };

  const handleBuyNow = () => {
    handleAddToCart();
    if (selectedVariant) {
      navigate("/checkout");
    }
  };

  return (
    <div className="max-w-[1200px] w-full mx-auto px-4 py-8 animate-page-enter">
      {/* Breadcrumb / Back Button */}
      <div className="flex items-center text-[13px] text-muted-foreground mb-8">
        <button
          onClick={() => navigate(-1)}
          className="hover:text-primary transition-colors flex items-center gap-1 font-medium bg-muted px-2 py-1 rounded-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Trở về
        </button>
      </div>

      <Helmet>
        <title>
          {(product as any).metaTitle || `${product.name} | GlowUp Cosmetics`}
        </title>
        <meta
          name="description"
          content={
            (product as any).metaDescription ||
            product.description?.substring(0, 160).replace(/<[^>]+>/g, "") ||
            "Mua sắm mỹ phẩm chính hãng tại GlowUp Cosmetics"
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
      </Helmet>

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
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-ink mb-3 leading-tight tracking-tight">
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
                    <span className="ml-1">
                      ({product.numReviews} đánh giá)
                    </span>
                  </div>
                ) : (
                  <span className="text-ink-muted">Chưa có đánh giá</span>
                )}
                <div className="w-px h-4 bg-border"></div>
                <span>Đã bán {product.soldCount || 0}</span>
              </div>

              <button
                onClick={handleToggleFavorite}
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

            <div className="text-3xl font-black text-ink mb-2 tracking-tight">
              {displayPrice}
            </div>

            <ProductVouchers />

            {/* Variant Selection */}
            {variants.length > 1 && (
              <div className="mt-6 mb-8">
                <div className="flex flex-wrap gap-3">
                  {variants.map((v: any, idx: number) => (
                    <button
                      key={v.id || v.name || idx}
                      onClick={() => {
                        setSelectedVariant(v);
                        setSearchParams(
                          { variant: String(v.id || v.sku) },
                          { replace: true, preventScrollReset: true },
                        );
                      }}
                      disabled={v.stock === 0}
                      className={`flex items-stretch border transition-all h-10 ${
                        selectedVariant?.id === v.id ||
                        (selectedVariant && selectedVariant.name === v.name)
                          ? "border-brand "
                          : v.stock === 0
                            ? "border-border opacity-50 cursor-not-allowed grayscale"
                            : "border-border hover:border-brand"
                      }`}
                    >
                      <div className="w-10 h-full p-0.5 bg-white shrink-0 flex items-center justify-center">
                        <img
                          src={v.imageUrl || product.imageUrl}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      </div>
                      <div
                        className={`px-4 flex items-center justify-center text-sm font-medium transition-colors ${
                          selectedVariant?.id === v.id ||
                          (selectedVariant && selectedVariant.name === v.name)
                            ? "bg-brand text-white"
                            : "bg-surface-soft text-ink"
                        }`}
                      >
                        {v.name || v.sku || `0${idx + 1}`}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Area */}
            <div className="space-y-4 mt-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-border rounded-sm h-12 w-32 ">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="w-10 h-full flex items-center justify-center text-ink-muted hover:text-brand transition-colors disabled:opacity-50 disabled:hover:text-ink-muted"
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
                    className="flex-1 w-full h-full text-center font-semibold text-ink border-x border-border focus:outline-none bg-transparent"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    disabled={quantity >= stock}
                    className="w-10 h-full flex items-center justify-center text-ink-muted hover:text-brand transition-colors disabled:opacity-50 disabled:hover:text-ink-muted"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-sm text-ink-muted">
                  {selectedVariant ? `Còn ${stock} sản phẩm` : ""}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || !product.isActive}
                  className="flex-1 flex justify-center items-center gap-2 bg-surface-muted hover:bg-border text-ink font-bold py-3.5 px-6 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingBag className="w-5 h-5" /> Thêm vào giỏ
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || !product.isActive}
                  className="btn-hover flex-1 bg-brand hover:bg-brand-dark text-white font-bold py-3.5 px-6 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-ui-soft"
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-3 bg-surface border-t border-border shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-[100] md:hidden flex gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || !product.isActive}
          className="flex-1 flex justify-center items-center gap-2 bg-surface-muted hover:bg-border text-ink font-bold py-3 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          <ShoppingBag className="w-4 h-4" /> Thêm vào giỏ
        </button>
        <button
          onClick={handleBuyNow}
          disabled={isOutOfStock || !product.isActive}
          className="flex-1 bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed  text-sm"
        >
          Mua ngay
        </button>
      </div>

      {/* Khối 2: Sản phẩm liên quan */}
      {product.categoryId && (
        <RelatedProducts
          categoryId={product.categoryId}
          currentProductId={product.id}
        />
      )}

      {/* Khối 3 & 4: Chi tiết sản phẩm & Đánh giá */}
      <div className="mt-4 premium-card !overflow-visible p-6 md:p-10">
        <h2 className="text-2xl font-black text-ink mb-6 uppercase tracking-wider text-center">
          Chi Tiết Sản Phẩm
        </h2>
        <ExpandableContent maxHeight={250}>
          <div
            className="prose prose-sm sm:prose-base max-w-none text-ink-muted leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                product.description || "Chưa có thông tin chi tiết.",
              ),
            }}
          />
        </ExpandableContent>

        <div className="mt-10">
          {product && <ProductReviews product={product} />}
        </div>
      </div>

      {/* Khối 5: Đề xuất cho bạn */}
      <div className="mt-4">
        {product && <ProductRecommendations productId={product.id} />}
      </div>
    </div>
  );
}
