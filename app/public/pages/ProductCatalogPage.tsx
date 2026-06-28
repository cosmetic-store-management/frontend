import { Search, Filter, X, ChevronDown } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { ProductCard } from "../components/ProductCard";
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
    <div className="bg-white w-full flex-1">
      <div className="max-w-300 w-full mx-auto px-4 py-8 animate-page-enter">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filter (Desktop) */}
          <aside className="hidden lg:block w-64 shrink-0">
            {/* CATEGORY CONTEXT */}
            <div className="mb-6 border-b border-transparent lg:border-border/50 pb-4">
              <span className="text-sm text-ink-muted">Danh mục</span>
              <h2 className="text-2xl font-black text-gradient uppercase mt-1 tracking-tight">
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
                    LOẠI SẢN PHẨM{" "}
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
                  GIÁ{" "}
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
                        className="w-full text-sm border border-border bg-surface-soft rounded-sm py-2 px-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                      />
                      <span className="text-ink-muted">–</span>
                      <input
                        type="text"
                        placeholder="100.000.000"
                        value={maxPriceInput}
                        onChange={handlePriceChange(setMaxPriceInput)}
                        className="w-full text-sm border border-border bg-surface-soft rounded-sm py-2 px-3 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
                      />
                    </div>
                    <button
                      onClick={applyPriceFilter}
                      className="w-full mt-4 bg-[#8A0000] hover:bg-brand-dark text-white font-bold py-2.5 rounded-sm transition-colors text-sm uppercase tracking-wide"
                    >
                      Áp dụng
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
                    THƯƠNG HIỆU{" "}
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
                            Đặt lại
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
            {/* Toolbar Tabs */}
            <div className="flex items-center justify-between w-full mb-6 border-b border-border/50 pb-2.5 overflow-x-auto hide-scrollbar gap-4">
              {/* Filter button for mobile only */}
              <button
                className="lg:hidden flex items-center gap-2 text-sm font-medium text-ink whitespace-nowrap"
                onClick={() => setIsMobileFilterOpen(true)}
              >
                <Filter className="w-4 h-4" /> Lọc
              </button>

              {[
                { id: "popular", label: "Phổ biến" },
                { id: "newest", label: "Mới nhất" },
                { id: "top_sales", label: "Bán chạy" },
                { id: "price_asc", label: "Giá thấp" },
                { id: "price_desc", label: "Giá cao" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSortBy(tab.id)}
                  className={`flex-1 text-center text-sm md:text-base font-medium whitespace-nowrap transition-colors ${
                    sortBy === tab.id
                      ? "text-brand"
                      : "text-ink-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Product Grid */}
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : products.length === 0 ? (
              <div className="premium-card text-center py-20">
                <Search className="w-12 h-12 mx-auto text-border mb-4" />
                <h3 className="text-lg font-bold text-ink">
                  Không tìm thấy sản phẩm
                </h3>
                <p className="text-ink-muted mt-2">
                  Vui lòng thử lại với từ khóa hoặc bộ lọc khác.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="mt-6 text-brand font-medium hover:underline"
                >
                  Xóa tất cả bộ lọc
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
            <div className="w-4/5 max-w-sm bg-surface h-full  flex flex-col animate-slide-in-right">
              <div className="p-4 flex items-center justify-between border-b border-border">
                <span className="font-bold text-lg">Bộ lọc</span>
                <button
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1"
                >
                  <X className="w-5 h-5 text-ink-muted" />
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-8">
                {/* Category Filter */}
                <div>
                  <h3 className="font-bold text-base mb-4 pb-2 border-b border-border">
                    Danh mục
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
                      <span className="text-sm">Tất cả sản phẩm</span>
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
                  className="btn-hover w-full bg-brand hover:bg-brand-dark text-white font-bold py-3 rounded-sm transition-colors"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
