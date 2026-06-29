import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { usePublicBrands } from "@/public/hooks/useBrands";

// ─── helpers ────────────────────────────────────────────────────────────────

function firstLetterKey(name: string): string {
  const first = name.trim()[0]?.toUpperCase() ?? "#";
  return /[0-9]/.test(first) ? "0-9" : first;
}

const ALPHABET = [
  "0-9",
  ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)),
];

// Brands nổi bật (ưu tiên hiện trong dark carousel)
const FEATURED_SLUGS = [
  "merzy",
  "romand",
  "maybelline",
  "lorealparis",
  "l-oreal-paris",
  "laneige",
  "innisfree",
  "some-by-mi",
  "cosrx",
  "anessa",
  "klairs",
  "clinique",
  "dior",
  "nyx",
  "hada-labo",
  "3ce",
];

// ─── BrandCard ───────────────────────────────────────────────────────────────

function BrandCard({ brand, dark = false }: { brand: any; dark?: boolean }) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <Link
      to={`/products?brandId=${brand.id}`}
      className={`group flex flex-col items-center transition-all duration-300 overflow-hidden rounded-sm
        ${
          dark
            ? "border border-white/10 hover:border-white/25 hover:-translate-y-1"
            : "border border-border/40 bg-surface hover:border-brand/50 hover:shadow-md hover:-translate-y-1"
        }`}
    >
      {/* Logo area — always white bg so logo image shows correctly */}
      <div className={`w-full aspect-2/1 flex items-center justify-center p-4 bg-surface overflow-hidden ${dark ? 'opacity-80 group-hover:opacity-100 transition-opacity' : ''}`}>
        {brand.imageUrl && !imgFailed ? (
          <img
            src={brand.imageUrl}
            alt={brand.name}
            className={`max-w-full max-h-full object-contain transition-all duration-300 ${!dark ? 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100' : ''}`}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span className="text-[11px] font-black uppercase tracking-widest text-center leading-tight text-ink/25">
            {brand.name}
          </span>
        )}
      </div>

      {/* Brand name — white in dark section, gray in light section */}
      <div
        className={`w-full px-2 py-2 text-center
        ${dark ? "bg-[#1e1e1e]" : "bg-white border-t border-[#e8e8e8]"}`}
      >
        <span
          className={`text-[10px] font-bold uppercase tracking-widest line-clamp-1
          ${dark ? "text-white/60 group-hover:text-white" : "text-ink/60 group-hover:text-brand"} transition-colors`}
        >
          {brand.name}
        </span>
      </div>
    </Link>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BrandsPage() {
  const { data: brands = [], isLoading } = usePublicBrands();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const carouselRef = useRef<HTMLDivElement>(null);

  // Sort + group
  const sorted = useMemo(
    () =>
      [...brands].sort((a: any, b: any) =>
        a.name.localeCompare(b.name, "vi", { sensitivity: "base" }),
      ),
    [brands],
  );

  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const brand of sorted) {
      const key = firstLetterKey(brand.name);
      if (!map[key]) map[key] = [];
      map[key].push(brand);
    }
    return map;
  }, [sorted]);

  const activeLetters = useMemo(() => new Set(Object.keys(grouped)), [grouped]);

  // Featured brands: match by slug or pick first N popular ones
  const featured = useMemo(() => {
    const matched = brands.filter((b: any) =>
      FEATURED_SLUGS.some(
        (s) =>
          b.slug?.toLowerCase().includes(s) ||
          b.name?.toLowerCase().includes(s.replace(/-/g, " ")),
      ),
    );
    // Fill up to 10 with remaining brands
    const ids = new Set(matched.map((b: any) => b.id));
    const rest = brands.filter((b: any) => !ids.has(b.id));
    return [...matched, ...rest].slice(0, 12);
  }, [brands]);

  const scrollTo = (letter: string) => {
    sectionRefs.current[letter]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const scrollCarousel = (dir: "left" | "right") => {
    if (!carouselRef.current) return;
    const amount = carouselRef.current.clientWidth * 0.8;
    carouselRef.current.scrollBy({
      left: dir === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* ══════════════════════════════════════════════════════════════
          THƯƠNG HIỆU NỔI BẬT — dark section
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-[#1a1a1a] py-8 px-4">
        <div className="max-w-300 mx-auto">
          <h2 className="text-white font-black text-[15px] uppercase tracking-wider mb-5">
            Thương Hiệu Nổi Bật
          </h2>

          <div className="relative">
            {/* Carousel track */}
            <div
              ref={carouselRef}
              className="flex overflow-x-auto scrollbar-none gap-px border border-white/10"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="min-w-50 flex-1 aspect-4/3 bg-[#2a2a2a] animate-pulse"
                    />
                  ))
                : featured.map((brand: any) => (
                    <div
                      key={brand.id}
                      className="min-w-50 flex-1"
                      style={{ scrollSnapAlign: "start" }}
                    >
                      <BrandCard brand={brand} dark />
                    </div>
                  ))}
            </div>

            {/* Arrow buttons — sit inside carousel, no overflow */}
            <button
              onClick={() => scrollCarousel("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollCarousel("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          XEM TẤT CẢ X THƯƠNG HIỆU
      ══════════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-[#e8e8e8] py-6 px-4">
        <div className="max-w-300 mx-auto">
          {/* Count heading */}
          <p className="text-center font-black text-[15px] uppercase tracking-widest text-ink mb-5">
            {isLoading
              ? "Đang tải..."
              : `Xem Tất Cả ${brands.length} Thương Hiệu`}
          </p>

          {/* A-Z navigation */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {ALPHABET.map((letter) => {
              const active = activeLetters.has(letter);
              return (
                <button
                  key={letter}
                  onClick={() => active && scrollTo(letter)}
                  className={`text-[13px] font-semibold transition-colors leading-none py-0.5
                    ${
                      active
                        ? "text-ink hover:text-brand cursor-pointer"
                        : "text-ink/20 cursor-default"
                    }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          Brand grid grouped by letter
      ══════════════════════════════════════════════════════════════ */}
      <div className="max-w-300 mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-2/1 skeleton rounded-sm" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="py-20 text-center text-ink-muted">
            Hiện chưa có thương hiệu nào
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {ALPHABET.filter((l) => activeLetters.has(l)).map((letter) => (
              <section
                key={letter}
                ref={(el) => {
                  sectionRefs.current[letter] = el;
                }}
                className="scroll-mt-36"
              >
                {/* Letter heading */}
                <div className="flex items-center gap-4 mb-4 pb-2 border-b border-[#e8e8e8]">
                  <span className="text-[13px] font-bold text-ink">
                    {letter}
                  </span>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {grouped[letter].map((brand: any) => (
                    <BrandCard key={brand.id} brand={brand} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
