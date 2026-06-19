import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [process.env.VITEST ? null : reactRouter(), tailwindcss()].filter(Boolean) as any,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./app"),
    },
    dedupe: ["react", "react-dom"],
  },
  ssr: {
    noExternal: ["react-hook-form", "@hookform/resolvers"],
  },
  server: {
    proxy: {
      "/api": "http://localhost:3001",
    },
  },
  // @ts-ignore - vitest config field
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    exclude: ["node_modules", "tests/**/*.spec.ts"],
  },
});
