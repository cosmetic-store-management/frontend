

/**
 * error-boundary.tsx — React Error Boundary toàn app.
 *
 * Dùng trong app/root.tsx hoặc wrap các component phức tạp.
 * Bắt runtime errors, hiển thị fallback thân thiện.
 */
import React, { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Fallback custom — nếu không truyền dùng DefaultFallback */
  fallback?: ReactNode;
  /** Callback để log error (VD: Sentry) */
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // Log cơ bản trong development
    if (process.env.NODE_ENV === "development") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <DefaultErrorFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }
    return this.props.children;
  }
}

// ── Default Fallback UI ───────────────────────────────────────────────────────

interface FallbackProps {
  error: Error | null;
  onReset: () => void;
}

function DefaultErrorFallback({ error, onReset }: FallbackProps) {
  return (
    <div className="min-h-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-brand/10 text-brand mx-auto">
          <span className="text-4xl">⚠️</span>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-ink tracking-tight">{"Đã xảy ra lỗi"}</h2>
          <p className="text-sm text-ink-muted leading-relaxed">{`Trang này gặp sự cố không mong muốn. Vui lòng thử tải lại hoặc liên
            hệ hỗ trợ nếu lỗi vẫn tiếp diễn.`}</p>

          {process.env.NODE_ENV === "development" && error && (
            <details className="text-left mt-4 p-4 bg-surface-muted rounded-sm border border-border">
              <summary className="text-xs font-mono text-danger cursor-pointer mb-2">
                Dev: {error.name}
              </summary>
              <pre className="text-xs text-ink-muted overflow-auto whitespace-pre-wrap">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <button
            onClick={onReset}
            className="btn-hover px-6 py-2.5 rounded-sm bg-brand text-white text-sm font-semibold hover:bg-brand-dark transition-colors "
          >{"Thử lại"}</button>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-sm border border-border text-sm font-medium text-ink-muted hover:bg-surface-muted transition-colors"
          >
            Tải lại trang
          </button>
        </div>
      </div>
    </div>
  );
}

// ── withErrorBoundary HOC ────────────────────────────────────────────────────

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
) {
  const Wrapped = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  Wrapped.displayName = `withErrorBoundary(${Component.displayName ?? Component.name})`;
  return Wrapped;
}
