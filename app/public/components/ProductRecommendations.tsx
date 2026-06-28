import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProductRecommendations } from "../hooks/useProducts";
import { ProductCard } from "./ProductCard";

interface ProductRecommendationsProps {
  productId: string;
}

export function ProductRecommendations({
  productId,
}: ProductRecommendationsProps) {
  const { data: recommendations, isLoading } = useProductRecommendations(
    productId,
    10,
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftBtn(scrollLeft > 0);
      setShowRightBtn(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [recommendations]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="mt-12 py-8 border-t border-border">
        <h2 className="text-[18px] font-bold mb-4 text-ink uppercase">
          Đề xuất cho bạn
        </h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  return (
    <div className="bg-surface p-6 md:p-8 rounded-sm border border-border shadow-ui-soft w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-bold text-ink uppercase tracking-wider">
          Đề xuất cho bạn
        </h2>

        <div className="flex gap-1">
          <button
            onClick={scrollLeft}
            className={`w-10 h-10 flex items-center justify-center bg-transparent transition-colors ${showLeftBtn ? "text-ink hover:text-brand" : "text-ink-muted opacity-30 cursor-not-allowed"}`}
            disabled={!showLeftBtn}
          >
            <ChevronLeft className="w-6 h-6 stroke-[1.5px]" />
          </button>
          <button
            onClick={scrollRight}
            className={`w-10 h-10 flex items-center justify-center bg-transparent transition-colors ${showRightBtn && recommendations.length > 4 ? "text-ink hover:text-brand" : "text-ink-muted opacity-30 cursor-not-allowed"}`}
            disabled={!(showRightBtn && recommendations.length > 4)}
          >
            <ChevronRight className="w-6 h-6 stroke-[1.5px]" />
          </button>
        </div>
      </div>

      {/* Scroll Container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {recommendations.map((product) => (
          <div
            key={product.id}
            className="w-[180px] min-w-[180px] sm:w-[200px] sm:min-w-[200px] md:w-[calc((100%-48px)/4)] md:min-w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] lg:min-w-[calc((100%-64px)/5)] snap-start shrink-0"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
