import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { legacyRedirects } from './src/data/legacy-redirects.js';

export default defineConfig({
  site: 'https://ulp.ugr.es',
  integrations: [tailwind(), sitemap()],
  redirects: legacyRedirects,
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },
});
