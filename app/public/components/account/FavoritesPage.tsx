import { Heart } from "lucide-react";
import { useFavorites } from "@/public/hooks/useUser";
import { ProductCard } from "@/public/components/ProductCard";

export function FavoritesPage() {
  const { data: favorites = [], isLoading } = useFavorites();

  return (
    <div className="animate-slide-up bg-surface px-6 py-6 flex-1">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-ink">Sản phẩm yêu thích</h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Danh sách sản phẩm bạn đã lưu
          </p>
        </div>
        {favorites.length > 0 && (
          <span className="text-xs text-ink-muted mt-1">
            {favorites.length} sản phẩm
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-8 h-8 border-4 border-border border-t-brand rounded-full animate-spin" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-full bg-surface-soft flex items-center justify-center">
            <Heart className="w-8 h-8 text-ink-muted" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-ink mb-1">
              Chưa có sản phẩm yêu thích
            </p>
            <p className="text-xs text-ink-muted mb-4">
              Bấm vào biểu tượng ❤️ trên sản phẩm để lưu vào đây
            </p>
            <a
              href="/products"
              className="inline-block bg-brand text-white text-sm font-bold px-5 py-2 rounded-sm btn-hover"
            >
              Khám phá sản phẩm
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
