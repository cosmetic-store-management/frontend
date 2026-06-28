import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center",
        className,
      )}
    >
      <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-sm bg-surface-muted/50 mb-4 sm:mb-5">
        <Icon
          className="h-8 w-8 sm:h-10 sm:w-10 text-ink-muted/50"
          strokeWidth={1.5}
        />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-ink">{title}</h3>
      {description && (
        <p className="mt-1.5 sm:mt-2 text-sm text-ink-muted max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-5 sm:mt-6">{action}</div>}
    </div>
  );
}
