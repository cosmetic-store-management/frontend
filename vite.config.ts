import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import babel from "vite-plugin-babel";
import path from "path";

export default defineConfig({
  plugins: [
    process.env.VITEST ? null : reactRouter(),
    tailwindcss(),
    babel({
      filter: /\.[jt]sx?$/,
      babelConfig: {
        presets: ["@babel/preset-typescript"],
        plugins: [
          ["babel-plugin-react-compiler"]
        ],
      },
    }),
  ].filter(Boolean) as any,
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
  build: {
    rollupOptions: {
    }
  },
  // @ts-expect-error - vitest config field
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    exclude: ["node_modules", "tests/**/*.spec.ts"],
  },
});
