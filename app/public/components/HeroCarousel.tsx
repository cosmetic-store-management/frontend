import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=2070&auto=format&fit=crop",
    badge: "Bộ sưu tập Mùa Hè 2026",
    title: "Đánh thức vẻ đẹp tự nhiên của bạn",
    description: "Khám phá các dòng mỹ phẩm chăm sóc da và làm đẹp chính hãng tại GlowUp, giúp bạn luôn rạng rỡ và tự tin mỗi ngày.",
    ctaText: "Mua sắm ngay",
    ctaLink: "/products",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1596462502278-27bf85033e5a?q=80&w=2071&auto=format&fit=crop",
    badge: "Sale Sinh Nhật GlowUp",
    title: "Khuyến mãi lên tới 50%",
    description: "Hàng ngàn deal sốc dành riêng cho bạn. Nhanh tay chốt đơn trước khi hết hạn!",
    ctaText: "Săn Deal Khủng",
    ctaLink: "/products?sort=discount_desc",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1571781926291-c477eb31f7d4?q=80&w=2070&auto=format&fit=crop",
    badge: "Sản phẩm Mới",
    title: "Bí quyết cho làn da không tuổi",
    description: "Bộ serum cao cấp chống lão hóa mới nhất. Được kiểm nghiệm bởi chuyên gia da liễu.",
    ctaText: "Khám phá ngay",
    ctaLink: "/products",
  }
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full h-[500px] sm:h-[600px] bg-ink overflow-hidden group">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
        >
          <div 
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear ${index === current ? 'scale-110' : 'scale-100'}`}
            style={{ backgroundImage: `url('${slide.image}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent" />
          
          <div className="relative h-full container mx-auto px-4 md:px-6 flex flex-col justify-center max-w-3xl items-start z-20">
            <div className={`transition-all duration-1000 transform ${index === current ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <span className="inline-block py-1 px-3 rounded-full bg-brand/20 text-brand-light font-semibold text-xs mb-4 border border-brand/30">
                {slide.badge}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-4 tracking-tight drop-shadow-md">
                {slide.title}
              </h1>
              <p className="text-lg text-border mb-8 max-w-xl leading-relaxed drop-shadow">
                {slide.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Link 
                  to={slide.ctaLink} 
                  className="btn-hover bg-brand hover:bg-brand-dark text-white px-8 py-3.5 rounded-full font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-brand/30"
                >
                  {slide.ctaText} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/products" 
                  className="bg-surface/10 hover:bg-surface/20 backdrop-blur-md text-white border border-white/30 px-8 py-3.5 rounded-full font-bold transition-all text-center"
                >
                  Xem danh mục
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-surface/20 hover:bg-surface/40 backdrop-blur-md border border-white/20 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-surface/20 hover:bg-surface/40 backdrop-blur-md border border-white/20 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${index === current ? 'bg-brand w-8' : 'bg-white/50 hover:bg-white'}`}
          />
        ))}
      </div>
    </section>
  );
}
