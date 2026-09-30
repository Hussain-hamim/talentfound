import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { outDir: "dist/client" },
  server: { host: "0.0.0.0", allowedHosts: ["terminal.local"] },
  // The Next.js app in the parent folder has a PostCSS config. Vite would
  // load it and fail because @tailwindcss/postcss is not installed here.
  css: { postcss: { plugins: [] } },
  plugins: [react(), tailwindcss()],
});
