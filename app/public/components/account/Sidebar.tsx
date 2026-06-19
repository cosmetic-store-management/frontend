import { Package, User, LogOut, FileText, MapPin, Award, Heart } from "lucide-react";

interface SidebarProps {
  user: { name: string; email?: string; avatar?: string };
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { key: "profile",   label: "Thông tin cá nhân",  icon: User },
  { key: "tier",      label: "Hạng thành viên",     icon: Award },
  { key: "orders",    label: "Quản lý đơn hàng",    icon: Package },
  { key: "vouchers",  label: "Mã giảm giá",          icon: Award },
  { key: "address",   label: "Địa chỉ",              icon: MapPin },
  { key: "viewed",    label: "Sản phẩm đã xem",      icon: FileText },
  { key: "favorites", label: "Sản phẩm yêu thích",   icon: Heart },
] as const;

export function Sidebar({ user, activeTab, onTabChange, onLogout }: SidebarProps) {
  return (
    <div className="w-full md:w-1/4 lg:w-1/5 shrink-0">
      <div className="bg-surface h-full flex flex-col">
        {/* User Info Header */}
        <div className="p-4 flex items-center gap-3 border-b border-border/50">
          <div data-testid="sidebar-avatar" className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-border">
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-success text-white flex items-center justify-center font-bold text-lg">
                {user.name?.substring(0, 2).toUpperCase() || "KH"}
              </div>
            )}
          </div>
          <div className="overflow-hidden">
            <h2 className="font-bold text-sm text-ink truncate">{user.name}</h2>
            <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col py-4 flex-1 gap-2">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => onTabChange(key)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                activeTab === key ? "text-brand font-bold" : "text-ink hover:text-brand"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
          <button
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-ink hover:text-brand transition-colors"
          >
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </nav>
      </div>
    </div>
  );
}
