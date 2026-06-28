import { POSPage } from "@/admin/pages/POSPage";
import { isRouteErrorResponse, useRouteError } from "react-router";
import { Button } from "@/components/ui/button";

export default function POSRoute() {
  return <POSPage />;
}

export function ErrorBoundary() {
  const error = useRouteError();
  let message = "Đã xảy ra lỗi không xác định tại trang POS.";

  if (isRouteErrorResponse(error)) {
    message = error.data || error.statusText;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
      <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl">⚠️</span>
      </div>
      <h2 className="text-xl font-bold text-ink mb-2">Lỗi tải trang POS</h2>
      <p className="text-sm text-ink-muted mb-6 max-w-md">{message}</p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        className="px-6"
      >
        Tải lại trang
      </Button>
    </div>
  );
}
