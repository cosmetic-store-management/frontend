import { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router";
import { useAuth } from "@/auth/hooks/useAuth";

export default function ProtectedLayout() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    {
       
    }
    setMounted(true);
  }, []);

  if (mounted && !isLoggedIn) {
    return (
      <Navigate
        to={`/login?returnUrl=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!mounted && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <Outlet />;
}
