import { Link } from "react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroBanner() {
  return (
    <section className="relative w-full h-[85vh] min-h-[600px] bg-ink overflow-hidden flex items-center">
      {/* Background Video/Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?auto=format&fit=crop&q=80" 
          alt="GlowUp Hero" 
          className="w-full h-full object-cover opacity-60 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
      </div>

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        <div className="max-w-2xl text-white space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/10 backdrop-blur-md border border-white/10 text-sm font-medium animate-fade-in">
            <Sparkles className="w-4 h-4 text-gold-light" />
            <span className="text-white/90">Khám phá Bộ sưu tập Hè 2026</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] animate-slide-up-fade">
            Đánh Thức Vẻ Đẹp <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-brand">
              Tự Nhiên Của Bạn
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 max-w-lg leading-relaxed animate-slide-up-fade" style={{ animationDelay: "100ms" }}>
            Trải nghiệm các dòng mỹ phẩm cao cấp chính hãng. Chăm sóc và nuôi dưỡng làn da từ sâu bên trong với GlowUp.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-4 animate-slide-up-fade" style={{ animationDelay: "200ms" }}>
            <Button size="lg" className="btn-hover bg-brand hover:bg-brand-dark text-white h-14 px-8 text-base rounded-sm shadow-lg shadow-brand/30" asChild>
              <Link to="/products">
                Khám phá ngay <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-sm border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent backdrop-blur-md" asChild>
              <Link to="/products">
                Xem Danh Mục
              </Link>
            </Button>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/10 mt-12 animate-slide-up-fade" style={{ animationDelay: "300ms" }}>
            <div>
              <p className="text-3xl font-bold text-white">100+</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Thương hiệu</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">5k+</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Sản phẩm</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">24/7</p>
              <p className="text-xs text-white/60 uppercase tracking-wider mt-1">Hỗ trợ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
