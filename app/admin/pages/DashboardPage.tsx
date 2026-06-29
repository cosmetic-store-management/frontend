import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  DollarSign,
  Package,
  Loader2,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import { useState } from "react";
import { useDashboardData } from "../hooks/useReport";
import { Badge } from "@/components/ui/badge";
import { RevenueChart } from "../components/dashboard/RevenueChart";

// ── Stat Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  accent: string;
  index: number;
}

function StatCard({
  label,
  value,
  change,
  isPositive,
  icon: Icon,
  accent,
  index,
}: StatCardProps) {
  const isNeutral =
    change === "Updating" || change === "Delivered successfully";

  return (
    <div
      className="relative bg-card border border-border rounded-sm p-5 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group card-animate"
      style={{ "--card-i": index } as React.CSSProperties}
    >
      {/* Accent stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl transition-all duration-300 group-hover:h-1"
        style={{ background: accent }}
      />

      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-sm flex items-center justify-center"
          style={{ background: `${accent}18` }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `${accent}12` }}
        >
          <ArrowUpRight className="w-4 h-4" style={{ color: accent }} />
        </div>
      </div>

      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground tracking-tight leading-none mb-3">
        {value}
      </p>

      <div className="flex items-center gap-1.5 text-xs font-medium">
        {isNeutral ? (
          <Minus className="w-3 h-3 text-muted-foreground" />
        ) : isPositive ? (
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-red-500" />
        )}
        <span
          className={
            isNeutral
              ? "text-muted-foreground"
              : isPositive
                ? "text-emerald-600"
                : "text-red-500"
          }
        >
          {change}
        </span>
      </div>
    </div>
  );
}

// ── Order status badge ────────────────────────────────────────────────────────

function OrderBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Shipping: "bg-blue-50 text-blue-700 border-blue-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-neutral-100 text-neutral-500 border-neutral-200",
  };
  const labelMap: Record<string, string> = {
    Completed: "Completed",
    Shipping: "Shipping",
    Pending: "Pending",
    Cancelled: "Cancelled",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold border ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labelMap[status] || status}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [activeDate, setActiveDate] = useState({ start: "", end: "" });

  const { data, isLoading, isError } = useDashboardData(
    activeDate.start,
    activeDate.end,
  );

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 gap-3 text-center">
        <AlertTriangle className="w-10 h-10 text-destructive/60" />
        <p className="text-sm text-muted-foreground">
          Failed to load dashboard data. Please try again.
        </p>
      </div>
    );
  }

  const { stats: fetchedStats, recentOrders, topProducts } = data;

  const formatChange = (val?: number) => {
    if (val === undefined) return "Updating";
    if (val > 0) return `+${val}% vs last period`;
    if (val < 0) return `${val}% vs last period`;
    return "No change vs last period";
  };

  const isPos = (val?: number) => (val ?? 0) >= 0;

  const stats: StatCardProps[] = [
    {
      label: "Total Revenue",
      value: `${fetchedStats.totalRevenue?.toLocaleString("vi-VN") || 0}₫`,
      change: formatChange(fetchedStats.revenueChange),
      isPositive: isPos(fetchedStats.revenueChange),
      icon: DollarSign,
      accent: "hsl(142, 60%, 42%)",
      index: 0,
    },
    {
      label: "Total Orders",
      value: fetchedStats.ordersCount || 0,
      change: formatChange(fetchedStats.ordersChange),
      isPositive: isPos(fetchedStats.ordersChange),
      icon: ShoppingBag,
      accent: "hsl(352, 72%, 52%)",
      index: 1,
    },
    {
      label: "Products Sold",
      value: fetchedStats.soldProducts || 0,
      change: "Delivered successfully",
      isPositive: true,
      icon: Package,
      accent: "hsl(38, 90%, 50%)",
      index: 2,
    },
    {
      label: "Total Customers",
      value: fetchedStats.newCustomers || 0,
      change: formatChange(fetchedStats.customersChange),
      isPositive: isPos(fetchedStats.customersChange),
      icon: Users,
      accent: "hsl(258, 60%, 58%)",
      index: 3,
    },
  ];

  return (
    <div className="flex-1 flex flex-col gap-6 animate-page-enter min-h-0">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-xl font-bold text-foreground tracking-tight"
            style={{
              fontFamily:
                "var(--font-display, 'Playfair Display', Georgia, serif)",
            }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Monitor and manage GlowUp Cosmetics operations
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-sm px-3 py-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">From</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, start: e.target.value }))
              }
              className="bg-transparent border-0 outline-none text-xs text-foreground w-32 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-sm px-3 py-2">
            <span className="text-xs text-muted-foreground">To</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((p) => ({ ...p, end: e.target.value }))
              }
              className="bg-transparent border-0 outline-none text-xs text-foreground w-32 cursor-pointer"
            />
          </div>
          <button
            onClick={() => setActiveDate(dateRange)}
            className="px-4 py-2 bg-brand text-white text-xs font-semibold rounded-sm hover:bg-brand/90 transition-colors shadow-sm"
          >
            Filter
          </button>
          {(activeDate.start || activeDate.end) && (
            <button
              onClick={() => {
                setDateRange({ start: "", end: "" });
                setActiveDate({ start: "", end: "" });
              }}
              className="px-3 py-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-sm transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* ── Revenue Chart ── */}
      <RevenueChart startDate={activeDate.start} endDate={activeDate.end} />

      {/* ── Tables Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-card border border-border rounded-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Recent Orders
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Online &amp; in-store
              </p>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Order ID
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Customer
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                    Items
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right whitespace-nowrap">
                    Total
                  </th>
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-muted/30 transition-colors duration-100"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                        {order.id}
                      </td>
                      <td className="px-5 py-3 font-medium text-sm text-foreground">
                        {order.customer || "Walk-in customer"}
                      </td>
                      <td className="px-5 py-3 text-xs text-muted-foreground max-w-40 truncate">
                        {order.items || "—"}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-sm text-foreground">
                        {order.total}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <OrderBadge status={order.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Top Products */}
          <div className="bg-card border border-border rounded-sm overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Top Products
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  By units sold
                </p>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground py-6 text-center">
                  No sales data yet
                </p>
              ) : (
                topProducts.map((prod, i) => (
                  <div key={prod.name} className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-white"
                          style={{
                            background:
                              i === 0
                                ? "hsl(352, 72%, 52%)"
                                : i === 1
                                  ? "hsl(38, 90%, 50%)"
                                  : "hsl(345, 6%, 70%)",
                          }}
                        >
                          {i + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-foreground line-clamp-1">
                            {prod.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {prod.category} · Sold {prod.sold}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-sm font-semibold shrink-0 ${
                          prod.stock === 0
                            ? "bg-red-50 text-red-600"
                            : prod.stock < 10
                              ? "bg-amber-50 text-amber-600"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {prod.stock === 0 ? "Out" : `${prod.stock} left`}
                      </span>
                    </div>
                    <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${prod.percentage}%`,
                          background:
                            prod.stock === 0
                              ? "hsl(4, 80%, 52%)"
                              : "hsl(352, 72%, 52%)",
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alert */}
          {data.lowStockItems && data.lowStockItems.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-red-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <h2 className="text-sm font-semibold text-red-700">
                    Low Stock Alert
                  </h2>
                </div>
                <span className="text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {data.lowStockItems.length}
                </span>
              </div>
              <div className="px-4 py-3 space-y-2 max-h-52 overflow-y-auto">
                {data.lowStockItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-white rounded-lg border border-red-100 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1 pr-3">
                      <p className="text-xs font-semibold text-foreground line-clamp-1">
                        {item.productName}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {item.variantName}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-red-600">
                        Stock: {item.stock}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Min: {item.minStock}
                      </p>
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
