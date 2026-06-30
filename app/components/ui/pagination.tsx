import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "ellipsis-left" | "ellipsis-right")[] = [];

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "ellipsis-right", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(
        1,
        "ellipsis-left",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages
      );
    } else {
      pages.push(
        1,
        "ellipsis-left",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "ellipsis-right",
        totalPages
      );
    }
  }

  return (
    <nav
      aria-label="pagination"
      className={cn("flex items-center justify-center gap-1", className)}
    >
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-surface text-ink-muted transition-colors hover:bg-surface-soft hover:text-ink disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronLeft className="size-4" />
        <span className="sr-only">Previous page</span>
      </button>

      {pages.map((page) => {
        if (typeof page === "string") {
          return (
            <span
              key={page}
              className="inline-flex h-9 w-9 items-center justify-center text-sm text-ink-muted"
            >
              <MoreHorizontal className="size-4" />
            </span>
          );
        }

        const isCurrent = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "inline-flex h-9 w-9 items-center justify-center rounded-sm border text-sm font-medium transition-colors",
              isCurrent
                ? "border-brand bg-brand text-white shadow-sm"
                : "border-transparent text-ink-muted hover:bg-surface-soft hover:text-ink"
            )}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-surface text-ink-muted transition-colors hover:bg-surface-soft hover:text-ink disabled:pointer-events-none disabled:opacity-50"
      >
        <ChevronRight className="size-4" />
        <span className="sr-only">Next page</span>
      </button>
    </nav>
  );
}
