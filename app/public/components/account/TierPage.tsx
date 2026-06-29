import { Award, TrendingUp, Star, Gem, CheckCircle } from "lucide-react";
import { useMyTierInfo } from "@/public/hooks/useUser";
import { useAuth } from "@/auth/hooks/useAuth";

// Static mapping — phải định nghĩa ở FE để Tailwind JIT scan được class
const TIER_GRADIENT: Record<string, string> = {
  member: "from-emerald-500 to-teal-600",
  silver: "from-slate-400 to-slate-600",
  gold: "from-yellow-500 to-amber-600",
  diamond: "from-violet-600 to-indigo-700",
};

export function TierPage() {
  const { user } = useAuth();
  const { data: tierInfo, isLoading } = useMyTierInfo();

  return (
    <div className="animate-slide-up bg-surface rounded-sm px-6 py-6 flex-1">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-ink mb-1">Membership Tier</h2>
        <p className="text-xs text-ink-muted">
          Tier is calculated from total completed order spending
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        </div>
      ) : tierInfo ? (
        <>
          {/* ── Thẻ hạng thành viên ── */}
          <div
            className={`p-6 rounded-sm text-white  bg-gradient-to-br ${TIER_GRADIENT[tierInfo.tier] ?? "from-emerald-500 to-teal-600"} relative overflow-hidden mb-6`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Award className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <p className="text-xl font-bold uppercase tracking-widest">
                  {user?.name}
                </p>
                <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
                  {tierInfo.tierLabelEn}
                </span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs opacity-70 mb-0.5">Current Tier</p>
                  <p className="text-3xl font-black tracking-wider">
                    {tierInfo.tierLabel}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs opacity-70 mb-0.5">Total Spent</p>
                  <p className="text-xl font-bold">
                    {tierInfo.totalSpent.toLocaleString("vi-VN")}₫
                  </p>
                  <p className="text-xs opacity-70">
                    {tierInfo.orderCount} completed orders
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stats nhanh ── */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-surface-soft border border-border rounded-sm p-4 text-center">
              <TrendingUp className="w-5 h-5 text-brand mx-auto mb-1" />
              <p className="text-xs text-ink-muted mb-0.5">Spent</p>
              <p className="text-sm font-bold text-ink">
                {tierInfo.totalSpent >= 1_000_000
                  ? `${(tierInfo.totalSpent / 1_000_000).toFixed(1)}M`
                  : tierInfo.totalSpent.toLocaleString("vi-VN")}
                ₫
              </p>
            </div>
            <div className="bg-surface-soft border border-border rounded-sm p-4 text-center">
              <Star className="w-5 h-5 text-brand mx-auto mb-1" />
              <p className="text-xs text-ink-muted mb-0.5">Completed orders</p>
              <p className="text-sm font-bold text-ink">
                {tierInfo.orderCount}
              </p>
            </div>
            <div className="bg-surface-soft border border-border rounded-sm p-4 text-center">
              <Gem className="w-5 h-5 text-brand mx-auto mb-1" />
              <p className="text-xs text-ink-muted mb-0.5">Tier benefits</p>
              <p className="text-sm font-bold text-ink">
                {tierInfo.discountPercent > 0
                  ? `-${tierInfo.discountPercent}%`
                  : "None"}
              </p>
            </div>
          </div>

          {/* ── Tiến trình ── */}
          {tierInfo.nextTierLabel ? (
            <div className="bg-surface-soft p-5 rounded-sm border border-border mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-ink text-sm">
                  Tier progress
                </h3>
                <span className="text-xs text-ink-muted">
                  {tierInfo.progressPercent}%
                </span>
              </div>
              <p className="text-xs text-ink-muted mb-3">
                Spend more{" "}
                <span className="font-bold text-brand">
                  {tierInfo.spentToNext?.toLocaleString("vi-VN")}₫
                </span>{" "}
                to reach <strong>{tierInfo.nextTierLabel}</strong>
              </p>
              <div className="w-full bg-border rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-2.5 rounded-full bg-gradient-to-r ${TIER_GRADIENT[tierInfo.tier] ?? "from-emerald-500 to-teal-600"} transition-all duration-700`}
                  style={{ width: `${tierInfo.progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5 text-[10px] text-ink-muted">
                <span>{tierInfo.tierLabel}</span>
                <span>{tierInfo.nextTierLabel}</span>
              </div>
            </div>
          ) : (
            <div className="bg-surface-soft p-5 rounded-sm border border-brand/30 text-center mb-6">
              <Award className="w-10 h-10 text-brand mx-auto mb-2" />
              <h3 className="font-bold text-ink">
                Congratulations! You have reached the highest tier 🎉
              </h3>
              <p className="text-xs text-ink-muted mt-1">
                Thank you for being with GlowUp Beauty
              </p>
            </div>
          )}

          {/* ── Bảng quyền lợi ── */}
          <div className="bg-surface-soft rounded-sm border border-border overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h3 className="font-semibold text-ink text-sm">
                Benefits by tier
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted">
                      Tier
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted">
                      Minimum spent
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-ink-muted">
                      Order discount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tierInfo.tiers.map((t: any) => (
                    <tr
                      key={t.key}
                      className={`border-b border-border/50 transition-colors ${t.isCurrent ? "bg-brand/5" : ""}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {t.isCurrent && (
                            <CheckCircle className="w-3.5 h-3.5 text-brand shrink-0" />
                          )}
                          <span
                            className={`font-semibold text-sm ${t.isCurrent ? "text-brand" : "text-ink"}`}
                          >
                            {t.label}
                          </span>
                          {t.isCurrent && (
                            <span className="text-[10px] bg-brand text-white px-1.5 py-0.5 rounded-full font-bold ml-1">
                              Current
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted text-xs">
                        {t.minSpent === 0
                          ? "Default"
                          : `≥ ${(t.minSpent / 1_000_000).toFixed(0)}M ₫`}
                      </td>
                      <td className="px-4 py-3">
                        {t.discount > 0 ? (
                          <span className="text-xs font-bold text-success">
                            -{Math.round(t.discount * 100)}%
                          </span>
                        ) : (
                          <span className="text-xs text-ink-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-ink-muted px-4 py-2 border-t border-border/50">
              * Discounts apply automatically at checkout, cannot be combined
              with promo codes.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-ink-muted">
          <Award className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Failed to load membership tier information</p>
        </div>
      )}
    </div>
  );
}
