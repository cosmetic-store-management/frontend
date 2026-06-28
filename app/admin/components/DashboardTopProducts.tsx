import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardTopProducts({
  topProducts,
  lowStockItems,
}: {
  topProducts: any[];
  lowStockItems?: any[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <div className="premium-card p-6 flex flex-col flex-1">
        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-ink">Bán chạy nhất</h2>
            <span className="text-xs text-ink-muted font-medium">
              Theo số lượng bán
            </span>
          </div>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-xs text-ink-muted py-8 text-center">
                Chưa có dữ liệu bán hàng
              </p>
            ) : (
              topProducts.map((prod) => (
                <div key={prod.name} className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-semibold text-ink line-clamp-1">
                        {prod.name}
                      </h4>
                      <span className="text-[10px] text-ink-muted">
                        {prod.category} • Đã bán {prod.sold}
                      </span>
                    </div>
                    <span
                      className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${
                        prod.stock === 0
                          ? "bg-surface-soft text-danger"
                          : prod.stock < 10
                            ? "bg-warning/10 text-warning"
                            : "bg-surface-muted text-ink-muted"
                      }`}
                    >
                      {prod.stock === 0 ? "Hết hàng" : `Còn ${prod.stock}`}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full bg-surface-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${prod.stock === 0 ? "bg-danger" : "bg-brand"}`}
                      style={{ width: `${prod.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems && lowStockItems.length > 0 && (
        <div className="premium-card !bg-danger/5 !border-danger/20 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-lg font-semibold">Cảnh báo hết hàng</h2>
            </div>
            <Badge
              variant="destructive"
              className="bg-danger hover:bg-danger/90"
            >
              {lowStockItems.length} SP
            </Badge>
          </div>
          <div className="space-y-3">
            {lowStockItems.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-surface p-3 rounded-sm border border-danger/10 "
              >
                <div className="min-w-0 flex-1 pr-4">
                  <h4 className="text-xs font-semibold text-ink line-clamp-1">
                    {item.productName}
                  </h4>
                  <p className="text-[10px] text-ink-muted mt-0.5">
                    {item.variantName} (SKU: {item.sku || "N/A"})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-danger">
                    Kho: {item.stock}
                  </p>
                  <p className="text-[10px] text-ink-muted">
                    Tối thiểu: {item.minStock}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
