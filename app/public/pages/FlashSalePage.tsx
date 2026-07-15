import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/client";
import { Zap, AlarmClock } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
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

interface FlashSale {
  _id: string;
  name: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  items: FlashSaleItem[];
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

export function FlashSalePage() {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ["timeline_flash_sales"],
    queryFn: async () => {
      const res = await apiClient.get<{ result: FlashSale[] }>(
        "/flash-sales/timeline",
      );
      return res.result;
    },
  });

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const displayTabs = useMemo(() => {
    if (!timelineData) return [];
    return [...timelineData].slice(0, 3);
  }, [timelineData]);

  useEffect(() => {
    if (displayTabs.length === 0) return;

    const activeFs = displayTabs[activeTabIndex] || displayTabs[0];
    const endTime = new Date(activeFs.endTime).getTime();
    const startTime = new Date(activeFs.startTime).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      // eslint-disable-next-line no-useless-assignment
      let distance = 0;

      // If it hasn't started yet, countdown to start
      if (now < startTime) {
        distance = startTime - now;
      } else {
        // If it has started, countdown to end
        distance = endTime - now;
      }

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, [displayTabs, activeTabIndex]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="h-64 bg-muted animate-pulse rounded-sm mb-8" />
        <div className="h-16 bg-muted animate-pulse rounded-sm mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-72 bg-muted animate-pulse rounded-sm" />
          ))}
        </div>
      </div>
    );
  }

  if (!displayTabs || displayTabs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-7xl">
        <h1 className="text-2xl font-bold text-ink mb-2">{"No flash sale program is available"}</h1>
        <p className="text-ink-muted">{"Please check back later."}</p>
      </div>
    );
  }

  const activeFs = displayTabs[activeTabIndex] || displayTabs[0];
  const now = new Date().getTime();
  const isActive =
    now >= new Date(activeFs.startTime).getTime() &&
    now <= new Date(activeFs.endTime).getTime();
  const isUpcoming = now < new Date(activeFs.startTime).getTime();

  return (
    <div className="bg-[#f5f5f5] min-h-screen pb-12">
      <div className="container mx-auto px-4 max-w-7xl pt-6">
        {/* Banner */}
        <div className="w-full relative overflow-hidden bg-brand-dark rounded-sm shadow-md mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-brand via-brand/90 to-rose-600"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_45%,rgba(255,255,255,0.05)_50%,transparent_55%)] bg-[length:30px_30px]"></div>

          <div className="relative z-10 w-full px-4 py-8 md:py-16 text-center flex flex-col items-center">
            <div className="flex flex-col items-center justify-center gap-2 mt-4">
              <div className="relative inline-block">
                <Zap className="absolute -left-8 md:-left-12 -top-2 md:top-4 w-12 h-12 md:w-20 md:h-20 text-yellow-300 fill-yellow-300 -rotate-[20deg] drop-shadow-[0_0_15px_rgba(253,224,71,0.6)]" />
                <Zap className="absolute -right-12 md:-right-20 -top-8 md:-top-6 w-20 h-20 md:w-32 md:h-32 text-[#ffb8b8] fill-yellow-300 rotate-[15deg] drop-shadow-[0_0_20px_rgba(253,224,71,0.8)]" />
                <h1 className="text-6xl md:text-[100px] font-black italic uppercase text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] tracking-tighter leading-none">
                  FLASHDEAL
                </h1>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 mt-2 md:mt-4">
                <div className="flex flex-col items-center md:items-end text-center md:text-right leading-none">
                  <span className="text-2xl md:text-[40px] font-black italic text-white drop-shadow-md tracking-tighter">{"GOLDEN HOUR"}</span>
                  <span className="text-2xl md:text-[40px] font-black italic text-white drop-shadow-md tracking-tighter mt-1 md:mt-2">{"UP TO OFF"}</span>
                </div>
                <span className="text-6xl md:text-[120px] font-black italic text-white drop-shadow-lg leading-none mt-2 md:mt-0">
                  25%
                </span>
              </div>

              {/* Badges */}
              <div className="mt-8 md:mt-12 flex flex-wrap justify-center gap-4">
                <div className="bg-black/90 rounded-sm py-1.5 md:py-2 px-4 md:px-5 flex items-center gap-2 border-2 border-brand/50">
                  <div className="relative flex -ml-2 -mt-1 md:-ml-4 md:-mt-2 mr-1">
                    <AlarmClock className="w-8 h-8 md:w-10 md:h-10 text-white fill-brand absolute rotate-[-15deg] drop-shadow-md" />
                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 absolute -top-1 right-0 rotate-12 z-10" />
                    <div className="w-8 h-8 md:w-10 md:h-10"></div>
                  </div>
                  <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wide">{"This month only"}</span>
                  <div className="flex gap-1.5 ml-2">
                    {displayTabs.slice(0, 4).map((fs) => (
                      <span
                        key={fs._id}
                        className="bg-surface text-brand font-bold px-2 py-0.5 rounded-sm text-[10px] md:text-xs"
                      >
                        {String(new Date(fs.startTime).getHours()).padStart(
                          2,
                          "0",
                        )}
                        :00
                      </span>
                    ))}
                  </div>
                </div>
                <div className="bg-black/90 rounded-sm py-1.5 md:py-2 px-4 md:px-5 flex items-center gap-2 border-2 border-brand/50">
                  <div className="relative flex -ml-2 -mt-1 md:-ml-4 md:-mt-2 mr-1">
                    <AlarmClock className="w-8 h-8 md:w-10 md:h-10 text-white fill-brand absolute rotate-[-15deg] drop-shadow-md" />
                    <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300 absolute -top-1 right-0 rotate-12 z-10" />
                    <div className="w-8 h-8 md:w-10 md:h-10"></div>
                  </div>
                  <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wide">{"Exclusive on the GlowUp website"}</span>
                  <div className="flex gap-1.5 ml-2">
                    <span className="bg-surface text-brand font-bold px-2 py-0.5 rounded-sm text-[10px] md:text-xs">
                      12:00
                    </span>
                    <span className="bg-surface text-brand font-bold px-2 py-0.5 rounded-sm text-[10px] md:text-xs">
                      18:00
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Tabs */}
        <div className="flex overflow-x-auto no-scrollbar bg-card shadow-sm mb-4 border border-border/40 rounded-sm overflow-hidden">
          {displayTabs.map((fs, index) => {
            const fsStart = new Date(fs.startTime);
            const fsEnd = new Date(fs.endTime);
            const isCurrentlyActive =
              now >= fsStart.getTime() && now <= fsEnd.getTime();
            const timeLabel = `${String(fsStart.getHours()).padStart(2, "0")}:00`;

            const isSelected = index === activeTabIndex;

            return (
              <button
                key={fs._id}
                onClick={() => setActiveTabIndex(index)}
                className={`flex-1 shrink-0 flex flex-col items-center justify-center px-8 py-4 transition-colors cursor-pointer border-r border-border/40 min-w-35 last:border-r-0 ${
                  isSelected
                    ? "text-white"
                    : "bg-transparent text-foreground hover:bg-muted"
                }`}
                style={isSelected ? { background: "hsl(352, 72%, 52%)" } : {}}
              >
                <span className="text-xl md:text-2xl font-black">
                  {timeLabel}
                </span>
                <span
                  className={`text-xs md:text-sm font-medium mt-0.5 ${isSelected ? "text-white/80" : "text-muted-foreground"}`}
                >
                  {isCurrentlyActive ? "Live now" : "Upcoming"}
                </span>
              </button>
            );
          })}
        </div>

        {/* Countdown */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 bg-card py-4 shadow-sm border border-border/40 rounded-sm">
          <span className="text-sm font-bold text-foreground uppercase">
            {isActive ? "Ends in" : "Starts in"}
          </span>
          {timeLeft && (
            <div className="flex items-center gap-1.5">
              <span className="bg-foreground text-background font-bold w-9 h-9 flex items-center justify-center text-sm shadow-sm rounded-sm">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="text-foreground font-bold text-lg">:</span>
              <span className="bg-foreground text-background font-bold w-9 h-9 flex items-center justify-center text-sm shadow-sm rounded-sm">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="text-foreground font-bold text-lg">:</span>
              <span className="bg-foreground text-background font-bold w-9 h-9 flex items-center justify-center text-sm shadow-sm rounded-sm">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
          {activeFs.items.map((item, index) => {
            const percentSold = Math.min(
              100,
              Math.round((item.soldQuantity / item.quantityLimit) * 100),
            );
            const statusText = isUpcoming
              ? "COMING SOON"
              : percentSold >= 100
                ? "SOLD OUT"
                : `Ongoing ${percentSold}%`;

            return (
              <Link
                key={index}
                to={`/product/${item.productSlug}`}
                className={`group flex flex-col h-full bg-card border border-border/40 hover:border-brand hover:shadow-md transition-all duration-300 overflow-hidden rounded-sm ${isUpcoming ? "opacity-80" : ""}`}
              >
                {/* Image */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-soft">
                  <img
                    src={item.productImage || "/placeholder.jpg"}
                    alt={item.productName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  {isUpcoming && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <span className="bg-black/60 text-white font-bold text-sm px-4 py-2 rounded-sm uppercase tracking-wider backdrop-blur-sm">{"Upcoming"}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                    <span className="bg-[#0b2b5e] text-white text-[9px] font-bold px-1.5 py-0.5 leading-tight">
                      {getFreeshiplabel(item.productId)}
                    </span>
                    {item.soldQuantity >= 10 && !isUpcoming && (
                      <span className="bg-[#f97316] text-white text-[9px] font-bold px-1.5 py-0.5 leading-tight shadow-sm">
                        HOT
                      </span>
                    )}
                  </div>

                  {item.productBrand && (
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider line-clamp-1 mb-0.5">
                      {item.productBrand}
                    </span>
                  )}
                  <h3
                    className={`text-[13px] font-medium text-ink line-clamp-2 leading-snug flex-1 transition-colors`}
                  >
                    {item.productName}
                  </h3>
                  {item.variantName &&
                    item.variantName !== "Default" &&
                    item.variantName !== "Default" && (
                      <p className="text-[11px] text-ink-muted mt-1 truncate">
                        {item.variantName}
                      </p>
                    )}

                  <div className="mt-2 flex items-end justify-between gap-1">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-price-main font-bold">
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
                      <div className="w-8 h-8 bg-[#84cc16] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mb-1 rounded-sm">
                        -
                        {Math.round(
                          (1 - item.flashPrice / item.originalPrice) * 100,
                        )}
                        %
                      </div>
                    )}
                  </div>

                  <div className="mt-3 w-full">
                    <div className="h-1 w-full bg-surface-soft rounded-sm overflow-hidden">
                      <div
                        className={`h-full rounded-sm transition-all duration-500 ${isUpcoming ? "bg-border" : "bg-brand"}`}
                        style={{ width: `${percentSold}%` }}
                      />
                    </div>
                    <p
                      className={`text-[10px] font-medium mt-1.5 uppercase tracking-wide ${isUpcoming ? "text-ink-muted text-center" : "text-ink-muted"}`}
                    >
                      {statusText}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
