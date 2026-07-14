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
  FolderTree,
  Bookmark,
  Ticket,
  MessageSquare,
  ServerCog,
  Zap,
  Clock,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, useLogout } from "@/auth/hooks/useAuth";

// ── Nav item helpers ──────────────────────────────────────────────────────────

function NavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2 rounded-[3px] text-sm font-medium transition-all duration-200",
        active
          ? "bg-brand/10 text-brand shadow-sm"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-brand rounded-r-sm" />
      )}
      <Icon className={cn("w-4 h-4 shrink-0", active && "text-brand")} />
      <span>{label}</span>
    </Link>
  );
}

function SubNavItem({
  to,
  icon: Icon,
  label,
  active,
}: {
  to: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-2.5 py-1.5 px-2.5 rounded-[3px] text-xs font-medium transition-all duration-150",
        active
          ? "bg-brand/10 text-brand"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
      )}
    >
      <Icon className={cn("w-3.5 h-3.5 shrink-0", active && "text-brand")} />
      {label}
    </Link>
  );
}

function NavGroup({
  icon: Icon,
  label,
  isActive,
  isOpen,
  onToggle,
  children,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-[3px] text-sm font-medium transition-all duration-200",
          isActive
            ? "text-brand"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn("w-4 h-4 shrink-0", isActive && "text-brand")} />
          <span>{label}</span>
        </div>
        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
        )}
      </button>

      {isOpen && (
        <div className="pl-3 ml-4 space-y-0.5 border-l-2 border-border/60">
          {children}
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  if (label === "Main") return null;
  return <div className="pt-3" />;
}

// ── Main Sidebar ──────────────────────────────────────────────────────────────

export default function AdminSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const logoutMutation = useLogout();

  const isOwner = user?.role === "owner";
  const isManager = user?.role === "manager";

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
    window.location.href = "/login";
  };

  const hasPerm = (perm: string) => {
    if (isOwner || isManager) return true;
    return user?.permissions?.includes(perm) || false;
  };

  const isOrderRoute =
    pathname === "/admin/pos" || pathname === "/admin/orders";
  const isCatalogRoute =
    pathname === "/admin/products" ||
    pathname === "/admin/categories" ||
    pathname === "/admin/brands" ||
    pathname === "/admin/suppliers" ||
    pathname === "/admin/inventory";
  const isCustomerRoute =
    pathname === "/admin/customers" || pathname === "/admin/reviews";
  const isMarketingRoute =
    pathname === "/admin/vouchers" || pathname === "/admin/flash-sales";
  const isSystemRoute =
    pathname === "/admin/staff" ||
    pathname === "/admin/audit-logs" ||
    pathname === "/admin/settings";

  const [orderOpen, setOrderOpen] = useState(isOrderRoute);
  const [catalogOpen, setCatalogOpen] = useState(isCatalogRoute);
  const [customerOpen, setCustomerOpen] = useState(isCustomerRoute);
  const [marketingOpen, setMarketingOpen] = useState(isMarketingRoute);
  const [systemOpen, setSystemOpen] = useState(isSystemRoute);

  useEffect(() => {
    {
       
    }
    if (isOrderRoute) setOrderOpen(true);
    if (isCatalogRoute) setCatalogOpen(true);
    if (isCustomerRoute) setCustomerOpen(true);
    if (isMarketingRoute) setMarketingOpen(true);
    if (isSystemRoute) setSystemOpen(true);
  }, [
    pathname,
    isOrderRoute,
    isCatalogRoute,
    isCustomerRoute,
    isMarketingRoute,
    isSystemRoute,
  ]);

  return (
    <aside className="w-64 shrink-0 flex flex-col z-20 border-r border-border bg-card">
      {/* ── Logo ── */}
      <div className="px-5 py-5 border-b border-border">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="GlowUp Logo"
            className="w-11 h-11 object-contain rounded-full mix-blend-multiply"
          />
          <div>
            <p
              className="font-bold text-xl tracking-wide text-ink leading-none notranslate"
              style={{
                fontFamily:
                  "var(--font-display, 'Playfair Display', Georgia, serif)",
              }}
            >
              GlowUp.
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-0.5">
        {/* MAIN */}
        <SectionLabel label="Main" />
        <NavItem
          to="/admin"
          icon={LayoutDashboard}
          label="Dashboard"
          active={pathname === "/admin"}
        />

        {/* ORDERS */}
        {(hasPerm("orders.view") || hasPerm("pos.access")) && (
          <>
            <SectionLabel label="Sales" />
            <NavGroup
              icon={ShoppingCart}
              label="Orders"
              isActive={isOrderRoute}
              isOpen={orderOpen}
              onToggle={() => setOrderOpen(!orderOpen)}
            >
              {hasPerm("pos.access") && (
                <SubNavItem
                  to="/admin/pos"
                  icon={CreditCard}
                  label="Point of Sale"
                  active={pathname === "/admin/pos"}
                />
              )}
              {hasPerm("orders.view") && (
                <SubNavItem
                  to="/admin/orders"
                  icon={ShoppingCart}
                  label="All Orders"
                  active={pathname === "/admin/orders"}
                />
              )}
            </NavGroup>
          </>
        )}

        {/* CATALOG */}
        {hasPerm("products.view") && (
          <>
            <SectionLabel label="Catalog" />
            <NavGroup
              icon={Package}
              label="Products"
              isActive={isCatalogRoute}
              isOpen={catalogOpen}
              onToggle={() => setCatalogOpen(!catalogOpen)}
            >
              <SubNavItem
                to="/admin/products"
                icon={Package}
                label="Product List"
                active={pathname === "/admin/products"}
              />
              <SubNavItem
                to="/admin/inventory"
                icon={Box}
                label="Inventory"
                active={pathname === "/admin/inventory"}
              />
              <SubNavItem
                to="/admin/categories"
                icon={FolderTree}
                label="Categories"
                active={pathname === "/admin/categories"}
              />
              <SubNavItem
                to="/admin/brands"
                icon={Bookmark}
                label="Brands"
                active={pathname === "/admin/brands"}
              />
              <SubNavItem
                to="/admin/suppliers"
                icon={Truck}
                label="Suppliers"
                active={pathname === "/admin/suppliers"}
              />
            </NavGroup>
          </>
        )}

        {/* CUSTOMERS */}
        {(hasPerm("customers.view") || hasPerm("reviews.manage")) && (
          <>
            <SectionLabel label="Customers" />
            <NavGroup
              icon={Users}
              label="Customers"
              isActive={isCustomerRoute}
              isOpen={customerOpen}
              onToggle={() => setCustomerOpen(!customerOpen)}
            >
              {hasPerm("customers.view") && (
                <SubNavItem
                  to="/admin/customers"
                  icon={Users}
                  label="Customer List"
                  active={pathname === "/admin/customers"}
                />
              )}
              {hasPerm("reviews.manage") && (
                <SubNavItem
                  to="/admin/reviews"
                  icon={MessageSquare}
                  label="Reviews"
                  active={pathname === "/admin/reviews"}
                />
              )}
            </NavGroup>
          </>
        )}

        {/* MARKETING */}
        {(hasPerm("vouchers.view") ||
          hasPerm("flash_sales.view") ||
          isOwner) && (
          <>
            <SectionLabel label="Marketing" />
            <NavGroup
              icon={Ticket}
              label="Promotions"
              isActive={isMarketingRoute}
              isOpen={marketingOpen}
              onToggle={() => setMarketingOpen(!marketingOpen)}
            >
              <SubNavItem
                to="/admin/vouchers"
                icon={Ticket}
                label="Vouchers"
                active={pathname === "/admin/vouchers"}
              />
              <SubNavItem
                to="/admin/flash-sales"
                icon={Zap}
                label="Flash Sale"
                active={pathname === "/admin/flash-sales"}
              />
            </NavGroup>
          </>
        )}

        {/* ANALYTICS */}
        {hasPerm("reports.view") && (
          <>
            <SectionLabel label="Analytics" />
            <NavItem
              to="/admin/reports"
              icon={BarChart3}
              label="Reports"
              active={pathname === "/admin/reports"}
            />
          </>
        )}

        {/* SYSTEM */}
        {(isManager || isOwner) && (
          <>
            <SectionLabel label="System" />
            <NavGroup
              icon={ServerCog}
              label="System"
              isActive={isSystemRoute}
              isOpen={systemOpen}
              onToggle={() => setSystemOpen(!systemOpen)}
            >
              <SubNavItem
                to="/admin/staff"
                icon={UserCog}
                label="Staff"
                active={pathname === "/admin/staff"}
              />

              {isOwner && (
                <SubNavItem
                  to="/admin/audit-logs"
                  icon={History}
                  label="Audit Logs"
                  active={pathname === "/admin/audit-logs"}
                />
              )}
              {isOwner && (
                <SubNavItem
                  to="/admin/settings"
                  icon={Settings}
                  label="Settings"
                  active={pathname === "/admin/settings"}
                />
              )}
            </NavGroup>
          </>
        )}
      </nav>

      {/* ── User Footer ── */}
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-[3px] text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200 font-medium"
        >
          <LogOut className="w-4 h-4" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
