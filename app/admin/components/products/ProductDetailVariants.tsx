import type { Variant } from "@/admin/types/product";

type ProductDetailVariantsProps = {
  variants: Variant[];
};

function formatPrice(value?: number) {
  return `${(value ?? 0).toLocaleString("en-US")} VND`;
}

export default function ProductDetailVariants({
  variants,
}: ProductDetailVariantsProps) {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="col-span-2 mt-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">{"Variants"}</p>
      <div className="overflow-x-auto border border-border rounded-sm">
        <table className="w-full text-sm min-w-100">
          <thead className="bg-surface-soft text-ink-muted">
            <tr>
              <th className="px-3 py-2 font-medium text-center">{"Name"}</th>
              <th className="px-3 py-2 font-medium text-center">Barcode</th>
              <th className="px-3 py-2 font-medium text-center">{"Price"}</th>
              <th className="px-3 py-2 font-medium text-center">Stock</th>
              <th className="px-3 py-2 font-medium text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {variants.map((v, i) => {
              const displayBarcode = v.barcode || v.sku || "";
              return (
                <tr key={i} className="hover:bg-surface-soft/50">
                  <td className="px-3 py-2 font-medium text-ink text-center">{v.name}</td>
                  <td className="px-3 py-2 text-center">
                    {displayBarcode ? (
                      <div className="flex flex-col items-center gap-1">
                        <img
                          src={`https://bwipjs-api.metafloor.com/?bcid=code128&text=${displayBarcode}&scale=2&rotate=N`}
                          alt={`Barcode ${displayBarcode}`}
                          className="h-6 max-w-[100px] object-contain mx-auto"
                          loading="lazy"
                        />
                        <span className="text-[9px] font-mono text-ink-muted leading-none block text-center">
                          {displayBarcode}
                        </span>
                      </div>
                    ) : (
                      <span className="text-ink-muted text-xs block text-center">—</span>
                    )}
                  </td>
                <td className="px-3 py-2 text-center">
                  {v.discountPrice != null && v.discountPrice < v.price ? (
                    <div className="flex flex-col items-center">
                      <span className="text-brand font-medium">
                        {formatPrice(v.discountPrice)}
                      </span>
                      <span className="text-[10px] text-ink-muted line-through">
                        {formatPrice(v.price)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-ink-muted block text-center">
                      {formatPrice(v.price)}
                    </span>
                  )}
                </td>
                <td className="px-3 py-2 text-center text-ink-muted">
                  {v.stock.toLocaleString("en-US")}
                </td>
                <td className="px-3 py-2 text-center">
                  <span
                    className={`inline-flex px-1.5 py-0.5 rounded-[4px] font-semibold text-[10px] uppercase tracking-wider ${
                      v.isActive !== false
                        ? "bg-success/10 text-success"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {v.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
