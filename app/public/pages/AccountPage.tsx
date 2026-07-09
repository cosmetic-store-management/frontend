import { useState, useEffect, type ReactElement } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth, useLogout } from "@/auth/hooks/useAuth";
import { toast } from "@/lib/toast";
import { Sidebar } from "@/public/components/account/Sidebar";
import { PersonalInfoPage } from "@/public/components/account/PersonalInfoPage";
import { AddressPage } from "@/public/components/account/AddressPage";
import { OrdersPage } from "@/public/components/account/OrdersPage";
import { TierPage } from "@/public/components/account/TierPage";
import { VouchersPage } from "@/public/components/account/VouchersPage";
import { FavoritesPage } from "@/public/components/account/FavoritesPage";
import { ViewedPage } from "@/public/components/account/ViewedPage";

type Tab =
  | "account"
  | "address"
  | "orders"
  | "tier"
  | "vouchers"
  | "favorites"
  | "viewed";

const VALID_TABS: Tab[] = [
  "account",
  "address",
  "orders",
  "tier",
  "vouchers",
  "favorites",
  "viewed",
];

export function AccountPage() {
  const { user, logout: clearAuth } = useAuth();
  const logoutMutation = useLogout();
  const navigate = useNavigate();
  const location = useLocation();

  const viewParam = new URLSearchParams(location.search).get("view");
  const [activeTab, setActiveTab] = useState<Tab>("account");

  // Sync tab with URL query param
  useEffect(() => {
    if (viewParam === "coupon") {
      {
        /* eslint-disable-next-line  */
      }
      setActiveTab("vouchers");
    } else if (viewParam && VALID_TABS.includes(viewParam as Tab)) {
      setActiveTab(viewParam as Tab);
    } else if (!viewParam) {
      setActiveTab("account");
    }
  }, [viewParam]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as Tab);
    const query =
      tab === "account" ? "" : `?view=${tab === "vouchers" ? "coupon" : tab}`;
    navigate(`/account${query}`, { replace: true });
  };

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    clearAuth();
    toast.success("Logged out successfully");
    navigate("/");
  };

  useEffect(() => {
    if (!user) navigate("/login", { state: { from: location } });
  }, [user, navigate, location]);

  if (!user) return null;

  const PAGE_MAP: Record<Tab, ReactElement> = {
    account: <PersonalInfoPage />,
    address: <AddressPage />,
    orders: <OrdersPage />,
    tier: <TierPage />,
    vouchers: <VouchersPage />,
    favorites: <FavoritesPage />,
    viewed: <ViewedPage />,
  };

  return (
    <div className="max-w-300 w-full mx-auto px-4 py-8 animate-page-enter">
      <div className="flex flex-col md:flex-row gap-6">
        <Sidebar
          user={user}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={handleLogout}
        />
        <div className="flex-1 min-w-0 flex flex-col">
          {PAGE_MAP[activeTab]}
        </div>
      </div>
    </div>
  );
}
