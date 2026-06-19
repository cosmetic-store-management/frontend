import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Zap, ArrowRight, Star } from "lucide-react";
import { useProducts } from "@/public/hooks/useProducts";

export function FlashSale() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59
  });

  // Fetch some products to simulate Flash Sale items
  const { data: prodData } = useProducts({ limit: 4 });
  const products = (Array.isArray(prodData) ? prodData : (prodData as any)?.products) || [];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else {
          seconds = 59;
          if (minutes > 0) {
            minutes--;
          } else {
            minutes = 59;
            if (hours > 0) {
              hours--;
            } else {
              // reset for demo purposes
              hours = 23;
            }
          }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="bg-brand/5 border border-brand/20 rounded-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-light/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Zap className="w-8 h-8 text-brand fill-brand animate-pulse" />
              <h2 className="text-2xl sm:text-3xl font-bold text-ink italic tracking-tight uppercase">Flash Sale</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-ink-muted hidden sm:inline-block">Kết thúc trong:</span>
              <div className="flex items-center gap-1.5">
                <div className="btn-hover bg-brand text-white font-bold text-lg w-10 h-10 flex items-center justify-center rounded-sm shadow-md">
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <span className="text-brand font-bold text-xl">:</span>
                <div className="btn-hover bg-brand text-white font-bold text-lg w-10 h-10 flex items-center justify-center rounded-sm shadow-md">
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <span className="text-brand font-bold text-xl">:</span>
                <div className="btn-hover bg-brand text-white font-bold text-lg w-10 h-10 flex items-center justify-center rounded-sm shadow-md">
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
          
          <Link to="/products" className="text-brand hover:text-brand-dark font-semibold text-sm flex items-center gap-1 group">
            Xem tất cả Deal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {products.map((product: any) => {
            const variants = product.variants || [];
            const minPrice = variants.length > 0 ? Math.min(...variants.map((v: any) => v.price)) : 0;
            // Mock a discount
            const originalPrice = Math.round(minPrice * 1.3);
            const discountPercent = 30;

            return (
              <Link key={`flash-${product.id}`} to={`/product/${product.slug}`} className="group flex flex-col bg-surface rounded-sm overflow-hidden card-hover shadow-ui-soft border border-border relative">
                <div className="absolute top-2 right-2 z-10 bg-danger text-white text-xs font-bold px-2 py-1 rounded-sm shadow-sm">
                  -{discountPercent}%
                </div>
                
                <div className="relative aspect-square overflow-hidden bg-surface-soft">
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80"} 
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="btn-hover absolute bottom-0 left-0 right-0 bg-brand/80 text-white text-[10px] uppercase font-bold py-1 text-center backdrop-blur-sm">
                    Đã bán 120+
                  </div>
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mb-1">{product.brandName || "GlowUp"}</span>
                  <h3 className="font-semibold text-ink leading-tight line-clamp-2 mb-2 group-hover:text-brand transition-colors text-sm">
                    {product.name}
                  </h3>
                  
                  <div className="mt-auto flex flex-col">
                    <span className="text-brand font-bold text-lg">
                      {minPrice.toLocaleString("vi-VN")}₫
                    </span>
                    <span className="text-xs text-ink-muted line-through">
                      {originalPrice.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  
                  {/* Progress bar mock */}
                  <div className="w-full bg-border rounded-full h-1.5 mt-3 overflow-hidden">
                    <div className="bg-brand h-1.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  );
}
