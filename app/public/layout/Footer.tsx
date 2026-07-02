import { Link } from "react-router";
import {
  Facebook,
  Instagram,
  MapPin,
  Phone,
  Mail,
  Youtube,
  MessageCircle,
  Music2,
} from "lucide-react";
import { useSetting } from "@/public/hooks/useSetting";

export default function Footer() {
  const { settings } = useSetting();

  return (
    <footer className="mt-auto" style={{ background: "hsl(345, 20%, 8%)" }}>
      {/* ── Main Footer ── */}
      <div className="max-w-300 w-full mx-auto px-4 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-105">
                <img
                  src="/logo.png"
                  alt="GlowUp"
                  className="w-full h-full object-cover scale-[1.4]"
                />
              </div>
              <span
                className="text-2xl font-bold tracking-tight text-white"
                style={{
                  fontFamily:
                    "var(--font-display, 'Playfair Display', Georgia, serif)",
                }}
              >
                Glow<span style={{ color: "hsl(352, 72%, 62%)" }}>Up</span>
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed"
              style={{ color: "hsl(345, 8%, 55%)" }}
            >
              {settings.seoDescription ??
                "Pioneering authentic beauty for modern Asian women. Curated skincare and cosmetics that celebrate your natural glow."}
            </p>

            <div className="space-y-3">
              {settings.storeAddress && (
                <div className="flex items-start gap-3">
                  <MapPin
                    className="w-4 h-4 shrink-0 mt-0.5"
                    style={{ color: "hsl(352, 72%, 62%)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "hsl(345, 8%, 55%)" }}
                  >
                    {settings.storeAddress}
                  </span>
                </div>
              )}
              {settings.phone && (
                <div className="flex items-center gap-3">
                  <Phone
                    className="w-4 h-4 shrink-0"
                    style={{ color: "hsl(352, 72%, 62%)" }}
                  />
                  <span className="text-sm font-semibold text-white">
                    {settings.phone}{" "}
                    <span
                      className="font-normal"
                      style={{ color: "hsl(345, 8%, 55%)" }}
                    >
                      (8:00–22:00)
                    </span>
                  </span>
                </div>
              )}
              {settings.email && (
                <div className="flex items-center gap-3">
                  <Mail
                    className="w-4 h-4 shrink-0"
                    style={{ color: "hsl(352, 72%, 62%)" }}
                  />
                  <span
                    className="text-sm"
                    style={{ color: "hsl(345, 8%, 55%)" }}
                  >
                    {settings.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* About Links */}
          <div className="lg:col-span-2">
            <h3
              className="text-[11px] font-bold uppercase tracking-widest mb-5"
              style={{ color: "hsl(345, 10%, 94%)" }}
            >
              ABOUT
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: "/about", label: "Our Story" },
                { to: "#", label: "Store Locator" },
                { to: "#", label: "Careers" },
                { to: "/blog", label: "Beauty Blog" },
                { to: "#", label: "Privacy Policy" },
                { to: "#", label: "Terms of Use" },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="transition-all duration-200 hover:translate-x-1 inline-block"
                    style={{ color: "hsl(345, 8%, 55%)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "hsl(352, 72%, 62%)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "hsl(345, 8%, 55%)")
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="lg:col-span-2">
            <h3
              className="text-[11px] font-bold uppercase tracking-widest mb-5"
              style={{ color: "hsl(345, 10%, 94%)" }}
            >
              SUPPORT
            </h3>
            <ul className="space-y-3 text-sm">
              {[
                { to: "#", label: "Help Center (FAQ)" },
                { to: "#", label: "How to Order" },
                { to: "#", label: "Payment Methods" },
                { to: "#", label: "Shipping Policy" },
                { to: "#", label: "Return Policy" },
                { to: "#", label: "Track My Order" },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="transition-all duration-200 hover:translate-x-1 inline-block"
                    style={{ color: "hsl(345, 8%, 55%)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "hsl(352, 72%, 62%)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "hsl(345, 8%, 55%)")
                    }
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter + Social */}
          <div className="lg:col-span-4">
            <h3
              className="text-[11px] font-bold uppercase tracking-widest mb-5"
              style={{ color: "hsl(345, 10%, 94%)" }}
            >
              STAY IN THE GLOW
            </h3>
            <p className="text-sm mb-5 text-white/70">
              Beauty tips, exclusive offers, and new arrivals — straight to your
              inbox.
            </p>

            <form
              className="flex mb-8 rounded-sm overflow-hidden border"
              style={{ borderColor: "hsl(345, 12%, 18%)" }}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 text-sm text-white focus:outline-none placeholder:opacity-40"
                style={{ background: "hsl(345, 12%, 13%)", border: "none" }}
              />
              <button
                type="button"
                className="px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 shrink-0"
                style={{ background: "hsl(352, 72%, 52%)" }}
              >
                Subscribe
              </button>
            </form>

            <h3
              className="text-[11px] font-bold uppercase tracking-widest mb-4"
              style={{ color: "hsl(345, 10%, 94%)" }}
            >
              FOLLOW US
            </h3>
            <div className="flex items-center gap-2.5">
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                  style={{ background: "hsl(345, 12%, 16%)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#1877F2")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "hsl(345, 12%, 16%)")
                  }
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                  style={{ background: "hsl(345, 12%, 16%)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#E4405F")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "hsl(345, 12%, 16%)")
                  }
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                  style={{ background: "hsl(345, 12%, 16%)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "hsl(345, 80%, 30%)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "hsl(345, 12%, 16%)")
                  }
                >
                  <Music2 className="w-4 h-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                  style={{ background: "hsl(345, 12%, 16%)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#FF0000")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "hsl(345, 12%, 16%)")
                  }
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.zaloUrl && (
                <a
                  href={settings.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-sm flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                  style={{ background: "hsl(345, 12%, 16%)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#0068FF")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "hsl(345, 12%, 16%)")
                  }
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="border-t" style={{ borderColor: "hsl(345, 12%, 13%)" }}>
        <div className="max-w-300 w-full mx-auto px-4 py-5 flex items-center justify-center">
          <p
            className="text-xs text-center"
            style={{ color: "hsl(345, 6%, 40%)" }}
          >
            © {new Date().getFullYear()}{" "}
            <span className="text-white font-medium">
              {settings.storeName || "GlowUp"}
            </span>
            . All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
