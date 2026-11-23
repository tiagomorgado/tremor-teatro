import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// BASE_PATH: set for the GitHub Pages preview, which lives in a subfolder (see react-router.config.ts).
export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
});
