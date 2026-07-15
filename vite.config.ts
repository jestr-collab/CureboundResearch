import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Project site: https://jestr-collab.github.io/CureboundResearch/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/CureboundResearch/" : "/",
  plugins: [react()],
}));
