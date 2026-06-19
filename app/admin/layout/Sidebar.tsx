import { Link, useLocation } from "react-router";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  CreditCard,
  Box,
  Package,
  Users,
  UserCog,
  BarChart3,
  History,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Tags,
  FolderTree,
  Bookmark,
  Ticket,
  MessageSquare,
  ServerCog
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/hooks/useAdminAuth";

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { user, isOwner, isManager, handleLogout } = useAuth();

  const hasPerm = (perm: string) => {
    if (isOwner || isManager) return true;
    return user?.permissions?.includes(perm) || false;
  };

  const isOrderRoute = pathname === "/admin/pos" || pathname === "/admin/orders";
  const isCatalogRoute =
    pathname === "/admin/products" ||
    pathname === "/admin/categories" ||
    pathname === "/admin/brands" ||
    pathname === "/admin/inventory";
  const isCustomerRoute = pathname === "/admin/customers" || pathname === "/admin/reviews";
  const isSystemRoute = pathname === "/admin/staff" || pathname === "/admin/audit-logs" || pathname === "/admin/settings";

  const [orderOpen, setOrderOpen] = useState(isOrderRoute);
  const [catalogOpen, setCatalogOpen] = useState(isCatalogRoute);
  const [customerOpen, setCustomerOpen] = useState(isCustomerRoute);
  const [systemOpen, setSystemOpen] = useState(isSystemRoute);

  // Sync open state when path changes externally
  useEffect(() => {
    if (isOrderRoute) setOrderOpen(true);
    if (isCatalogRoute) setCatalogOpen(true);
    if (isCustomerRoute) setCustomerOpen(true);
    if (isSystemRoute) setSystemOpen(true);
  }, [pathname, isOrderRoute, isCatalogRoute, isCustomerRoute, isSystemRoute]);


  return (
    <aside className="w-64 shrink-0 bg-card text-foreground border-r border-border flex flex-col z-20 shadow-ui-soft">
      {/* Logo / Header */}
      <div className="px-6 py-5 border-b border-border flex items-center gap-3">
        <LayoutDashboard className="w-5 h-5 text-primary" />
        <span className="font-bold tracking-wider text-base">GLOWUP ADMIN</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 pb-8 space-y-1 overflow-y-auto scrollbar-thin">
        {/* DASHBOARD */}
        <Link
          to="/admin"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 hover:bg-muted hover:text-foreground",
            pathname === "/admin"
              ? "bg-primary text-primary-foreground font-medium shadow-ui-soft"
              : "text-muted-foreground"
          )}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>

        {/* ORDER GROUP */}
        {(hasPerm("orders.view") || hasPerm("pos.access")) && (
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => setOrderOpen(!orderOpen)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 hover:bg-muted hover:text-foreground text-muted-foreground",
                isOrderRoute && "text-foreground font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4" />
                <span>Đơn hàng</span>
              </div>
              {orderOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {orderOpen && (
              <div className="pl-4 pr-1 py-1 ml-4 space-y-1 bg-muted/40 rounded-sm border-l border-border animate-slide-down">
                {hasPerm("pos.access") && (
                  <Link
                    to="/admin/pos"
                    className={cn(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                      pathname === "/admin/pos" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                    )}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Bán hàng tại quầy (POS)
                  </Link>
                )}
                {hasPerm("orders.view") && (
                  <Link
                    to="/admin/orders"
                    className={cn(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                      pathname === "/admin/orders" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                    )}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Tất cả đơn hàng
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* CATALOG GROUP */}
        {hasPerm("products.view") && (
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => setCatalogOpen(!catalogOpen)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 hover:bg-muted hover:text-foreground text-muted-foreground",
                isCatalogRoute && "text-foreground font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                <Package className="w-4 h-4" />
                <span>Sản phẩm</span>
              </div>
              {catalogOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>

            {catalogOpen && (
              <div className="pl-4 pr-1 py-1 ml-4 space-y-1 bg-muted/40 rounded-sm border-l border-border animate-slide-down">
                <Link
                  to="/admin/products"
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                    pathname === "/admin/products" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                  )}
                >
                  <Package className="w-3.5 h-3.5" />
                  Danh sách sản phẩm
                </Link>
                <Link
                  to="/admin/inventory"
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                    pathname === "/admin/inventory" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                  )}
                >
                  <Box className="w-3.5 h-3.5" />
                  Tồn kho
                </Link>
                <Link
                  to="/admin/categories"
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                    pathname === "/admin/categories" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                  )}
                >
                  <FolderTree className="w-3.5 h-3.5" />
                  Danh mục
                </Link>
                <Link
                  to="/admin/brands"
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                    pathname === "/admin/brands" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                  )}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Thương hiệu
                </Link>
              </div>
            )}
          </div>
        )}

        {/* CUSTOMER GROUP */}
        {(hasPerm("customers.view") || hasPerm("reviews.manage")) && (
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => setCustomerOpen(!customerOpen)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 hover:bg-muted hover:text-foreground text-muted-foreground",
                isCustomerRoute && "text-foreground font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Khách hàng</span>
              </div>
              {customerOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {customerOpen && (
              <div className="pl-4 pr-1 py-1 ml-4 space-y-1 bg-muted/40 rounded-sm border-l border-border animate-slide-down">
                {hasPerm("customers.view") && (
                  <Link
                    to="/admin/customers"
                    className={cn(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                      pathname === "/admin/customers" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                    )}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Danh sách khách hàng
                  </Link>
                )}
                {hasPerm("reviews.manage") && (
                  <Link
                    to="/admin/reviews"
                    className={cn(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                      pathname === "/admin/reviews" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                    )}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Đánh giá
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {/* MARKETING */}
        {hasPerm("vouchers.view") && (
          <div className="pt-1">
            <Link
              to="/admin/vouchers"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 hover:bg-muted hover:text-foreground",
                pathname === "/admin/vouchers"
                  ? "bg-primary text-primary-foreground font-medium shadow-ui-soft"
                  : "text-muted-foreground"
              )}
            >
              <Ticket className="w-4 h-4" />
              Mã giảm giá
            </Link>
          </div>
        )}

        {/* REPORTS */}
        {hasPerm("reports.view") && (
          <div className="pt-1">
            <Link
              to="/admin/reports"
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 hover:bg-muted hover:text-foreground",
                pathname === "/admin/reports"
                  ? "bg-primary text-primary-foreground font-medium shadow-ui-soft"
                  : "text-muted-foreground"
              )}
            >
              <BarChart3 className="w-4 h-4" />
              Thống kê
            </Link>
          </div>
        )}

        {/* SYSTEM GROUP */}
        {(isManager || isOwner) && (
          <div className="space-y-0.5 pt-1">
            <button
              onClick={() => setSystemOpen(!systemOpen)}
              className={cn(
                "w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-sm text-sm transition-all duration-200 hover:bg-muted hover:text-foreground text-muted-foreground",
                isSystemRoute && "text-foreground font-medium"
              )}
            >
              <div className="flex items-center gap-3">
                <ServerCog className="w-4 h-4" />
                <span>Hệ thống</span>
              </div>
              {systemOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
            {systemOpen && (
              <div className="pl-4 pr-1 py-1 ml-4 space-y-1 bg-muted/40 rounded-sm border-l border-border animate-slide-down">
                <Link
                  to="/admin/staff"
                  className={cn(
                    "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                    pathname === "/admin/staff" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                  )}
                >
                  <UserCog className="w-3.5 h-3.5" />
                  Nhân viên
                </Link>
                {isOwner && (
                  <Link
                    to="/admin/audit-logs"
                    className={cn(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                      pathname === "/admin/audit-logs" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                    )}
                  >
                    <History className="w-3.5 h-3.5" />
                    Nhật ký
                  </Link>
                )}
                {isOwner && (
                  <Link
                    to="/admin/settings"
                    className={cn(
                      "flex items-center gap-2.5 py-1.5 px-2 rounded-sm text-xs transition-colors hover:text-foreground",
                      pathname === "/admin/settings" ? "bg-primary text-primary-foreground font-medium shadow-ui-soft" : "text-muted-foreground"
                    )}
                  >
                    <Settings className="w-3.5 h-3.5" />
                    Cài đặt chung
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-4 border-t border-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-muted-foreground hover:bg-muted hover:text-destructive transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
