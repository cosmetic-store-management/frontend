import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2070&auto=format&fit=crop",
    badge: "Summer 2026 Collection",
    eyebrow: "New Arrivals",
    title: "Awaken Your\nNatural Beauty",
    description:
      "Discover premium skincare and beauty essentials curated for the modern woman. Authentic brands, radiant results.",
    ctaText: "Shop Now",
    ctaLink: "/products",
    accent: "hsl(352, 72%, 52%)",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?q=80&w=2071&auto=format&fit=crop",
    badge: "GlowUp Birthday Sale",
    eyebrow: "Limited Time",
    title: "Up to 50%\nOff Everything",
    description:
      "Thousands of flash deals exclusively for you. Grab your favorites before they're gone.",
    ctaText: "Claim Deals",
    ctaLink: "/products?sort=discount_desc",
    accent: "hsl(20, 85%, 58%)",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477eb31f7d4?q=80&w=2070&auto=format&fit=crop",
    badge: "New Arrivals",
    eyebrow: "Anti-aging",
    title: "The Secret to\nAgeless Skin",
    description:
      "Our newest premium serum collection — dermatologist tested, clinically proven to turn back the clock.",
    ctaText: "Discover Now",
    ctaLink: "/products",
    accent: "hsl(352, 72%, 52%)",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      goNext();
    }, 6000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [current]);

  const goNext = () => {
    if (isAnimating) return;
    setDirection("next");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
      setIsAnimating(false);
    }, 600);
  };

  const goPrev = () => {
    if (isAnimating) return;
    setDirection("prev");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
      setIsAnimating(false);
    }, 600);
  };

  const goTo = (index: number) => {
    if (isAnimating || index === current) return;
    setDirection(index > current ? "next" : "prev");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setIsAnimating(false);
    }, 600);
    startTimer();
  };

  const slide = slides[current];

  return (
    <section
      className="hero-section relative w-full overflow-hidden"
      style={{ height: "clamp(480px, 62vh, 680px)" }}
    >
      {/* Background slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 ease-in-out"
          style={{
            opacity: i === current ? 1 : 0,
            zIndex: i === current ? 1 : 0,
          }}
        >
          {/* Parallax image */}
          <div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url('${s.image}')`,
              transform: i === current ? "scale(1.04)" : "scale(1)",
              transition: "transform 8s ease-out",
            }}
          />
          {/* Multi-layer overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div
        className="relative z-10 h-full flex items-center"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 clamp(16px, 4vw, 64px)",
        }}
      >
        <div
          key={current}
          className="hero-content max-w-2xl"
          style={{
            animation: `heroEnter 0.7s cubic-bezier(0.22, 1, 0.36, 1) both`,
          }}
        >
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: slide.accent }}
            />
            <span
              className="text-xs font-semibold tracking-[0.15em] uppercase"
              style={{ color: slide.accent }}
            >
              {slide.eyebrow}
            </span>
            <div
              className="h-px flex-1 max-w-12"
              style={{ background: slide.accent, opacity: 0.5 }}
            />
            <span className="text-xs text-white/60 tracking-wide">
              {slide.badge}
            </span>
          </div>

          {/* Title — Playfair Display */}
          <h1
            className="text-white font-black leading-none mb-5"
            style={{
              fontFamily:
                "var(--font-display, 'Playfair Display', Georgia, serif)",
              fontSize: "clamp(2.8rem, 6vw, 5rem)",
              letterSpacing: "-0.02em",
              whiteSpace: "pre-line",
            }}
          >
            {slide.title}
          </h1>

          {/* Description */}
          <p
            className="text-white/70 mb-8 leading-relaxed"
            style={{
              fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
              maxWidth: "42ch",
            }}
          >
            {slide.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={slide.ctaLink}
              className="hero-cta-primary group inline-flex items-center justify-center gap-2 font-semibold rounded-sm text-white transition-all"
              style={{
                background: slide.accent,
                padding: "14px 32px",
                fontSize: "0.95rem",
                boxShadow: `0 8px 32px -8px ${slide.accent}80`,
              }}
            >
              {slide.ctaText}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              to="/products"
              className="inline-flex items-center justify-center gap-2 font-semibold rounded-sm text-white transition-all"
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.25)",
                padding: "14px 32px",
                fontSize: "0.95rem",
              }}
            >
              Browse All
            </Link>
          </div>
        </div>
      </div>

      {/* Slide counter */}
      <div className="absolute top-6 right-6 z-20 text-white/50 text-xs font-mono tracking-widest">
        {String(current + 1).padStart(2, "0")} /{" "}
        {String(slides.length).padStart(2, "0")}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-white/10">
        <div
          className="h-full bg-white/60 transition-none"
          style={{
            width: `${((current + 1) / slides.length) * 100}%`,
            transition: "width 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => {
          goPrev();
          startTimer();
        }}
        aria-label="Previous slide"
        className="absolute left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => {
          goNext();
          startTimer();
        }}
        aria-label="Next slide"
        className="absolute right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        style={{
          background: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            aria-label={`Go to slide ${index + 1}`}
            className="transition-all duration-300 rounded-full"
            style={{
              width: index === current ? "28px" : "7px",
              height: "7px",
              background:
                index === current ? "white" : "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>
    </section>
  );
}
