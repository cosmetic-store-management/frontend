
import "./app.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useLocation,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";

import React from "react";


import { queryClient } from "@/lib/queryClient";

// ── Error Boundary ────────────────────────────────────────────────────────────

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "An error occurred";
  let message = "Please reload the page or return to the homepage.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title =
      error.status === 404 ? "Page not found" : `Error ${error.status}`;
    message = error.data ?? message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const language = useLanguageStore((state) => state.language);
  return (
    <html lang={language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="no-referrer" />
        <title>{`${title} | GlowUp Cosmetics`}</title>
        <Links />
      </head>
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "#fafafa",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "5rem",
              fontWeight: 900,
              color: "#db2777",
              lineHeight: 1,
              marginBottom: "0.5rem",
            }}
          >
            {status}
          </div>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              color: "#111827",
              marginBottom: "0.75rem",
            }}
          >
            {title}
          </h1>
          <p
            style={{
              color: "#6b7280",
              fontSize: "0.9rem",
              maxWidth: "28rem",
              marginBottom: "2rem",
              lineHeight: 1.6,
            }}
          >
            {message}
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 2rem",
              background: "#db2777",
              color: "#fff",
              borderRadius: "6px",
              fontWeight: 700,
              fontSize: "0.9rem",
              textDecoration: "none",
            }}
          >Home</a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────

import { useLanguageStore } from "./store/language.store";

export function Layout({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    const initTranslate = () => {
      if ((window as any).google?.translate?.TranslateElement) {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "vi,en",
            layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
          },
          "google_translate_element"
        );
      }
    };

    (window as any).googleTranslateElementInit = initTranslate;

    if ((window as any).google?.translate?.TranslateElement) {
      initTranslate();
    }

    const checkInterval = setInterval(() => {
      const cookie = document.cookie;
      const hasViCookie = cookie.includes("googtrans=/en/vi");
      const currentLang = useLanguageStore.getState().language;

      if (!hasViCookie && currentLang === "vi") {
        useLanguageStore.getState().setLanguage("en");
      }
    }, 1000);

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  const location = useLocation();

  React.useEffect(() => {
    // Re-trigger translation on SPA navigation if language is Vietnamese
    const timer = setTimeout(() => {
      const currentLang = useLanguageStore.getState().language;
      if (currentLang === "vi") {
        const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
        if (select) {
          select.value = "vi";
          select.dispatchEvent(new Event("change"));
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="referrer" content="no-referrer" />
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link rel="preconnect" href="https://translate.google.com" />
        <link rel="preconnect" href="https://translate.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        <div id="google_translate_element" style={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 9999 }}></div>
        <script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          async
          defer
        ></script>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>

        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
