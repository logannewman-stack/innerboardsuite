import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://innerboardsuite.com",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  // The sitemap lists the real pages only (the 404 page is served for missing routes and is not indexed).
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(page) })],
  vite: { plugins: [tailwindcss()] }
});
