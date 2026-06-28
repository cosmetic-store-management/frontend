import React from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PageHeaderProps = {
  title: string;
  description: string;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  error?: string | null;
  onClearError?: () => void;
  onRetry?: () => void;
};

export function PageHeader({
  title,
  description,
  actions,
  filters,
  error,
  onClearError,
  onRetry,
}: PageHeaderProps) {
  return (
    <div className="space-y-4 border border-border rounded-sm bg-surface p-4 shadow-ui-soft sm:p-5">
      <CardHeader className="space-y-4 p-0">
        {/* Header row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 space-y-1.5 flex-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-ink">
              {title}
            </CardTitle>
            <CardDescription className="max-w-3xl text-sm leading-6 text-ink-muted">
              {description}
            </CardDescription>
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex flex-col gap-2 border border-danger bg-danger/10 px-3 py-2.5 text-sm text-danger sm:flex-row sm:items-center sm:justify-between rounded-sm">
            <p className="truncate">{error}</p>
            {(onClearError || onRetry) && (
              <div className="flex items-center gap-3 text-xs font-medium">
                {onClearError && (
                  <button
                    type="button"
                    onClick={onClearError}
                    className="text-danger hover:underline"
                  >
                    Đóng
                  </button>
                )}
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="text-danger hover:underline"
                  >
                    Thử lại
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Filter bar */}
        {filters && (
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            {filters}
          </div>
        )}
      </CardHeader>
    </div>
  );
}
