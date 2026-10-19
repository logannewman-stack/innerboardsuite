import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://innerboardsuite.com",
  output: "static",
  trailingSlash: "never",
  build: { format: "file" },
  // The scratch page that exercises the system is never linked and never listed.
  integrations: [sitemap({ filter: (page) => !page.includes("/system-demo") })],
  vite: { plugins: [tailwindcss()] }
});
