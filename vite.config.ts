import { defineConfig } from "vite";
import path from "node:path";
import electron from "vite-plugin-electron/simple";
import react from "@vitejs/plugin-react";
import { minify } from "html-minifier-terser";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(__dirname, "electron/preload.ts"),
      },
      renderer: process.env.NODE_ENV === "test" ? undefined : {},
    }),
    {
      name: "html-transform",
      transformIndexHtml(html) {
        return minify(html, {
          removeComments: true,
          collapseWhitespace: true,
          collapseInlineTagWhitespace: true,
        });
      },
    },
  ],
  css: {
    postcss: "./postcss.config.js",
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
        },
      },
    },
    minify: "terser", // Use 'terser' for better minification
  },
  optimizeDeps: {
    esbuildOptions: {
      treeShaking: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
