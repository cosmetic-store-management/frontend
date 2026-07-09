import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import { Zap, ChevronRight, ChevronLeft } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";

interface FlashSaleItem {
  productId: string;
  productName: string;
  productSlug: string;
  productBrand?: string;
  productImage: string;
  variantId: string;
  variantName: string;
  originalPrice: number;
  flashPrice: number;
  quantityLimit: number;
  soldQuantity: number;
}

const FREESHIP_LABELS = [
  "FREESHIP TQ",
  "FREESHIP HCM HN",
  "FREESHIP HCM",
] as const;
function getFreeshiplabel(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++)
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return FREESHIP_LABELS[hash % FREESHIP_LABELS.length];
}

interface FlashSale {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  items: FlashSaleItem[];
}

export function FlashSaleSection() {
  const { data: fsData, isLoading } = useQuery({
    queryKey: ["active_flash_sale"],
    queryFn: async () => {
      const res = await apiClient.get<{ result: FlashSale | null }>(
        "/flash-sales/active",
      );
      return res.result;
    },
  });

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

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
    // Check initial scroll state after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(checkScroll, 100);
    window.addEventListener("resize", checkScroll);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", checkScroll);
    };
  }, [fsData]);

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

  useEffect(() => {
    if (!fsData) return;
    const endTime = new Date(fsData.endTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [fsData]);

  if (isLoading) return null;
  if (!fsData) return null;

  return (
    <section className="mb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center text-2xl md:text-3xl font-black uppercase tracking-wider">
            <span className="text-gradient">FLA</span>
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-[#facc15] fill-[#facc15] -mx-1" />
            <span className="text-gradient">H DEAL</span>
          </div>

          {timeLeft && (
            <div className="flex items-center gap-1.5 mt-1 md:mt-0">
              <span className="bg-black text-white font-bold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-sm text-xs md:text-sm">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-black font-bold mb-0.5">:</span>
              <span className="bg-black text-white font-bold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-sm text-xs md:text-sm">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-black font-bold mb-0.5">:</span>
              <span className="bg-black text-white font-bold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-sm text-xs md:text-sm">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>
        <Link
          to="/flash-sale"
          className="text-sm font-semibold text-brand hover:text-brand-dark flex items-center gap-1 transition-colors mt-2 md:mt-0 uppercase underline"
        >
          View all deals <ChevronRight className="w-4 h-4 no-underline" />
        </Link>
      </div>

      <div className="relative group mt-6 md:mt-8">
        {/* Nút Left */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-1 md:-left-4 top-[40%] -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 bg-white rounded-sm shadow-md border border-border/50 text-ink hover:text-brand hover:border-brand hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Previous flash sale items"
          >
            <ChevronLeft className="w-6 h-6 ml-[-2px]" strokeWidth={2} />
          </button>
        )}

        {/* Nút Right */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-1 md:-right-4 top-[40%] -translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 bg-white rounded-sm shadow-md border border-border/50 text-ink hover:text-brand hover:border-brand hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
            aria-label="Next flash sale items"
          >
            <ChevronRight className="w-6 h-6 mr-[-2px]" strokeWidth={2} />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex overflow-x-auto gap-3 md:gap-4 snap-x snap-mandatory no-scrollbar pb-2 pt-1 px-1 -mx-1"
        >
          {fsData.items.map((item, index) => {
            return (
              <div
                key={index}
                className="flex-none w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-12.8px)] snap-start flex"
              >
                <div className="w-full flex flex-col [&>a]:flex-1">
                  <Link
                    to={`/product/${item.productSlug}`}
                    className="group flex flex-col h-full bg-surface border border-border/40 hover:border-brand hover:-translate-y-1 transition-all duration-300 rounded-sm overflow-hidden"
                  >
                    {/* Phần Hình Ảnh */}
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-soft">
                      <img
                        src={item.productImage || "/placeholder.jpg"}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Phần Nội Dung */}
                    <div className="p-2.5 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                        <span className="bg-[#0b2b5e] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-tight">
                          {getFreeshiplabel(item.productId)}
                        </span>
                        {item.soldQuantity >= 10 && (
                          <span className="bg-[#f97316] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-tight shadow-sm">
                            HOT
                          </span>
                        )}
                      </div>

                      {item.productBrand && (
                        <span className="text-[10px] text-ink-muted uppercase tracking-wider line-clamp-1 mb-0.5">
                          {item.productBrand}
                        </span>
                      )}
                      <h3 className="text-[13px] font-medium text-ink line-clamp-2 leading-snug flex-1 transition-colors">
                        {item.productName}
                      </h3>
                      {item.variantName &&
                        item.variantName !== "Mặc định" &&
                        item.variantName !== "Default" && (
                          <p className="text-[11px] text-ink-muted mt-1 truncate">
                            {item.variantName}
                          </p>
                        )}

                      <div className="mt-auto pt-2 flex items-end justify-between gap-1">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-price-main">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.flashPrice)}
                          </span>
                          <span className="text-xs text-ink-muted line-through">
                            {new Intl.NumberFormat("vi-VN", {
                              style: "currency",
                              currency: "VND",
                            }).format(item.originalPrice)}
                          </span>
                        </div>
                        {item.originalPrice > item.flashPrice && (
                          <div className="w-8 h-8 rounded-full bg-[#84cc16] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1">
                            -
                            {Math.round(
                              (1 - item.flashPrice / item.originalPrice) * 100,
                            )}
                            %
                          </div>
                        )}
                      </div>

                      <div className="mt-3 w-full">
                        <div className="h-1 w-full bg-surface-soft rounded-full overflow-hidden">
                          <div
                            className="h-full bg-brand rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min(100, Math.round((item.soldQuantity / item.quantityLimit) * 100))}%`,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-ink-muted font-medium mt-1.5 uppercase tracking-wide">
                          Live{" "}
                          {Math.min(
                            100,
                            Math.round(
                              (item.soldQuantity / item.quantityLimit) * 100,
                            ),
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
