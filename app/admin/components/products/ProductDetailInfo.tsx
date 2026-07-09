import type { Product } from "@/admin/types/product";
import ProductDetailVariants from "./ProductDetailVariants";

type ProductDetailInfoProps = {
  product: Product;
  categoryName: string;
};

export default function ProductDetailInfo({
  product,
  categoryName,
}: ProductDetailInfoProps) {
  const totalStock =
    product.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{"Stock"}</p>
        <p className="mt-1.5 text-sm font-medium text-ink">
          {totalStock.toLocaleString("en-US")} pcs
        </p>
      </div>

      <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{"Brand"}</p>
        <p className="mt-1.5 text-sm font-medium text-ink">
          {product.brandName || "-"}
        </p>
      </div>

      <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{"Category"}</p>
        <p className="mt-1.5 text-sm font-medium text-ink">{categoryName}</p>
      </div>

      <div className="border border-border bg-surface-soft/50 p-3.5 rounded-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">{"Status"}</p>
        <p
          className={`mt-1.5 text-sm font-medium ${product.isActive ? "text-success" : "text-ink-muted"}`}
        >
          {product.isActive ? "Active" : "Inactive"}
        </p>
      </div>

      <div className="col-span-2 border border-border bg-surface-soft/50 p-3.5 rounded-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-1.5">{"Description"}</p>
        <div 
           className="text-sm leading-relaxed text-ink-muted prose prose-sm max-w-none"
           dangerouslySetInnerHTML={{ __html: product.description?.trim() || "-" }} 
        />
      </div>

      {/* Bảng phân loại hàng */}
      {product.variants && product.variants.length > 0 && (
        <ProductDetailVariants variants={product.variants} />
      )}
    </div>
  );
}
