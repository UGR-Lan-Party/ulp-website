import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { legacyRedirects } from './src/data/legacy-redirects.js';

export default defineConfig({
  site: 'https://ulp.ugr.es',
  integrations: [tailwind(), sitemap()],
  redirects: legacyRedirects,
  vite: {
    optimizeDeps: {
      include: [
        'three',
        'three/examples/jsm/controls/OrbitControls.js',
        'three/examples/jsm/loaders/OBJLoader.js',
        'three/examples/jsm/loaders/MTLLoader.js',
      ],
    },
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },
});
