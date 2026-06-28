import { Badge } from "@/components/ui/badge";

export default function DashboardRecentOrders({
  recentOrders,
}: {
  recentOrders: any[];
}) {
  return (
    <div className="lg:col-span-2 premium-card p-6 flex flex-col">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-ink">Recent Orders</h2>
          <span className="text-xs text-ink-muted font-medium">
            POS & Online
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-ink-muted">
                <th className="pb-3 font-medium whitespace-nowrap">Order ID</th>
                <th className="pb-3 font-medium whitespace-nowrap">
                  Customer
                </th>
                <th className="pb-3 font-medium whitespace-nowrap">Products</th>
                <th className="pb-3 font-medium text-right whitespace-nowrap">
                  Total
                </th>
                <th className="pb-3 font-medium text-center whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-ink-muted">
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-soft/50 transition-colors"
                  >
                    <td className="py-3 font-mono text-xs text-ink-muted whitespace-nowrap">
                      {order.id}
                    </td>
                    <td className="py-3 font-medium text-ink whitespace-nowrap">
                      {order.customer || "Walk-in"}
                    </td>
                    <td className="py-3 text-ink-muted max-w-45 truncate">
                      {order.items || "Unknown"}
                    </td>
                    <td className="py-3 text-right font-medium text-ink whitespace-nowrap">
                      {order.total}
                    </td>
                    <td className="py-3 text-center whitespace-nowrap">
                      <Badge
                        variant="default"
                        className={
                          order.status === "Completed"
                            ? "bg-success/10 text-success border-success/20"
                            : order.status === "Shipping"
                              ? "bg-warning/10 text-warning border-warning/20"
                              : "bg-danger/10 text-danger border-danger/20"
                        }
                      >
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
  );
}
