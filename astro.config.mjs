// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://christian-toledo.casa-verde.casa",
  i18n: {
    locales: ["en", "sv"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // The five Turbo-era posts were renamed when the product became Cityroam. These
  // keep the old URLs alive — they're linked from elsewhere and indexed.
  redirects: {
    "/blog/turbo": "/blog/cityroam",
    "/blog/turbo-tuya-free": "/blog/cityroam-tuya-free",
    "/blog/turbo-physics": "/blog/cityroam-physics",
    "/blog/turbo-website": "/blog/cityroam-website-build",
    "/blog/turbo-navee": "/blog/cityroam-multibrand",
    "/sv/blog/turbo": "/sv/blog/cityroam",
    "/sv/blog/turbo-tuya-free": "/sv/blog/cityroam-tuya-free",
    "/sv/blog/turbo-physics": "/sv/blog/cityroam-physics",
    "/sv/blog/turbo-website": "/sv/blog/cityroam-website-build",
    "/sv/blog/turbo-navee": "/sv/blog/cityroam-multibrand",
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en", sv: "sv" },
      },
    }),
  ],
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
});
