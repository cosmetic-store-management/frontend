/**
 * skeleton.tsx — Tập hợp skeleton loading components.
 * Dùng thay thế cho Loader2/spinner khi đang fetch dữ liệu lần đầu.
 * Phong cách: flat design, red brand, đồng bộ với design system.
 */
import { cn } from "@/lib/utils";

// ── Base Skeleton ─────────────────────────────────────────────────────────────

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-surface-muted/70", className)}
      aria-hidden="true"
    />
  );
}

// ── Product Card Skeleton ─────────────────────────────────────────────────────

export function ProductCardSkeleton() {
  return (
    <div className="rounded-sm border border-border bg-surface overflow-hidden shadow-ui-soft">
      {/* Image */}
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        {/* Badge */}
        <Skeleton className="h-4 w-16" />
        {/* Title */}
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3.5 w-3.5 rounded-full" />
          ))}
          <Skeleton className="h-3 w-10 ml-1" />
        </div>
        {/* Price */}
        <div className="flex items-center justify-between pt-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-8 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

/** Grid của nhiều ProductCardSkeleton */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Table Row Skeleton ────────────────────────────────────────────────────────

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr className="border-b border-border">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-5 py-4">
          <Skeleton className={`h-4 ${i === 0 ? "w-3/4" : "w-1/2"}`} />
        </td>
      ))}
    </tr>
  );
}

/** N rows của TableRowSkeleton */
export function TableBodySkeleton({
  rows = 8,
  cols = 5,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <>
      {[...Array(rows)].map((_, i) => (
        <TableRowSkeleton key={i} cols={cols} />
      ))}
    </>
  );
}

// ── Stat Card Skeleton ────────────────────────────────────────────────────────

export function StatCardSkeleton() {
  return (
    <div className="bg-surface border border-border p-6 rounded-sm shadow-ui-soft flex items-center gap-5">
      {/* Icon circle */}
      <Skeleton className="w-14 h-14 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {[...Array(count)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ── Detail Page Skeleton ──────────────────────────────────────────────────────

export function ProductDetailSkeleton() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
      {/* Image gallery placeholder */}
      <div className="space-y-4">
        <Skeleton className="aspect-square w-full rounded-sm" />
        <div className="flex gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="w-20 h-20 rounded-sm" />
          ))}
        </div>
      </div>
      {/* Product info */}
      <div className="space-y-6 py-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded-full" />
          ))}
          <Skeleton className="h-4 w-20 ml-2" />
        </div>
        <Skeleton className="h-10 w-36" />
        <div className="space-y-2 pt-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-sm" />
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Skeleton className="h-12 flex-1 rounded-sm" />
          <Skeleton className="h-12 w-12 rounded-sm" />
        </div>
      </div>
    </div>
  );
}

// ── List Item Skeleton ────────────────────────────────────────────────────────

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-border last:border-0">
      <Skeleton className="w-16 h-16 rounded-sm shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-20 shrink-0" />
    </div>
  );
}

// ── Form Skeleton ─────────────────────────────────────────────────────────────

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-5">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-sm" />
        </div>
      ))}
      <Skeleton className="h-10 w-28 rounded-sm mt-2" />
    </div>
  );
}
