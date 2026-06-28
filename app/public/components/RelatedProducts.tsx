import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export function RelatedProducts({
  categoryId,
  currentProductId,
}: RelatedProductsProps) {
  // `category` param accepts slug or id — the BE falls back to _id lookup
  const { data, isLoading } = useProducts({ category: categoryId, limit: 12 });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter out the current product from the results
  const products =
    data?.products.filter((p) => p.id !== currentProductId) || [];

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't show the section if no related products
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <div className="mt-4 w-full bg-surface p-6 md:p-8 rounded-sm border border-border shadow-ui-soft">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl md:text-2xl font-bold text-ink uppercase tracking-wider">
          Sản phẩm liên quan
        </h2>
        <div className="flex gap-1">
          <button
            onClick={scrollLeft}
            className="w-10 h-10 flex items-center justify-center bg-transparent text-ink hover:text-brand transition-colors"
          >
            <ChevronLeft className="w-6 h-6 stroke-[1.5px]" />
          </button>
          <button
            onClick={scrollRight}
            className="w-10 h-10 flex items-center justify-center bg-transparent text-ink hover:text-brand transition-colors"
          >
            <ChevronRight className="w-6 h-6 stroke-[1.5px]" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-45 min-w-45 sm:w-50 sm:min-w-50 md:w-[calc((100%-48px)/4)] md:min-w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] lg:min-w-[calc((100%-64px)/5)] shrink-0 snap-start"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
