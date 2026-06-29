import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ProductCard } from "../components/products/ProductCard";
import { useProductCatalog } from "../hooks/useProductCatalog";
import { ProductGridSkeleton } from "@/components/ui/skeleton";

export function ProductCatalogPage() {
  const { state, data, actions } = useProductCatalog();
  const {
    minPriceInput,
    maxPriceInput,
    sortBy,
    isMobileFilterOpen,
    openFilters,
    currentPage,
    selectedCategories,
    selectedBrands,
    categoryParam,
  } = state;
  const {
    categories,
    products,
    brands,
    totalPages,
    isLoading,
    isFetching,
    sidebarTitle,
    displaySubcategories,
  } = data;
  const {
    setSearchTerm,
    setMinPriceInput,
    setMaxPriceInput,
    setSortBy,
    setIsMobileFilterOpen,
    setCurrentPage,
    toggleFilter,
    handlePriceChange,
    toggleCategory,
    toggleBrand,
    applyPriceFilter,
    resetBrands,
    setSelectedCategory,
  } = actions;

  return (
    <div className="bg-background w-full flex-1">
      <div className="max-w-300 w-full mx-auto px-4 py-8 animate-page-enter">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            {/* CATEGORY CONTEXT */}
            <div className="mb-6 border-b border-transparent lg:border-border/50 pb-4">
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                Category
              </span>
              <h2
                className="text-2xl font-bold text-foreground mt-1 tracking-tight"
                style={{
                  fontFamily:
                    "var(--font-display, 'Playfair Display', Georgia, serif)",
                }}
              >
                {sidebarTitle}
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-border">
              {/* LOẠI SẢN PHẨM */}
              {displaySubcategories.length > 0 && (
                <div className="py-6 first:pt-0">
                  <button
                    onClick={() => toggleFilter("categories")}
                    className="w-full font-bold text-[14px] mb-4 uppercase flex justify-between items-center hover:text-brand transition-colors"
                  >
                    PRODUCT TYPE{" "}
                    <ChevronDown
                      className={`w-4 h-4 text-ink-muted transition-transform ${openFilters.categories ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFilters.categories && (
                    <div className="space-y-3">
                      {displaySubcategories.map((cat) => (
                        <label
                          key={cat.id || cat._id}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategories.includes(cat.slug)}
                            onChange={() => toggleCategory(cat.slug)}
                            className="w-4 h-4 text-brand bg-surface border-border focus:ring-brand accent-brand rounded-sm cursor-pointer"
                          />
                          <span
                            className={`text-sm uppercase transition-colors flex items-center gap-1.5 ${selectedCategories.includes(cat.slug) ? "font-semibold text-ink" : "text-ink-muted group-hover:text-brand"}`}
                          >
                            {cat.name}
                            <span className="text-xs text-ink-muted opacity-60 normal-case font-normal">
                              ({cat.productCount || 0})
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* GIÁ */}
              <div className="py-6 first:pt-0">
                <button
                  onClick={() => toggleFilter("price")}
                  className="w-full font-bold text-[14px] mb-4 uppercase flex justify-between items-center hover:text-brand transition-colors"
                >
                  PRICE{" "}
                  <ChevronDown
                    className={`w-4 h-4 text-ink-muted transition-transform ${openFilters.price ? "rotate-180" : ""}`}
                  />
                </button>
                {openFilters.price && (
                  <div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="0"
                        value={minPriceInput}
                        onChange={handlePriceChange(setMinPriceInput)}
                        className="w-full text-sm border border-border bg-muted rounded-sm py-2 px-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-colors"
                      />
                      <span className="text-muted-foreground">–</span>
                      <input
                        type="text"
                        placeholder="100.000.000"
                        value={maxPriceInput}
                        onChange={handlePriceChange(setMaxPriceInput)}
                        className="w-full text-sm border border-border bg-muted rounded-sm py-2 px-3 focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/15 transition-colors"
                      />
                    </div>
                    <button
                      onClick={applyPriceFilter}
                      className="w-full mt-4 text-white font-bold py-2.5 rounded-sm transition-all duration-150 text-sm shadow-sm hover:shadow-md active:scale-[0.99]"
                      style={{ background: "hsl(352, 72%, 52%)" }}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* THƯƠNG HIỆU */}
              {brands.length > 0 && (
                <div className="py-6 first:pt-0">
                  <button
                    onClick={() => toggleFilter("brands")}
                    className="w-full font-bold text-[14px] mb-4 uppercase flex justify-between items-center hover:text-brand transition-colors"
                  >
                    BRAND{" "}
                    <ChevronDown
                      className={`w-4 h-4 text-ink-muted transition-transform ${openFilters.brands ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openFilters.brands && (
                    <div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        {[...brands]
                          .sort((a, b) => {
                            const aSelected = selectedBrands.includes(a.id);
                            const bSelected = selectedBrands.includes(b.id);
                            if (aSelected && !bSelected) return -1;
                            if (!aSelected && bSelected) return 1;
                            return a.name.localeCompare(b.name);
                          })
                          .map((brand) => (
                            <label
                              key={brand.id}
                              className="flex items-center gap-3 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand.id)}
                                onChange={() => toggleBrand(brand.id)}
                                className="w-4 h-4 text-brand bg-surface border-border focus:ring-brand accent-brand rounded-sm cursor-pointer"
                              />
                              <span
                                className={`text-sm transition-colors leading-tight ${selectedBrands.includes(brand.id) ? "font-semibold text-ink" : "text-ink-muted group-hover:text-brand"}`}
                              >
                                {brand.name}
                              </span>
                            </label>
                          ))}
                      </div>
                      {selectedBrands.length > 0 && (
                        <div className="mt-4 text-right">
                          <button
                            onClick={resetBrands}
                            className="text-brand hover:underline text-sm font-medium"
                          >
                            Reset
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Tabs */}
            <div className="flex items-center gap-2 mb-6 flex-wrap">
              {/* Mobile filter btn */}
              <button
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-foreground whitespace-nowrap h-9 px-3 rounded-sm border border-border bg-muted hover:bg-muted/80 transition-colors"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <Filter className="w-4 h-4" /> Filter
              </button>

              <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-sm flex-wrap">
                {[
                  { id: "popular", label: "Popular" },
                  { id: "newest", label: "Newest" },
                  { id: "top_sales", label: "Best seller" },
                  { id: "price_asc", label: "Price ↑" },
                  { id: "price_desc", label: "Price ↓" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSortBy(tab.id)}
                    className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                      sortBy === tab.id
                        ? "bg-card shadow-sm text-brand"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="premium-card text-center py-20">
                <Search className="w-12 h-12 mx-auto text-border mb-4" />
                <h3 className="text-lg font-bold text-ink">
                  No products found
                </h3>
                <p className="text-ink-muted mt-2">
                  Try adjusting your search or filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="mt-6 text-brand font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div
                className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-stagger transition-opacity duration-200 ${isFetching ? "opacity-50 pointer-events-none" : "opacity-100"}`}
              >
                {products.map((product: any, index: number) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    layout="grid"
                    priority={index < 4}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && products.length > 0 && totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </div>
        </div>

        {/* Mobile Filter Drawer */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-60 bg-black/50 lg:hidden flex justify-end animate-fade-in">
            <div className="w-4/5 max-w-sm bg-background h-full flex flex-col animate-slide-in-right rounded-l-2xl overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <span
                  className="font-bold text-lg"
                  style={{
                    fontFamily:
                      "var(--font-display, 'Playfair Display', Georgia, serif)",
                  }}
                >
                  Filter
                </span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-8">
                {/* Category Filter */}
                <div>
                  <h3 className="font-bold text-base mb-4 pb-2 border-b border-border">
                    Category
                  </h3>
                  <div className="space-y-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="mobile_category"
                        checked={categoryParam === "all"}
                        onChange={() => setSelectedCategory("all")}
                        className="w-4 h-4 text-brand"
                      />
                      <span className="text-sm">All products</span>
                    </label>
                    {categories.map((cat) => (
                      <label
                        key={cat.id || cat.slug}
                        className="flex items-center gap-3"
                      >
                        <input
                          type="radio"
                          name="mobile_category"
                          checked={categoryParam === cat.slug}
                          onChange={() => setSelectedCategory(cat.slug)}
                          className="w-4 h-4 text-brand"
                        />
                        <span className="text-sm">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border">
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="btn-hover w-full text-white font-bold py-3 rounded-xl transition-all shadow-sm"
                  style={{ background: "hsl(352, 72%, 52%)" }}
                >
                  Show results
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
