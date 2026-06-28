import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useRevenueChart } from "../hooks/useReport";
import { Loader2, TrendingUp } from "lucide-react";

// ── Custom Tooltip ────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-card border border-border rounded-sm px-4 py-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((entry: any) => (
        <div key={entry.name} className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: entry.color }}
          />
          <span className="text-muted-foreground capitalize">{entry.name}:</span>
          <span className="font-bold text-foreground ml-auto pl-3">
            {entry.name === "revenue"
              ? `${Number(entry.value).toLocaleString("vi-VN")}₫`
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Period Selector ───────────────────────────────────────────────────────────

const PERIODS = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
] as const;

// ── Main Component ────────────────────────────────────────────────────────────

interface RevenueChartProps {
  startDate?: string;
  endDate?: string;
}

export function RevenueChart({ startDate, endDate }: RevenueChartProps) {
  const { data = [], isLoading } = useRevenueChart(startDate, endDate);

  // Format date labels
  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    revenue: d.revenue,
    orders: d.orders,
  }));

  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0);
  const totalOrders = data.reduce((s, d) => s + d.orders, 0);

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-sm flex items-center justify-center"
            style={{ background: "hsl(352, 72%, 52%, 0.12)" }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: "hsl(352, 72%, 52%)" }} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Revenue Overview</h2>
            <p className="text-xs text-muted-foreground">
              {data.length > 0
                ? `${chartData[0]?.label} – ${chartData[chartData.length - 1]?.label}`
                : "No data for period"}
            </p>
          </div>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 rounded-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: "hsl(352, 72%, 52%)" }} />
            <span className="text-xs text-muted-foreground">Revenue:</span>
            <span className="text-xs font-bold text-foreground">
              {totalRevenue.toLocaleString("vi-VN")}₫
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 rounded-sm">
            <span className="w-2 h-2 rounded-full" style={{ background: "hsl(220, 80%, 58%)" }} />
            <span className="text-xs text-muted-foreground">Orders:</span>
            <span className="text-xs font-bold text-foreground">{totalOrders}</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="px-5 py-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-52">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-52 text-center gap-2">
            <TrendingUp className="w-8 h-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No revenue data for this period</p>
            <p className="text-xs text-muted-foreground/60">Try selecting a different date range</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(352, 72%, 52%)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="hsl(352, 72%, 52%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ordersGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(220, 80%, 58%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(220, 80%, 58%)" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(345, 6%, 88%)"
              />

              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(345, 5%, 48%)" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />

              <YAxis
                yAxisId="revenue"
                orientation="left"
                tick={{ fontSize: 10, fill: "hsl(345, 5%, 48%)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  v >= 1_000_000
                    ? `${(v / 1_000_000).toFixed(0)}M`
                    : v >= 1_000
                      ? `${(v / 1_000).toFixed(0)}K`
                      : v
                }
                width={48}
              />

              <YAxis
                yAxisId="orders"
                orientation="right"
                tick={{ fontSize: 10, fill: "hsl(345, 5%, 48%)" }}
                axisLine={false}
                tickLine={false}
                width={32}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="hsl(352, 72%, 52%)"
                strokeWidth={2}
                fill="url(#revenueGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "white", fill: "hsl(352, 72%, 52%)" }}
              />

              <Area
                yAxisId="orders"
                type="monotone"
                dataKey="orders"
                stroke="hsl(220, 80%, 58%)"
                strokeWidth={2}
                fill="url(#ordersGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "white", fill: "hsl(220, 80%, 58%)" }}
              />

              <Legend
                wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }}
                formatter={(value) =>
                  value === "revenue" ? "Revenue (₫)" : "Orders"
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
