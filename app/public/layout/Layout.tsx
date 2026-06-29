import { Outlet } from "react-router";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { SlideOutCart } from "@/public/components/cart/SlideOutCart";
import { useSetting } from "@/public/hooks/useSetting";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default function Layout() {
  const { settings } = useSetting();

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
    <div className="public-theme min-h-screen bg-[#f4f4f4] flex flex-col font-sans">
      <Header />
      <main className="flex-1 w-full relative flex flex-col">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <Footer />
      <SlideOutCart />
    </div>
  );
}
