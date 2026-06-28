import { Outlet } from "react-router";
import PublicHeader from "./Header";
import PublicFooter from "./Footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function StoreLayout() {
  return (
    <div className="public-theme min-h-screen bg-[#f4f4f4] flex flex-col font-sans">
      <PublicHeader />
      <main className="flex-1 w-full relative flex flex-col">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <PublicFooter />
    </div>
  );
}
