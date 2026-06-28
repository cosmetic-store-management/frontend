import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { usePublicAuthStore } from "../../store/public.auth.store";
import { useCartStore } from "../../store/cart.store";
import { useCategories } from "../hooks/useCategories";
import { usePublicBrands } from "@/public/hooks/useBrands";
import { useLogout } from "@/auth/hooks/usePublicAuth";

export default function PublicHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMegaCategory, setActiveMegaCategory] = useState<any>(null);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);

  const { user, isAuthenticated, clearAuth } = usePublicAuthStore();

  const items = useCartStore((state) => state.items);
  const cartCount = items.reduce((total, item) => total + item.quantity, 0);

  const { data: categories = [] } = useCategories();
  const { data: brands = [] } = usePublicBrands();
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const megaMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openMegaMenu = () => {
    if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
    setIsMegaMenuOpen(true);
  };

  const closeMegaMenu = () => {
    megaMenuTimer.current = setTimeout(() => setIsMegaMenuOpen(false), 200);
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (megaMenuTimer.current) clearTimeout(megaMenuTimer.current);
    };
  }, []);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    clearAuth();
    navigate("/");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <>
      {/* =========================================
          TIER 2: MAIN HEADER
          ========================================= */}
      <header
        className={`bg-white sticky top-0 z-50 transition-shadow ${isScrolled ? "shadow-md" : "border-b border-border"}`}
      >
        <div className="max-w-[1200px] w-full mx-auto px-4 py-3 flex items-center gap-4">
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden text-ink p-1"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center justify-center shrink-0 w-[72px] h-[72px] overflow-hidden rounded-full hover:opacity-90 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="GlowUp Logo"
              className="w-full h-full object-cover scale-[1.45]"
            />
          </Link>

          <div className="hidden lg:block flex-1 max-w-[600px] mx-auto px-4">
            <form
              onSubmit={handleSearch}
              className="flex items-center w-full relative h-10 border-b-2 border-brand"
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm sản phẩm, danh mục hay thương hiệu mong muốn"
                className="w-full h-full bg-transparent py-0 pl-2 pr-10 text-[15px] text-ink focus:outline-none placeholder:text-ink-muted/80"
              />
              <button
                type="submit"
                className="absolute right-0 text-ink hover:text-brand transition-colors p-2"
              >
                <Search className="w-[22px] h-[22px]" strokeWidth={1.5} />
              </button>
            </form>
          </div>

          <div className="flex items-center gap-3 lg:gap-5 shrink-0 ml-auto lg:ml-0 text-ink">
            <span className="hidden lg:block text-[14px] text-ink whitespace-nowrap">
              Hotline: 1900 1234
            </span>
            <span className="hidden lg:block text-border text-lg font-light">
              |
            </span>

            <button
              className="lg:hidden text-ink p-1 hover:text-brand"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Search className="w-6 h-6" strokeWidth={1.5} />
            </button>

            {/* Auth Link */}
            <Link
              to={isAuthenticated ? "/account" : `/login?returnUrl=/account`}
              className="hidden sm:block p-1 hover:text-brand transition-colors relative"
            >
              <User className="w-7 h-7" strokeWidth={1.5} />
            </Link>

            {/* Cart Button → /cart route */}
            <Link
              to="/cart"
              className="p-1 hover:text-brand transition-colors relative"
            >
              <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-[18px] h-[18px] bg-brand text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* =========================================
            TIER 3: CATEGORY NAVIGATION BAR
            ========================================= */}
        <nav className="hidden lg:flex bg-surface relative z-40 border-t border-border">
          <div className="max-w-[1200px] w-full mx-auto px-4 flex items-stretch gap-8 text-[13px] font-bold text-ink">
            {/* Mega Menu Trigger (DANH MỤC SẢN PHẨM) */}
            <div
              className="relative group flex items-center"
              onMouseEnter={openMegaMenu}
              onMouseLeave={closeMegaMenu}
            >
              <button
                className={`flex items-center h-full py-4 gap-2 uppercase hover:text-brand transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand after:scale-x-0 after:transition-transform after:origin-center ${isMegaMenuOpen ? "after:scale-x-100 text-brand" : "group-hover:after:scale-x-100"}`}
              >
                <Menu className="w-5 h-5" />
                DANH MỤC SẢN PHẨM
              </button>

              {/* Vertical Mega Menu Dropdown */}
              <div
                className={`absolute top-full left-0 w-[1000px] min-h-[400px] flex bg-surface transition-all duration-300 ease-out z-50 border border-border shadow-ui-card rounded-sm overflow-hidden origin-top ${isMegaMenuOpen ? "opacity-100 visible translate-y-0" : "opacity-0 invisible translate-y-3"}`}
              >
                {/* Left Column: Level 1 Categories */}
                <div className="w-[260px] shrink-0 border-r border-border py-2 bg-surface flex flex-col">
                  {categories.length > 0
                    ? categories
                        .filter(
                          (cat: any) => cat.children && cat.children.length > 0,
                        )
                        .map((cat: any, index: number) => {
                          const isHovered = activeMegaCategory
                            ? activeMegaCategory.slug === cat.slug
                            : index === 0;
                          return (
                            <div
                              key={cat.id || cat._id}
                              className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${isHovered ? "bg-surface-soft" : "hover:bg-surface-soft"}`}
                              onMouseEnter={() => setActiveMegaCategory(cat)}
                            >
                              <Link
                                onClick={() => setIsMegaMenuOpen(false)}
                                to={`/products?category=${cat.slug}`}
                                className="flex items-center gap-3 text-ink w-full"
                              >
                                {cat.iconUrl && (
                                  <img
                                    src={cat.iconUrl}
                                    alt={cat.name}
                                    className="w-6 h-6 object-contain shrink-0"
                                  />
                                )}
                                <span
                                  className={`text-[14px] transition-colors ${isHovered ? "font-bold text-brand" : "font-medium text-ink"}`}
                                >
                                  {cat.name}
                                </span>
                              </Link>
                              {cat.children && cat.children.length > 0 && (
                                <ChevronRight
                                  className={`w-4 h-4 transition-colors ${isHovered ? "text-brand" : "text-ink-muted"}`}
                                />
                              )}
                            </div>
                          );
                        })
                    : null}
                </div>

                {/* Right Column: Active Category Content */}
                <div className="flex-1 p-6 bg-surface">
                  {(() => {
                    const activeCat = activeMegaCategory || categories[0];
                    if (
                      !activeCat ||
                      !activeCat.children ||
                      activeCat.children.length === 0
                    )
                      return null;
                    return (
                      <div
                        key={activeCat.slug}
                        className="flex gap-8 h-full animate-in fade-in slide-in-from-left-2 duration-300 ease-out"
                      >
                        {/* Subcategories */}
                        <div className="flex-1 columns-2 lg:columns-3 gap-x-8 self-start">
                          {activeCat.children.map((child: any) => (
                            <div
                              key={child.id || child._id}
                              className="flex flex-col gap-1.5 break-inside-avoid mb-4"
                            >
                              <Link
                                onClick={() => setIsMegaMenuOpen(false)}
                                to={`/products?category=${child.slug}`}
                                className="text-[13px] font-bold text-foreground hover:text-primary transition-colors uppercase tracking-wide"
                              >
                                {child.name}
                              </Link>
                              {child.children && child.children.length > 0 && (
                                <ul className="flex flex-col gap-1.5 mt-1">
                                  {child.children.map((sub: any) => (
                                    <li key={sub.id || sub._id}>
                                      <Link
                                        onClick={() => setIsMegaMenuOpen(false)}
                                        to={`/products?category=${sub.slug}`}
                                        className="text-[13px] font-normal text-slate-700 hover:text-primary transition-colors flex items-start gap-1.5 capitalize"
                                      >
                                        <span className="text-slate-300 font-bold leading-tight">
                                          -
                                        </span>
                                        <span className="leading-tight">
                                          {sub.name}
                                        </span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                        {/* Banner */}
                        {activeCat.bannerUrl && (
                          <div className="w-[220px] shrink-0">
                            <Link
                              onClick={() => setIsMegaMenuOpen(false)}
                              to={`/products?category=${activeCat.slug}`}
                            >
                              <img
                                src={activeCat.bannerUrl}
                                alt={activeCat.name}
                                className="w-full h-auto object-cover rounded-sm shadow-sm hover:opacity-90 transition-opacity"
                              />
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Nav Items */}
            <div className="flex items-stretch gap-8 flex-1">
              {categories.slice(0, 2).map((cat: any) => (
                <div
                  key={cat.id || cat._id}
                  className="relative group flex items-center"
                >
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="flex items-center h-full py-4 uppercase hover:text-brand transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-center"
                  >
                    {cat.name}
                    {cat.children && cat.children.length > 0 && (
                      <ChevronDown className="w-4 h-4 ml-1" />
                    )}
                  </Link>

                  {/* Subcategory Dropdown */}
                  {cat.children && cat.children.length > 0 && (
                    <div className="absolute top-full left-0 min-w-[240px] bg-surface opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 py-2 border border-border shadow-ui-card rounded-sm">
                      {cat.children.map((child: any) => (
                        <div
                          key={child.id || child._id}
                          className="group/sub relative"
                        >
                          <Link
                            to={`/products?category=${child.slug}`}
                            className="flex items-center justify-between px-4 py-2.5 text-[14px] text-ink hover:text-brand hover:bg-surface-soft transition-colors"
                          >
                            {child.name}
                            {child.children && child.children.length > 0 && (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Link>

                          {/* Level 3 Subcategory Flyout (if any) */}
                          {child.children && child.children.length > 0 && (
                            <div className="absolute top-0 left-full min-w-[200px] bg-surface opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50 py-2 border border-border shadow-ui-card rounded-sm">
                              {child.children.map((sub: any) => (
                                <Link
                                  key={sub.id || sub._id}
                                  to={`/products?category=${sub.slug}`}
                                  className="block px-4 py-2 text-[13.5px] text-ink hover:text-brand hover:bg-surface-soft transition-colors"
                                >
                                  {sub.name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              <div className="relative group flex items-center">
                <Link
                  to="/products?sort=newest"
                  className="flex items-center h-full py-4 uppercase hover:text-brand transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-center"
                >
                  HÀNG MỚI
                </Link>
              </div>

              <div className="relative group flex items-center">
                <Link
                  to="/brands"
                  className="flex items-center h-full py-4 uppercase hover:text-brand transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-brand after:scale-x-0 group-hover:after:scale-x-100 after:transition-transform after:origin-center"
                >
                  THƯƠNG HIỆU <ChevronDown className="w-4 h-4 ml-1" />
                </Link>

                {/* Brand Mega Menu */}
                <div className="absolute top-full left-0 w-[500px] bg-surface opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-6">
                  <h4 className="font-bold text-ink mb-4 pb-2 uppercase tracking-wide">
                    Thương hiệu nổi bật
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    {brands.length > 0
                      ? brands.slice(0, 9).map((brand: any) => (
                          <Link
                            key={brand.id || brand._id}
                            to={`/products?brandId=${brand.id || brand._id}`}
                            className="text-[14px] text-ink-muted hover:text-brand transition-colors truncate"
                          >
                            {brand.name}
                          </Link>
                        ))
                      : null}
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/50 text-center">
                    <Link
                      to="/brands"
                      className="text-[14px] font-bold text-brand hover:underline"
                    >
                      Xem tất cả thương hiệu &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* =========================================
          MOBILE MENU OVERLAY
          ========================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] flex lg:hidden">
          {/* eslint-disable-next-line  */}
          {/* eslint-disable-next-line  */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 bg-surface-soft flex justify-between items-center border-b border-border">
              <div className="flex items-center gap-3">
                {isAuthenticated ? (
                  <>
                    <div className="btn-hover w-10 h-10 rounded-full bg-brand text-white flex items-center justify-center font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-ink text-sm">{user?.name}</p>
                      <p className="text-[11px] text-ink-muted">
                        {user?.email}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-full bg-border flex items-center justify-center text-ink-muted">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="font-bold text-brand text-sm hover:underline"
                      >
                        Đăng nhập
                      </Link>
                      <p className="text-[11px] text-ink-muted">
                        Để nhận nhiều ưu đãi
                      </p>
                    </div>
                  </>
                )}
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2">
                <X className="w-6 h-6 text-ink" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-1">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 font-bold text-ink border-b border-border"
                >
                  Trang chủ
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 font-bold text-ink border-b border-border"
                >
                  Tất cả sản phẩm
                </Link>
              </div>

              <div className="p-4">
                <h4 className="font-bold text-ink-muted text-xs uppercase mb-3">
                  Danh mục sản phẩm
                </h4>
                <div className="space-y-1">
                  {categories.map((cat) => (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2.5 text-sm font-medium text-ink"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {isAuthenticated && (
              <div className="p-4 border-t border-border">
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 mb-2 font-bold text-ink bg-surface-soft rounded-sm"
                >
                  Quản lý tài khoản
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-center py-2.5 font-bold text-danger bg-danger/10 rounded-sm"
                >
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
