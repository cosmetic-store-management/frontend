import { useMemo } from "react";
import { Link } from "react-router";
import { ChevronRight, Tag } from "lucide-react";
import { useProducts } from "@/public/hooks/useProducts";
import { useCategories } from "@/public/hooks/useCategories";
import { usePublicBrands } from "@/public/hooks/useBrands";
import { useRecentlyViewed } from "@/public/hooks/useUser";
import { usePublicAuthStore } from "@/store";
import { ProductCard } from "../components/ProductCard";
import { HomeVouchers } from "../components/HomeVouchers";
import { FlashSaleSection } from "../components/FlashSaleSection";
import { RecommendationSection } from "../components/RecommendationSection";
import { HeroCarousel } from "../components/HeroCarousel";
import { ProductGridSkeleton } from "@/components/ui/skeleton";
import { ProductCarousel } from "../components/ProductCarousel";

export default function HomePage() {
  const { data: categories = [] } = useCategories();
  const { data: brandsRaw = [] } = usePublicBrands();
  const { data: prodData, isLoading } = useProducts({ limit: 30 });
  const { user } = usePublicAuthStore();

  // Chỉ gọi recently viewed khi đã đăng nhập — tránh 401 redirect
  const { data: viewedData } = useRecentlyViewed(1, 8, { enabled: !!user });

  const products = useMemo(
    () =>
      (Array.isArray(prodData) ? prodData : (prodData as any)?.products) || [],
    [prodData],
  );

  // New arrivals: 6 sản phẩm đầu (BE sort createdAt desc)
  const newArrivals = useMemo(() => products.slice(0, 6), [products]);

  // Discover: tất cả trừ new arrivals
  const discoverProducts = useMemo(() => products.slice(6), [products]);

  // Categories: chỉ hiện danh mục có sản phẩm, đã sort theo productCount DESC (sortOrder)
  const activeCategories = useMemo(
    () =>
      (Array.isArray(categories) ? categories : []).filter(
        (c: any) => (c.productCount ?? 0) > 0,
      ),
    [categories],
  );

  // Brands: sort by productCount DESC, chỉ lấy brands có sản phẩm, top 12
  const featuredBrands = useMemo(() => {
    const list = Array.isArray(brandsRaw) ? brandsRaw : [];
    return [...list]
      .filter((b: any) => (b.productCount ?? 0) > 0)
      .sort((a: any, b: any) => (b.productCount ?? 0) - (a.productCount ?? 0))
      .slice(0, 12);
  }, [brandsRaw]);

  const viewedProducts = user ? viewedData?.products || [] : [];
  const showViewedSection = viewedProducts.length > 0;

  return (
    <div className="bg-background w-full flex-1">
      {/* 1. HERO CAROUSEL */}
      <HeroCarousel />

      <div className="flex flex-col gap-8 pt-6 pb-12 animate-page-enter max-w-300 w-full mx-auto px-4">
        {/* 2. VOUCHERS */}
        <HomeVouchers />

        {/* 2.5 FLASH SALE */}
        <FlashSaleSection />

        {/* 3. DANH MỤC NỔI BẬT */}
        {activeCategories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl text-section-heading">
                Shop by Category
              </h2>
              <Link
                to="/categories"
                className="text-brand text-sm font-semibold underline flex items-center gap-1 hover:opacity-80 transition-opacity"
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {activeCategories.slice(0, 8).map((cat: any, i: number) => (
                <Link
                  key={cat.id || cat._id}
                  to={`/products?category=${cat.slug}`}
                  className="card-animate group flex items-center gap-3 p-3 bg-surface border border-border/40 hover:border-brand/50 hover:bg-white hover:shadow-md hover:-translate-y-1 transition-all rounded-lg"
                  style={{ "--card-i": i } as React.CSSProperties}
                >
                  {/* Icon */}
                  <div className="w-10 h-10 shrink-0 flex items-center justify-center bg-white/80 overflow-hidden rounded-sm">
                    {cat.iconUrl || cat.imageUrl ? (
                      <img
                        src={cat.iconUrl || cat.imageUrl}
                        alt={cat.name}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <Tag className="w-5 h-5 text-brand" />
                    )}
                  </div>
                  {/* Text */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink group-hover:text-brand transition-colors truncate">
                      {cat.name}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {cat.productCount} items
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 4. THƯƠNG HIỆU NỔI BẬT */}
        {featuredBrands.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl text-section-heading">
                Featured Brands
              </h2>
              <Link
                to="/brands"
                className="text-brand text-sm font-semibold underline flex items-center gap-1"
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {featuredBrands.map((brand: any) => (
                <Link
                  key={brand.id || brand._id}
                  to={`/products?brandId=${brand.id || brand._id}`}
                  className="group rounded-lg overflow-hidden border border-border/40 aspect-2/1 bg-surface flex items-center justify-center p-4 hover:border-brand/50 hover:shadow-md hover:-translate-y-1 transition-all"
                >
                  {(brand.imageUrl || brand.logoUrl) &&
                  !(brand.imageUrl || brand.logoUrl || "").includes(
                    "ui-avatars",
                  ) ? (
                    <img
                      src={brand.imageUrl || brand.logoUrl}
                      alt={brand.name}
                      className="max-w-full max-h-full object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                    />
                  ) : (
                    <span className="font-bold text-ink-muted group-hover:text-brand text-sm transition-colors text-center">
                      {brand.name}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 5. HÀNG MỚI VỀ */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex items-center mb-4">
              <h2 className="text-2xl md:text-3xl text-section-heading">
                Just Dropped
              </h2>
            </div>
            <ProductCarousel products={newArrivals} />
          </section>
        )}

        {/* 6. XEM LẠI GẦN ĐÂY — chỉ hiện khi đã login + có dữ liệu */}
        {showViewedSection && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl md:text-3xl text-section-heading">
                Recently Viewed
              </h2>
              <Link
                to="/account?view=viewed"
                className="text-brand text-sm font-semibold underline flex items-center gap-1"
              >
                See all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <ProductCarousel products={viewedProducts.slice(0, 10)} />
          </section>
        )}

        {/* 7. RECOMMENDATION SECTION */}
        <RecommendationSection />

        {/* 8. GỢI Ý HÔM NAY (Khám phá chung) */}
        <section>
          <div className="flex items-center mb-4">
            <h2 className="text-2xl md:text-3xl text-section-heading">
              The Edit
            </h2>
          </div>

          {isLoading ? (
            <ProductGridSkeleton count={10} />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {discoverProducts.map((product: any, i: number) => (
                <div
                  key={product.id}
                  className="card-animate"
                  style={{ "--card-i": Math.min(i, 9) } as React.CSSProperties}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Link
                to="/products"
                className="btn-outline px-12 py-3 rounded-full hover:shadow-md hover:-translate-y-1"
              >
                Keep exploring
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
