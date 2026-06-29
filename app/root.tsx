import i18next from "i18next";
import { useTranslation } from "react-i18next";
import "./app.css";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
} from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/sonner";

import React from "react";
import * as ReactDOM from "react-dom";
import "./lib/i18n";

if (import.meta.env.DEV && typeof window !== "undefined") {
  import("@axe-core/react").then((axe) => {
    axe.default(React, ReactDOM, 1000);
  });
}

// ── QueryClient ───────────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// ── Error Boundary ────────────────────────────────────────────────────────────

export function ErrorBoundary() {
  const error = useRouteError();

  let title = "Đã xảy ra lỗi";
  let message = "Vui lòng tải lại trang hoặc quay lại trang chủ.";
  let status = 500;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title =
      error.status === 404 ? "Không tìm thấy trang" : `Lỗi ${error.status}`;
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
          >{i18next.t("🌸 Về trang chủ")}</a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

// ── App Root ──────────────────────────────────────────────────────────────────

import { useLanguageStore } from "./store/language.store";

export default function App() {
  const language = useLanguageStore((state) => state.language);
  return (
    <html lang={language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        {/* Playfair Display — expressive headings */}
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
        {/* DM Sans — clean readable body */}
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap"
          rel="stylesheet"
        />
        <Meta />
        <Links />
      </head>
      <body>
        {/*
          CartProvider đã được xóa — cart state dùng Zustand (store/cart.store.ts).
          Không cần Provider wrapper; useCartStore() có thể dùng ở bất kỳ đâu.
        */}
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>

        <Toaster />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
