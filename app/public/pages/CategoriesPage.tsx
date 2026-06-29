import i18next from "i18next";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useCategories } from "@/public/hooks/useProducts";
import { ChevronRight, Search } from "lucide-react";

// Skeleton cho loading state
function CategorySkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-surface overflow-hidden rounded-sm border border-border/50"
        >
          <div className="px-5 py-4 bg-surface-soft flex items-center justify-between">
            <div className="h-5 w-40 bg-border/50 rounded-sm animate-pulse" />
            <div className="h-4 w-20 bg-border/50 rounded-sm animate-pulse" />
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="h-17 bg-surface-soft rounded-sm animate-pulse border border-border/30"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Tile cho child category
function ChildTile({ cat }: { cat: any }) {
  return (
    <Link
      to={`/products?category=${cat.slug}`}
      className="group flex items-center gap-3 border border-border/60 rounded-sm p-3 bg-white hover:border-brand hover:bg-brand/5 transition-all duration-200"
    >
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-ink group-hover:text-brand transition-colors truncate leading-tight">
          {cat.name}
        </p>
        {(cat.productCount ?? 0) > 0 && (
          <p className="text-[11px] text-ink-muted mt-0.5">
            {cat.productCount.toLocaleString("vi-VN")} products
          </p>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-border group-hover:text-brand shrink-0 transition-colors" />
    </Link>
  );
}

export function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const [search, setSearch] = useState("");

  // Filter root categories + children theo search
  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return (categories as any[]).reduce((acc: any[], root: any) => {
      // Root name match → include với tất cả children
      if (root.name.toLowerCase().includes(q)) {
        acc.push(root);
        return acc;
      }
      // Lọc children match
      const matchedChildren = (root.children || [])
        .map((child: any) => {
          if (child.name.toLowerCase().includes(q)) return child;
          const matchedSubs = (child.children || []).filter((sub: any) =>
            sub.name.toLowerCase().includes(q),
          );
          if (matchedSubs.length > 0)
            return { ...child, children: matchedSubs };
          return null;
        })
        .filter(Boolean);

      if (matchedChildren.length > 0) {
        acc.push({ ...root, children: matchedChildren });
      }
      return acc;
    }, []);
  }, [categories, search]);

  return (
    <div className="bg-white w-full flex-1">
      <div className="max-w-300 w-full mx-auto px-4 py-8 animate-page-enter">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-6 border-b border-border/50">
          <div>
            <nav className="flex items-center text-xs text-ink-muted mb-2 gap-1.5">
              <Link to="/" className="hover:text-brand transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-ink font-medium">Categories</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-black text-ink uppercase tracking-wider">
              All Categories
            </h1>
            {!isLoading && (
              <p className="text-sm text-ink-muted mt-1">
                {categories.length} main categories •{" "}
                {(categories as any[]).reduce(
                  (s: number, c: any) => s + (c.children?.length || 0),
                  0,
                )}{" "}
                subcategories
              </p>
            )}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-sm bg-surface focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors"
            />
          </div>
        </div>

        {/* Loading */}
        {isLoading && <CategorySkeleton />}

        {/* No results */}
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <Search className="w-12 h-12 mx-auto text-border mb-4" />
            <h3 className="text-lg font-bold text-ink">No categories found</h3>
            <p className="text-ink-muted mt-2 text-sm">
              Try searching with different keywords
            </p>
            <button
              onClick={() => setSearch("")}
              className="mt-4 text-brand hover:underline text-sm font-medium"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Category Sections */}
        {!isLoading && (
          <div className="space-y-8">
            {filtered.map((rootCat: any) => {
              const children: any[] = rootCat.children || [];
              if (!rootCat.name) return null;

              return (
                <section
                  key={rootCat.id || rootCat._id}
                  className="bg-surface overflow-hidden rounded-sm border border-border/50 "
                >
                  {/* Section Header */}
                  <div className="px-5 py-4 bg-surface-soft flex items-center justify-between border-b border-border/40">
                    <div className="flex items-center gap-3">
                      {rootCat.iconUrl && (
                        <img
                          src={rootCat.iconUrl}
                          alt={rootCat.name}
                          className="w-7 h-7 object-contain shrink-0"
                        />
                      )}
                      <h2 className="text-[15px] font-black text-ink uppercase tracking-wide">
                        {rootCat.name}
                      </h2>
                      {(rootCat.productCount ?? 0) > 0 && (
                        <span className="text-[11px] text-ink-muted font-normal hidden sm:inline">
                          ({rootCat.productCount.toLocaleString("vi-VN")}{" "}
                          products)
                        </span>
                      )}
                    </div>
                    <Link
                      to={`/products?category=${rootCat.slug}`}
                      className="text-sm font-bold text-brand hover:text-brand-dark flex items-center gap-1 shrink-0 transition-colors"
                    >
                      View all <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Children Grid */}
                  <div className="p-5">
                    {children.length > 0 ? (
                      <div className="space-y-5">
                        {children.map((child: any) => {
                          const grandchildren: any[] = child.children || [];
                          return (
                            <div key={child.id || child._id}>
                              {/* Child tile */}
                              <ChildTile cat={child} />

                              {/* Grandchildren chips */}
                              {grandchildren.length > 0 && (
                                <div className="mt-2 pl-4 flex flex-wrap gap-1.5">
                                  {grandchildren.map((sub: any) => (
                                    <Link
                                      key={sub.id || sub._id}
                                      to={`/products?category=${sub.slug}`}
                                      className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-brand border border-border/60 hover:border-brand/50 px-2.5 py-1 rounded-sm transition-colors bg-white"
                                    >
                                      {sub.name}
                                      {(sub.productCount ?? 0) > 0 && (
                                        <span className="text-[10px] opacity-60">
                                          ({sub.productCount})
                                        </span>
                                      )}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      // Root không có children → show as standalone tile
                      <ChildTile cat={rootCat} />
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
