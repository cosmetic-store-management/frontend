import { useState, useMemo } from "react";
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  BarChart3,
  Package,
  Ticket,
  CreditCard,
  Tag,
} from "lucide-react";
import {
  useDashboardData,
  useCompletionRates,
  useVoucherStats,
  useRevenueChart,
  useCategoryPerformance,
  usePaymentMethodsStats,
} from "@/admin/hooks/useReport";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

export function ReportPage() {
  const [range, setRange] = useState<"today" | "week" | "month" | "year">(
    "month",
  );

  // Date calculation logic
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start = new Date();
    if (range === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (range === "week") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
    } else if (range === "month") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    }
    return { startDate: start.toISOString(), endDate: now.toISOString() };
  }, [range]);

  const { data, isLoading } = useDashboardData(startDate, endDate);
  const { data: completionData } = useCompletionRates(startDate, endDate);
  const { data: voucherData } = useVoucherStats(startDate, endDate);
  const { data: revenueData } = useRevenueChart(startDate, endDate);
  const { data: categoryData } = useCategoryPerformance(startDate, endDate);
  const { data: paymentData } = usePaymentMethodsStats(startDate, endDate);

  if (isLoading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-muted">
        Loading data...
      </div>
    );
  }

  const { stats } = data;

  const COLORS = [
    "#22c55e",
    "#ef4444",
    "#f59e0b",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#14b8a6",
  ];

  const orderPieData = [
    { name: "Completed", value: completionData?.completed || 0 },
    { name: "Cancelled", value: completionData?.cancelled || 0 },
    { name: "Processing", value: completionData?.processing || 0 },
  ].filter((d) => d.value > 0);
  const hasOrderData = orderPieData.length > 0;

  const voucherBarData = (voucherData || []).map((v) => ({
    name: v.code,
    Used: v.usedCount,
    Limit: v.usageLimit > 0 ? v.usageLimit : 100, // fallback if unlimited for display
  }));

  const methodNames: Record<string, string> = {
    cod: "COD",
    vnpay: "VNPAY",
    card: "Credit Card",
    cash: "Cash",
    qr: "QR Code",
    transfer: "Bank Transfer",
    pos_card: "International Payment",
    stripe: "Stripe",
  };

  const paymentChartData = (paymentData || []).map((p) => ({
    name: methodNames[p.method] || p.method,
    value: p.revenue,
  }));
  const hasPaymentData = paymentChartData.some((d) => d.value > 0);

  return (
    <div className="flex flex-col gap-6 animate-page-enter text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">
            Reports & Analytics
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Analyze sales performance and operational reports for GlowUp
          </p>
        </div>

        {/* Date Ranges */}
        <div className="flex border border-border rounded-sm bg-surface overflow-hidden p-0.5 self-start shadow-sm">
          {(["today", "week", "month", "year"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-sm transition-all ${
                range === r
                  ? "bg-surface-muted text-ink"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {r === "today"
                ? "Today"
                : r === "week"
                  ? "This Week"
                  : r === "month"
                    ? "This Month"
                    : "This Year"}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface border border-border rounded-sm p-5 shadow-ui-soft">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-brand-light/20 text-brand">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">Revenue</p>
              <h3 className="text-lg font-bold text-ink mt-0.5">
                {stats.totalRevenue.toLocaleString("vi-VN")}đ
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-5 shadow-ui-soft">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-surface-muted text-ink-muted">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">Total Orders</p>
              <h3 className="text-lg font-bold text-ink mt-0.5">
                {stats.ordersCount.toLocaleString("vi-VN")} orders
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-5 shadow-ui-soft">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">
                Average Order Value
              </p>
              <h3 className="text-lg font-bold text-ink mt-0.5">
                {stats.averageOrderValue.toLocaleString("vi-VN")}đ
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-sm p-5 shadow-ui-soft">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-success/10 text-success">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-muted">Profit</p>
              <h3 className="text-lg font-bold text-ink mt-0.5">
                {stats.profit.toLocaleString("vi-VN")}đ
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-ink" />
          <h3 className="font-semibold text-base text-ink">
            Revenue Trend (Over Time)
          </h3>
        </div>
        {revenueData && revenueData.length > 0 ? (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={revenueData}
                margin={{ top: 10, right: 30, left: 20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#666" }} />
                <YAxis
                  yAxisId="left"
                  tickFormatter={(v) => `${v / 1000000}M`}
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12, fill: "#666" }}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <Tooltip
                  formatter={
                    ((value: number, name: string) => [
                      name === "revenue"
                        ? `${value.toLocaleString("vi-VN")}đ`
                        : value,
                      name === "revenue" ? "Revenue" : "Orders",
                    ]) as any
                  }
                />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#22c55e"
                  name="Orders"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex flex-col items-center justify-center text-ink-muted bg-surface-soft/50 rounded-lg border border-dashed border-border">
            <p className="text-sm">No revenue data available</p>
          </div>
        )}
      </div>

      {/* Advanced Charts Section 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Performance */}
        <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Tag className="w-5 h-5 text-ink" />
              <h3 className="font-semibold text-base text-ink">
                Category Performance (by Revenue)
              </h3>
            </div>

            {categoryData && categoryData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="revenue"
                      nameKey="category"
                      label={
                        (({
                          name,
                          percent,
                        }: {
                          name: string;
                          percent?: number;
                        }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`) as any
                      }
                    >
                      {categoryData.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={
                        ((value: number) => [
                          `${value.toLocaleString("vi-VN")}đ`,
                          "Revenue",
                        ]) as any
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-ink-muted bg-surface-soft/50 rounded-lg border border-dashed border-border">
                <p className="text-sm">No sales data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <CreditCard className="w-5 h-5 text-ink" />
              <h3 className="font-semibold text-base text-ink">
                Payment Methods Stats
              </h3>
            </div>

            {hasPaymentData ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={paymentChartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `${v / 1000000}M`}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={160}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={
                        ((value: number) => [
                          `${value.toLocaleString("vi-VN")}đ`,
                          "Revenue",
                        ]) as any
                      }
                    />
                    <Bar
                      dataKey="value"
                      fill="#3b82f6"
                      radius={[0, 4, 4, 0]}
                      maxBarSize={40}
                    >
                      {paymentChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-ink-muted bg-surface-soft/50 rounded-lg border border-dashed border-border">
                <p className="text-sm">No payment data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Charts Section 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Completion Rate Chart */}
        <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-ink" />
              <h3 className="font-semibold text-base text-ink">
                Order Completion Rate
              </h3>
            </div>

            {hasOrderData ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={
                        (({
                          name,
                          percent,
                        }: {
                          name: string;
                          percent?: number;
                        }) =>
                          `${name} ${((percent ?? 0) * 100).toFixed(0)}%`) as any
                      }
                    >
                      {orderPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={
                        ((value: number) => [`${value} orders`, "Count"]) as any
                      }
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-ink-muted bg-surface-soft/50 rounded-lg border border-dashed border-border">
                <Package className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">No order data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Voucher Usage Bar Chart */}
        <div className="bg-surface border border-border rounded-sm p-6 shadow-ui-soft flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Ticket className="w-5 h-5 text-ink" />
              <h3 className="font-semibold text-base text-ink">
                Voucher Usage Stats
              </h3>
            </div>

            {voucherBarData.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={voucherBarData}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#eee"
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#666" }}
                    />
                    <Tooltip cursor={{ fill: "#f5f5f5" }} />
                    <Legend />
                    <Bar
                      dataKey="Used"
                      fill="#ef4444"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                    <Bar
                      dataKey="Limit"
                      fill="#e5e5e5"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex flex-col items-center justify-center text-ink-muted bg-surface-soft/50 rounded-lg border border-dashed border-border">
                <Ticket className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">No voucher data available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
