import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
  description?: string;
}

interface BentoCategoriesProps {
  categories: Category[];
}

export function BentoCategories({ categories }: BentoCategoriesProps) {
  // Take first 5 categories for the bento layout
  const bentoCategories = categories.slice(0, 5);

  if (bentoCategories.length === 0) return null;

  return (
    <section className="container mx-auto px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-ink tracking-tight mb-2">Mua sắm theo danh mục</h2>
          <p className="text-ink-muted text-base max-w-2xl">Lựa chọn các sản phẩm chăm sóc da và làm đẹp phù hợp với nhu cầu của bạn từ các danh mục được tuyển chọn cẩn thận.</p>
        </div>
        <Link to="/products" className="inline-flex items-center gap-2 font-semibold text-brand hover:text-brand-dark group whitespace-nowrap">
          Xem tất cả <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-[250px_250px] gap-4">
        {/* Item 1: Large (Span 2 cols, 2 rows) */}
        {bentoCategories[0] && (
          <Link 
            to={`/products?category=${bentoCategories[0].slug}`} 
            className="md:col-span-2 md:row-span-2 relative rounded-sm overflow-hidden group shadow-ui-soft border border-border"
          >
            <img 
              src={bentoCategories[0].imageUrl || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80"} 
              alt={bentoCategories[0].name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <h3 className="text-3xl font-bold text-white mb-2">{bentoCategories[0].name}</h3>
              <p className="text-white/80 max-w-sm mb-4 line-clamp-2">{bentoCategories[0].description || "Chăm sóc làn da hoàn hảo mỗi ngày."}</p>
              <div className="btn-hover inline-flex items-center justify-center w-10 h-10 rounded-full bg-white text-ink group-hover:bg-brand group-hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        )}

        {/* Item 2: Medium (Span 2 cols) */}
        {bentoCategories[1] && (
          <Link 
            to={`/products?category=${bentoCategories[1].slug}`} 
            className="md:col-span-2 relative rounded-sm overflow-hidden group shadow-ui-soft border border-border"
          >
            <img 
              src={bentoCategories[1].imageUrl || "https://images.unsplash.com/photo-1512496015851-a1dc8a47cd43?auto=format&fit=crop&q=80"} 
              alt={bentoCategories[1].name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3 className="text-2xl font-bold text-white mb-1">{bentoCategories[1].name}</h3>
              <span className="text-sm text-white/80 flex items-center gap-1 group-hover:text-gold-light transition-colors">
                Khám phá ngay <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </Link>
        )}

        {/* Item 3: Small */}
        {bentoCategories[2] && (
          <Link 
            to={`/products?category=${bentoCategories[2].slug}`} 
            className="relative rounded-sm overflow-hidden group shadow-ui-soft border border-border"
          >
            <img 
              src={bentoCategories[2].imageUrl || "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80"} 
              alt={bentoCategories[2].name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-xl font-bold text-white mb-1">{bentoCategories[2].name}</h3>
            </div>
          </Link>
        )}

        {/* Item 4: Small */}
        {bentoCategories[3] && (
          <Link 
            to={`/products?category=${bentoCategories[3].slug}`} 
            className="relative rounded-sm overflow-hidden group shadow-ui-soft border border-border"
          >
            <img 
              src={bentoCategories[3].imageUrl || "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&q=80"} 
              alt={bentoCategories[3].name} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <h3 className="text-xl font-bold text-white mb-1">{bentoCategories[3].name}</h3>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}
