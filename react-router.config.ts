import type { Config } from "@react-router/dev/config";

// Fully static: every route is pre-rendered to HTML at build time, so the site can be
// served from any static host (or the current cPanel) with no Node server.
export default {
  ssr: false,
  // "/" on tremorteatro.pt; "/<repo>/" for the GitHub Pages preview (.github/workflows/pages.yml).
  basename: process.env.BASE_PATH || "/",
  async prerender({ getStaticPaths }) {
    // "/404" renders the catch-all route; the build copies it to 404.html for the host.
    return [...getStaticPaths(), "/404"];
  },
} satisfies Config;
