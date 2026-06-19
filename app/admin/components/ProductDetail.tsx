import { X } from "lucide-react";
import type { Product } from "@/admin/types/product";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden sm:rounded-md flex flex-col">
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Cột trái – ảnh */}
          <div className="relative shrink-0 bg-[linear-gradient(160deg,rgba(251,207,232,0.45)_0%,rgba(255,255,255,1)_70%)] md:w-[42%]">
            <div className="absolute inset-x-8 top-6 h-16 bg-rose-200/30 blur-3xl" />
            <div className="relative flex h-48 items-center justify-center overflow-hidden p-4 sm:p-5 md:h-full min-h-[250px]">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full max-h-[340px] w-full object-cover shadow-[0_16px_48px_rgba(15,23,42,0.12)] md:max-h-none"
                />
              ) : (
                <p className="text-ink-muted text-sm">Chưa có hình ảnh</p>
              )}
            </div>
          </div>

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
              <p className="mt-1 font-mono text-xs text-ink-muted">{product.slug}</p>
            </DialogHeader>

            <div className="mt-2 flex items-baseline gap-2">
              {(() => {
                if (!product.variants || product.variants.length === 0) return <p className="text-2xl font-bold tabular-nums text-brand">-</p>;
                const prices = product.variants.map(v => v.discountPrice != null && v.discountPrice < v.price ? v.discountPrice : v.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                return (
                  <p className="text-2xl font-bold tabular-nums text-brand">
                    {minPrice === maxPrice ? formatPrice(minPrice) : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`}
                  </p>
                );
              })()}
            </div>

            {/* Divider */}
            <div className="my-4 border-t border-border" />

            {/* Grid thông tin */}
            <div className="grid grid-cols-2 gap-3">
              <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Tồn kho</p>
                <p className="mt-1.5 text-sm font-medium text-ink">
                  {(product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0).toLocaleString("vi-VN")} sp
                </p>
              </div>

              <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Thương hiệu</p>
                <p className="mt-1.5 text-sm font-medium text-ink">{product.brandName || "-"}</p>
              </div>

              <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Danh mục</p>
                <p className="mt-1.5 text-sm font-medium text-ink">{resolvedCategoryName}</p>
              </div>

              <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Trạng thái</p>
                <p className={`mt-1.5 text-sm font-medium ${product.isActive ? "text-success" : "text-ink-muted"}`}>
                  {product.isActive ? "Đang bán" : "Ngừng bán"}
                </p>
              </div>

              <div className="col-span-2 border border-border bg-surface-soft/50 p-3.5 rounded-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">Mô tả</p>
                <p className="mt-1.5 text-sm leading-6 text-ink-muted whitespace-pre-wrap">
                  {product.description?.trim() || "-"}
                </p>
              </div>

              {/* Bảng phân loại hàng */}
              {product.variants && product.variants.length > 0 && (
                <div className="col-span-2 mt-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">Phân loại hàng</p>
                  <div className="overflow-x-auto border border-border rounded-sm">
                    <table className="w-full text-left text-sm min-w-[400px]">
                      <thead className="bg-surface-soft text-ink-muted">
                        <tr>
                          <th className="px-3 py-2 font-medium">Tên</th>
                          <th className="px-3 py-2 font-medium">SKU</th>
                          <th className="px-3 py-2 font-medium text-right">Giá</th>
                          <th className="px-3 py-2 font-medium text-right">Kho</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {product.variants.map((v, i) => (
                          <tr key={i} className="hover:bg-surface-soft/50">
                            <td className="px-3 py-2 font-medium text-ink">{v.name}</td>
                            <td className="px-3 py-2 font-mono text-xs text-ink-muted">{v.sku || "-"}</td>
                            <td className="px-3 py-2 text-right">
                              {v.discountPrice != null && v.discountPrice < v.price ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-brand font-medium">{formatPrice(v.discountPrice)}</span>
                                  <span className="text-[10px] text-ink-muted line-through">{formatPrice(v.price)}</span>
                                </div>
                              ) : (
                                <span className="text-ink-muted">{formatPrice(v.price)}</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-right text-ink-muted">{v.stock.toLocaleString("vi-VN")}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <DialogFooter className="px-6 py-4 border-t border-border bg-surface shrink-0 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
