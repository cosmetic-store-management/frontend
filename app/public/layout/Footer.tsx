import { Link } from "react-router";
import { Facebook, Instagram, Youtube, MapPin, Phone, Mail } from "lucide-react";
import { useShopSettings } from "@/public/hooks/useShopSettings";

export default function PublicFooter() {
  const { settings } = useShopSettings();

  return (
    <footer className="dark bg-black mt-auto border-t border-white/10 text-foreground">

      {/* Main Footer */}
      <div className="max-w-[1200px] w-full mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">

          {/* Brand Info */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2 group inline-flex">
              <div className="btn-hover w-10 h-10 bg-brand text-white rounded-md flex items-center justify-center font-bold text-2xl group-hover:rotate-[15deg] transition-all duration-300 shadow-lg shadow-brand/20">
                G
              </div>
              <span className="font-black text-3xl tracking-tighter text-white">
                Glow<span className="text-brand">Up</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              {settings.description ?? "Tiên phong trong việc mang đến những sản phẩm làm đẹp chính hãng, an toàn và hiệu quả nhất. Đánh thức vẻ đẹp tự nhiên của phụ nữ Á Đông bằng sự thấu hiểu và tận tâm."}
            </p>
            <div className="space-y-3 pt-2">
              {settings.storeAddress && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-400">{settings.storeAddress}</span>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-brand shrink-0" />
                  <span className="text-sm font-semibold text-white">
                    {settings.phone}{" "}
                    <span className="font-normal text-gray-400">(8:00 - 22:00)</span>
                  </span>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-brand shrink-0" />
                  <span className="text-sm text-gray-400">{settings.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* About */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-6">
              Về {settings.storeName || "GlowUp"}
            </h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/about"    className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Câu chuyện thương hiệu</Link></li>
              <li><Link to="#"         className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Hệ thống cửa hàng</Link></li>
              <li><Link to="#"         className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Tuyển dụng</Link></li>
              <li><Link to="/blog"     className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Blog làm đẹp</Link></li>
              <li><Link to="#"         className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Chính sách bảo mật</Link></li>
              <li><Link to="#"         className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Điều khoản sử dụng</Link></li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white uppercase tracking-wider mb-6">Hỗ trợ khách hàng</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="#" className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Trung tâm trợ giúp (FAQ)</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Hướng dẫn mua hàng</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Phương thức thanh toán</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Chính sách giao hàng</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Chính sách đổi trả</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-brand transition-colors inline-block hover:translate-x-1 duration-200">Tra cứu đơn hàng</Link></li>
            </ul>
          </div>

          {/* Newsletter + Social */}
          <div className="lg:col-span-4">
            <h4 className="font-bold text-white uppercase tracking-wider mb-6">Đăng ký nhận tin</h4>
            <p className="text-sm text-gray-400 mb-4">Đừng bỏ lỡ các chương trình khuyến mãi siêu hấp dẫn và bí quyết làm đẹp từ chuyên gia.</p>
            <form className="flex mb-8">
              <input
                type="email"
                placeholder="Nhập email của bạn"
                className="w-full bg-[#1a1a1a] border border-white/10 px-4 py-2.5 rounded-l-sm text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand placeholder:text-gray-500"
              />
              <button
                type="button"
                className="bg-brand hover:bg-brand-dark text-white px-4 py-2.5 rounded-r-sm font-semibold text-sm transition-colors"
              >
                Đăng ký
              </button>
            </form>

            <h4 className="font-bold text-white uppercase tracking-wider mb-4">Kết nối với chúng tôi</h4>
            <div className="flex items-center gap-3">
              <a
                href={settings.facebookUrl  ?? "#"}
                target={settings.facebookUrl  ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="btn-hover w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white hover:bg-[#1877F2] transition-all border border-white/10"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={settings.instagramUrl ?? "#"}
                target={settings.instagramUrl ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="btn-hover w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white hover:bg-[#E4405F] transition-all border border-white/10"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href={settings.youtubeUrl   ?? "#"}
                target={settings.youtubeUrl   ? "_blank" : undefined}
                rel="noopener noreferrer"
                className="btn-hover w-10 h-10 rounded-full bg-[#1a1a1a] flex items-center justify-center text-white hover:bg-[#FF0000] transition-all border border-white/10"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black">
        <div className="max-w-[1200px] w-full mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} {settings.storeName || "GlowUp Cosmetics"}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
