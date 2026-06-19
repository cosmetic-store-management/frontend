import { TrendingUp, TrendingDown, Users, ShoppingBag, DollarSign, Package, Loader2, AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";
import { useDashboardData } from "../hooks/useReport";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export function DashboardPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeDate, setActiveDate] = useState({ start: "", end: "" });

  const { data, isLoading, isError } = useDashboardData(activeDate.start, activeDate.end);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-ink-muted">Đang tải số liệu thống kê...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="text-center py-12 text-danger">
        Có lỗi xảy ra khi tải dữ liệu dashboard. Vui lòng thử lại sau!
      </div>
    );
  }

  const { stats: fetchedStats, recentOrders, topProducts } = data;

  const formatChange = (val?: number) => {
    if (val === undefined) return "Đang cập nhật";
    if (val > 0) return `+${val}% so với kỳ trước`;
    if (val < 0) return `${val}% so với kỳ trước`;
    return "Không đổi so với kỳ trước";
  };

  const isPos = (val?: number) => (val ?? 0) >= 0;

  const stats = [
    {
      label: "Tổng doanh thu",
      value: `${fetchedStats.totalRevenue?.toLocaleString("vi-VN") || 0}₫`,
      change: formatChange(fetchedStats.revenueChange),
      isPositive: isPos(fetchedStats.revenueChange),
      icon: DollarSign,
      color: "bg-success/10 text-success",
    },
    {
      label: "Tổng số đơn hàng",
      value: fetchedStats.ordersCount || 0,
      change: formatChange(fetchedStats.ordersChange),
      isPositive: isPos(fetchedStats.ordersChange),
      icon: ShoppingBag,
      color: "bg-brand/10 text-brand",
    },
    {
      label: "Sản phẩm đã bán",
      value: fetchedStats.soldProducts || 0,
      change: "Đã giao thành công",
      isPositive: true,
      icon: Package,
      color: "bg-warning/10 text-warning",
    },
    {
      label: "Tổng khách hàng",
      value: fetchedStats.newCustomers || 0,
      change: formatChange(fetchedStats.customersChange),
      isPositive: isPos(fetchedStats.customersChange),
      icon: Users,
      color: "bg-purple-500/10 text-purple-600",
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-8 animate-page-enter text-left min-h-0">
      {/* Title & Filter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">Dashboard Tổng Quan</h1>
          <p className="text-sm text-ink-muted mt-1">
            Theo dõi và kiểm soát hoạt động kinh doanh của GlowUp Cosmetics
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface border border-border rounded-sm shadow-sm overflow-hidden">
            <div className="flex items-center pl-3 border-r border-border bg-surface-soft">
              <Calendar className="w-4 h-4 text-ink-muted mr-2" />
              <span className="text-xs font-medium text-ink-muted mr-3">Từ</span>
            </div>
            <Input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange(p => ({ ...p, start: e.target.value }))}
              className="border-0 h-9 w-36 focus-visible:ring-0 rounded-none text-xs" 
            />
          </div>
          <div className="flex items-center bg-surface border border-border rounded-sm shadow-sm overflow-hidden">
            <div className="flex items-center pl-3 border-r border-border bg-surface-soft">
              <span className="text-xs font-medium text-ink-muted mr-3">Đến</span>
            </div>
            <Input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange(p => ({ ...p, end: e.target.value }))}
              className="border-0 h-9 w-36 focus-visible:ring-0 rounded-none text-xs" 
            />
          </div>
          <button 
            onClick={() => setActiveDate(dateRange)}
            className="h-9 px-4 bg-brand text-white text-xs font-semibold rounded-sm hover:bg-brand/90 transition-colors shadow-sm"
          >
            Lọc
          </button>
          {(activeDate.start || activeDate.end) && (
            <button 
              onClick={() => {
                setDateRange({ start: "", end: "" });
                setActiveDate({ start: "", end: "" });
              }}
              className="h-9 px-3 text-ink-muted text-xs hover:text-danger hover:bg-danger/10 rounded-sm transition-colors"
            >
              Xóa lọc
            </button>
          )}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft transition-all duration-200 hover:shadow-ui-card">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-ink-muted uppercase tracking-wider">{stat.label}</span>
                  <h3 className="text-2xl font-bold text-ink">{stat.value}</h3>
                </div>
                <div className={`p-3 rounded-sm ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-4 text-xs font-medium">
                {stat.isPositive ? (
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-danger" />
                )}
                <span className={stat.isPositive ? "text-success" : "text-danger"}>
                  {stat.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-[400px]">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-sm p-6 shadow-ui-soft flex flex-col">
          <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-ink">Đơn hàng gần đây</h2>
              <span className="text-xs text-ink-muted font-medium">Bán tại quầy & online</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-ink-muted">
                    <th className="pb-3 font-medium">Mã đơn</th>
                    <th className="pb-3 font-medium">Khách hàng</th>
                    <th className="pb-3 font-medium">Sản phẩm</th>
                    <th className="pb-3 font-medium text-right">Tổng tiền</th>
                    <th className="pb-3 font-medium text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-ink-muted">
                        Chưa có đơn hàng nào được tạo
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-surface-soft/50 transition-colors">
                        <td className="py-3 font-mono text-xs text-ink-muted">{order.id}</td>
                        <td className="py-3 font-medium text-ink">{order.customer || "Khách vãng lai"}</td>
                        <td className="py-3 text-ink-muted max-w-[180px] truncate">{order.items || "Không rõ"}</td>
                        <td className="py-3 text-right font-medium text-ink">{order.total}</td>
                        <td className="py-3 text-center">
                          <Badge variant="default" className={
                            order.status === "Hoàn thành" ? "bg-success/10 text-success border-success/20 hover:bg-success/20" :
                            order.status === "Đang giao" ? "bg-surface-muted text-ink-muted border-border hover:bg-surface-muted/80" :
                            order.status === "Chờ xử lý" ? "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20" :
                            "bg-surface-soft text-ink-muted border-border hover:bg-surface-soft/80"
                          }>
                            {order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top Products & Low Stock */}
        <div className="flex flex-col gap-8">
          <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft flex flex-col flex-1">
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-ink">Bán chạy nhất</h2>
                <span className="text-xs text-ink-muted font-medium">Theo số lượng bán</span>
              </div>
              <div className="space-y-4">
                {topProducts.length === 0 ? (
                  <p className="text-xs text-ink-muted py-8 text-center">Chưa có dữ liệu bán hàng</p>
                ) : (
                  topProducts.map((prod) => (
                    <div key={prod.name} className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-semibold text-ink line-clamp-1">{prod.name}</h4>
                          <span className="text-[10px] text-ink-muted">{prod.category} • Đã bán {prod.sold}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          prod.stock === 0 ? "bg-surface-soft text-danger" :
                          prod.stock < 10 ? "bg-warning/10 text-warning" :
                          "bg-surface-muted text-ink-muted"
                        }`}>
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
          {data.lowStockItems && data.lowStockItems.length > 0 && (
            <div className="bg-danger/5 border border-danger/20 rounded-sm p-6 shadow-ui-soft flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2 text-danger">
                  <AlertTriangle className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Cảnh báo hết hàng</h2>
                </div>
                <Badge variant="destructive" className="bg-danger hover:bg-danger/90">{data.lowStockItems.length} SP</Badge>
              </div>
              <div className="space-y-3">
                {data.lowStockItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-surface p-3 rounded-sm border border-danger/10 shadow-sm">
                    <div className="min-w-0 flex-1 pr-4">
                      <h4 className="text-xs font-semibold text-ink line-clamp-1">{item.productName}</h4>
                      <p className="text-[10px] text-ink-muted mt-0.5">{item.variantName} (SKU: {item.sku || "N/A"})</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-danger">Kho: {item.stock}</p>
                      <p className="text-[10px] text-ink-muted">Tối thiểu: {item.minStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
