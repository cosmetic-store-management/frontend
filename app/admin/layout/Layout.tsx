import { Navigate, Outlet } from "react-router";
import AdminSidebar from "./Sidebar";
import { useAuth } from "@/auth/hooks/useAdminAuth";

export default function AdminLayout() {
  const { isLoggedIn, isAdmin } = useAuth();

  // Chặn khách, chỉ cho admin vào
  if (!isLoggedIn || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="admin-theme flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AdminSidebar />
      <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
