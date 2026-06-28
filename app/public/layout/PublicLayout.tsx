import { Outlet } from "react-router";
import { useEffect } from "react";
import PublicHeader from "./Header";
import PublicFooter from "./Footer";
import { SlideOutCart } from "@/public/components/SlideOutCart";
import { useShopSettings } from "@/public/hooks/useShopSettings";

export function PublicLayout() {
  const { settings } = useShopSettings();

  // Inject SEO metadata dynamically
  useEffect(() => {
    if (settings.seoTitle) {
      document.title = settings.seoTitle;
    } else if (settings.storeName) {
      document.title = settings.storeName;
    }

    if (settings.seoDescription) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", settings.seoDescription);
    }

    if (settings.favicon) {
      let linkFavicon = document.querySelector('link[rel="icon"]');
      if (!linkFavicon) {
        linkFavicon = document.createElement("link");
        linkFavicon.setAttribute("rel", "icon");
        document.head.appendChild(linkFavicon);
      }
      linkFavicon.setAttribute("href", settings.favicon);
    }
  }, [
    settings.seoTitle,
    settings.storeName,
    settings.seoDescription,
    settings.favicon,
  ]);

  return (
    <div className="public-theme min-h-screen bg-slate-100 flex flex-col font-sans text-ink">
      <PublicHeader />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <PublicFooter />
      <SlideOutCart />
    </div>
  );
}
