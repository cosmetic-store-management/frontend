import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router";
import { Search, Loader2 } from "lucide-react";
import { useBrands, useCategories, useProducts, usePopularSearches } from "../hooks/useProducts";
import { useDebounce } from "use-debounce";
import { formatCurrency } from "@/lib/utils";

export default function SearchSuggest() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // API Hooks
  const { data: popularSearches = [] } = usePopularSearches(10);
  const { data: allBrands = [] } = useBrands();
  const { data: allCategories = [] } = useCategories();
  
  // Prepare Featured Data
  const featuredBrands = useMemo(() => allBrands.slice(0, 10), [allBrands]);
  const featuredCategories = useMemo(() => allCategories.slice(0, 5), [allCategories]);

  // Live Search Data
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const { data: searchResults, isFetching } = useProducts(
    debouncedSearchTerm ? { search: debouncedSearchTerm, limit: 5 } : {}
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e?: React.FormEvent, term?: string) => {
    if (e) e.preventDefault();
    const finalTerm = term !== undefined ? term : searchTerm;
    if (finalTerm.trim()) {
      setIsFocused(false);
      navigate(`/products?search=${encodeURIComponent(finalTerm.trim())}`);
    }
  };

  const showPanel = isFocused;
  const isTyping = searchTerm.trim().length > 0;

  return (
    <div className="relative w-full" ref={containerRef}>
      <form
        onSubmit={handleSearch}
        className="flex items-center w-full relative h-9 bg-muted/60 rounded-sm border border-border/80 hover:border-brand/40 focus-within:border-brand focus-within:bg-white transition-all duration-200"
      >
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Tìm sản phẩm, danh mục hay thương hiệu mong muốn"
          className="w-full h-full bg-transparent py-0 pl-9 pr-12 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/70"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-0 h-full px-3 text-brand hover:bg-brand/10 transition-colors flex items-center justify-center"
        >
          <Search className="w-4 h-4" strokeWidth={2} />
        </button>
      </form>

      {/* Suggestion Panel */}
      {showPanel && (
        <div className="absolute top-full mt-1 left-0 w-full min-w-[500px] bg-white border border-border/80 shadow-2xl rounded-sm z-50 overflow-hidden">
          {!isTyping ? (
            // Default Suggestions (No search term)
            <div className="p-4 space-y-6">
              {/* Popular Keywords */}
              <div>
                <h4 className="text-sm font-bold text-ink mb-3">Từ khóa phổ biến</h4>
                <div className="flex flex-wrap gap-2">
                  {popularSearches.length > 0 ? (
                    popularSearches.map((term, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSearchTerm(term);
                          handleSearch(undefined, term);
                        }}
                        className="px-3 py-1.5 text-[13px] border border-border rounded-sm text-ink hover:border-brand hover:text-brand transition-colors bg-surface-soft/50"
                      >
                        {term}
                      </button>
                    ))
                  ) : (
                    <p className="text-xs text-ink-muted italic">Đang cập nhật xu hướng...</p>
                  )}
                </div>
              </div>

              {/* Featured Brands */}
              <div>
                <h4 className="text-sm font-bold text-ink mb-3">Thương hiệu nổi bật</h4>
                <div className="grid grid-cols-5 gap-2">
                  {featuredBrands.map((brand) => (
                    <Link
                      key={brand.id || (brand as any)._id}
                      to={`/products?brands=${brand.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="aspect-square border border-border rounded-sm flex items-center justify-center p-2 hover:border-brand hover:shadow-sm transition-all"
                    >
                      {brand.imageUrl ? (
                        <img src={brand.imageUrl} alt={brand.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xs font-bold text-center leading-tight truncate px-1">
                          {brand.name}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Featured Categories */}
              <div>
                <h4 className="text-sm font-bold text-ink mb-3">Danh mục nổi bật</h4>
                <div className="flex flex-wrap gap-2">
                  {featuredCategories.map((cat) => (
                    <Link
                      key={cat.id || (cat as any)._id}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="px-3 py-1.5 text-[13px] uppercase tracking-wide border border-border rounded-sm text-ink hover:bg-brand hover:text-white hover:border-brand transition-colors font-medium"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Live Search Results
            <div className="flex flex-col max-h-[400px]">
              <div className="p-3 bg-surface border-b border-border text-sm font-medium text-ink flex items-center justify-between">
                <span>Kết quả tìm kiếm cho "{searchTerm}"</span>
                {isFetching && <Loader2 className="w-4 h-4 animate-spin text-brand" />}
              </div>
              <div className="overflow-y-auto flex-1 p-2">
                {searchResults?.products && searchResults.products.length > 0 ? (
                  searchResults.products.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-center gap-3 p-2 hover:bg-surface-soft transition-colors rounded-sm group"
                    >
                      <div className="w-12 h-12 shrink-0 border border-border/50 rounded-sm bg-white overflow-hidden">
                        <img 
                          src={product.imageUrl || "/placeholder.jpg"} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-[13px] font-medium text-ink truncate group-hover:text-brand transition-colors">
                          {product.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          {product.variants?.[0]?.discountPrice ? (
                            <>
                              <span className="text-[12px] font-bold text-brand">
                                {formatCurrency(product.variants[0].discountPrice)}
                              </span>
                              <span className="text-[12px] line-through text-ink-muted">
                                {formatCurrency(product.variants[0].price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-[12px] font-bold text-brand">
                              {formatCurrency(product.variants?.[0]?.price || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  !isFetching && (
                    <div className="py-8 text-center text-ink-muted text-sm">
                      Không tìm thấy sản phẩm nào phù hợp.
                    </div>
                  )
                )}
              </div>
              {searchResults?.products && searchResults.products.length > 0 && (
                <button
                  onClick={() => handleSearch()}
                  className="w-full p-3 text-sm font-bold text-brand bg-brand/5 hover:bg-brand/10 transition-colors text-center border-t border-border"
                >
                  Xem tất cả {searchResults.pagination?.total || searchResults.products.length} kết quả
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
