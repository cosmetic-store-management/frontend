import { Outlet, useNavigation, useLocation } from "react-router";
import { useEffect } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { useSetting } from "@/public/hooks/useSetting";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { useAuth } from "@/auth/hooks/useAuth";
import { useFavoriteStore } from "@/public/store/favorite.store";
import { useToggleFavorite } from "@/public/hooks/useUser";

import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { AnimatePresence, motion } from "framer-motion";

// Custom NProgress configuration for premium feel
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 });

export default function Layout() {
  const { settings } = useSetting();
  const { isLoggedIn } = useAuth();
  const localFavorites = useFavoriteStore((state) => state.itemIds);
  const clearFavorites = useFavoriteStore((state) => state.clearFavorites);
  const toggleFavoriteMutation = useToggleFavorite();
  
  const navigation = useNavigation();
  const location = useLocation();

  // NProgress loader logic
  useEffect(() => {
    if (navigation.state === "loading" || navigation.state === "submitting") {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [navigation.state]);

  // Sync local favorites to server upon login
  useEffect(() => {
    if (isLoggedIn && localFavorites.length > 0) {
      Promise.all(localFavorites.map((id) => toggleFavoriteMutation.mutateAsync(id)))
        .then(() => {
          clearFavorites();
        })
        .catch(console.error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

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
      <main className="flex-1 w-full relative flex flex-col overflow-hidden">
        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex-1 flex flex-col w-full h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}
