import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "./ProductCard";

interface ProductCarouselProps {
  products: any[];
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = current.clientWidth * 0.8;
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <div className="relative group">
      {/* Nút Left */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute -left-2 md:-left-5 top-[100px] md:top-[120px] -translate-y-1/2 z-10 flex items-center justify-center text-[#999] hover:text-brand transition-all"
          aria-label="Previous products"
        >
          <ChevronLeft className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
        </button>
      )}

      {/* Nút Right */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute -right-2 md:-right-5 top-[100px] md:top-[120px] -translate-y-1/2 z-10 flex items-center justify-center text-[#999] hover:text-brand transition-all"
          aria-label="Next products"
        >
          <ChevronRight className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
        </button>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex overflow-x-auto gap-3 md:gap-4 snap-x snap-mandatory no-scrollbar pb-2 pt-1 px-1 -mx-1"
      >
        {products.map((product, index) => (
          <div
            key={product.id || index}
            className="flex-none w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-12.8px)] snap-start flex"
          >
            <div className="w-full flex flex-col [&>a]:flex-1">
              <ProductCard product={product} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
