import type { Variant } from "@/admin/types/product";

type ProductDetailVariantsProps = {
  variants: Variant[];
};

function formatPrice(value?: number) {
  return `${(value ?? 0).toLocaleString("vi-VN")} đ`;
}

export default function ProductDetailVariants({
  variants,
}: ProductDetailVariantsProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="col-span-2 mt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">
        Phân loại hàng
      </p>
      <div className="overflow-x-auto border border-border rounded-sm">
        <table className="w-full text-left text-sm min-w-100">
          <thead className="bg-surface-soft text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Tên</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium text-right">Giá</th>
              <th className="px-3 py-2 font-medium text-right">Kho</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {variants.map((v, i) => (
              <tr key={i} className="hover:bg-surface-soft/50">
                <td className="px-3 py-2 font-medium text-ink">{v.name}</td>
                <td className="px-3 py-2 font-mono text-xs text-ink-muted">
                  {v.sku || "-"}
                </td>
                <td className="px-3 py-2 text-right">
                  {v.discountPrice != null && v.discountPrice < v.price ? (
                    <div className="flex flex-col items-end">
                      <span className="text-brand font-medium">
                        {formatPrice(v.discountPrice)}
                      </span>
                      <span className="text-[10px] text-ink-muted line-through">
                        {formatPrice(v.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-ink-muted">
                      {formatPrice(v.price)}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-ink-muted">
                  {v.stock.toLocaleString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
