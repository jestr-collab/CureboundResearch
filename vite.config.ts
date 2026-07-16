import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

// Project site: https://jestr-collab.github.io/CureboundResearch/
export default defineConfig(({ command, mode }) => ({
  base:
    mode === "export" || command === "serve"
      ? "/"
      : "/CureboundResearch/",
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        researchExport: resolve(__dirname, "export-research.html"),
        donorExport: resolve(__dirname, "export-donor.html"),
      },
    },
  },
}));
