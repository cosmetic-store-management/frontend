import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useAuth } from "@/auth/hooks/usePublicAuth";
import PublicHeader from "./Header";
import PublicFooter from "./Footer";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function StoreLayout() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="public-theme min-h-screen bg-slate-100 flex flex-col font-sans transition-colors duration-300">
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
