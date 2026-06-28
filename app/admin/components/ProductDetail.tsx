import type { Product } from "@/admin/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProductDetailImage from "./products/ProductDetailImage";
import ProductDetailInfo from "./products/ProductDetailInfo";

type ProductDetailProps = {
  open: boolean;
  product: Product | null;
  categoryName?: string;
  onClose: () => void;
};

function formatPrice(value?: number) {
  return `${(value ?? 0).toLocaleString("vi-VN")} đ`;
}

export default function ProductDetail({
  open,
  product,
  categoryName,
  onClose,
}: ProductDetailProps) {
  if (!product) return null;

  const resolvedCategoryName = categoryName ?? "Chưa phân loại";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden sm:rounded-sm flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Cột trái – ảnh */}
          <ProductDetailImage imageUrl={product.imageUrl} name={product.name} />

          {/* Cột phải – thông tin */}
          <div className="flex flex-1 flex-col overflow-y-auto max-h-[80vh] px-5 py-5 sm:px-6 sm:py-6">
            <DialogHeader className="mb-4 text-left">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-surface-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                  {resolvedCategoryName}
                </span>
                <span className="bg-surface-soft px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                  {product.brandName || "-"}
                </span>
                <span
                  className={`px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                    product.isActive
                      ? "bg-success/10 text-success"
                      : "bg-surface-muted text-ink-muted"
                  }`}
                >
                  {product.isActive ? "Hoạt động" : "Không hoạt động"}
                </span>
              </div>

              {/* Tên */}
              <DialogTitle className="text-2xl font-bold leading-snug tracking-tight text-ink sm:text-3xl">
                {product.name}
              </DialogTitle>

              {/* Slug */}
              <p className="mt-1 font-mono text-xs text-ink-muted">
                {product.slug}
              </p>
            </DialogHeader>

            <div className="mt-2 flex items-baseline gap-2">
              {(() => {
                if (!product.variants || product.variants.length === 0)
                  return (
                    <p className="text-2xl font-bold tabular-nums text-brand">
                      -
                    </p>
                  );
                const prices = product.variants.map((v) =>
                  v.discountPrice != null && v.discountPrice < v.price
                    ? v.discountPrice
                    : v.price,
                );
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                return (
                  <p className="text-2xl font-bold tabular-nums text-brand">
                    {minPrice === maxPrice
                      ? formatPrice(minPrice)
                      : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                  </p>
                );
              })()}
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-border" />

            {/* Grid thông tin */}
            <ProductDetailInfo
              product={product}
              categoryName={resolvedCategoryName}
            />
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Xác nhận
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
