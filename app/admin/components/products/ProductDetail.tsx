import type { Product } from "@/admin/types/product";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ProductDetailImage from "./ProductDetailImage";
import ProductDetailInfo from "./ProductDetailInfo";

type ProductDetailProps = {
  open: boolean;
  product: Product | null;
  categoryName?: string;
  onClose: () => void;
};

function formatPrice(value?: number) {
  return `${(value ?? 0).toLocaleString("en-US")} VND`;
}

export default function ProductDetail({
  open,
  product,
  categoryName,
  onClose,
}: ProductDetailProps) {
  if (!product) return null;

  const resolvedCategoryName = categoryName ?? "Uncategorized";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-sm bg-surface shadow-ui-card border-border">
        <DialogHeader className="px-6 py-4 border-b border-border bg-surface shrink-0">
          <DialogTitle className="text-xl font-bold text-ink pr-6">
            Product Details
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Cột trái – ảnh */}
          <div className="md:w-[35%] flex flex-col border-r border-border bg-surface-soft/30 overflow-y-auto shrink-0">
             <ProductDetailImage imageUrl={product.imageUrl} name={product.name} />
          </div>

          {/* Cột phải – thông tin */}
          <div className="flex flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
            <div className="mb-4 text-left">
              <h2 className="text-xl font-bold text-ink mb-3">{product.name}</h2>
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[4px] font-semibold text-[11px] uppercase tracking-[0.14em]">
                  {resolvedCategoryName}
                </span>
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-[4px] font-semibold text-[11px] uppercase tracking-[0.14em]">
                  {product.brandName || "-"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[4px] font-semibold text-[11px] uppercase tracking-[0.14em] ${
                    product.isActive
                      ? "bg-success/10 text-success"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {product.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Slug */}
              <p className="mt-1 font-mono text-xs text-ink-muted">
                {product.slug}
              </p>
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              {(() => {
                if (!product.variants || product.variants.length === 0)
                  return (
                    <p className="text-xl font-bold tabular-nums text-brand">
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
                  <p className="text-xl font-bold tabular-nums text-brand">
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
          <Button type="button" variant="outline" onClick={onClose} className="rounded-sm shadow-none">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
