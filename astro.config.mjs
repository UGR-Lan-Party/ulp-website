import { defineConfig } from 'astro/config';
import tailwind from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import sitemap from '@astrojs/sitemap';
import { legacyRedirects } from './src/data/legacy-redirects.js';

export default defineConfig({
  site: 'https://ulp.ugr.es',
  output: 'static',
  compressHTML: true,
  integrations: [sitemap()],
  redirects: legacyRedirects,
  vite: {
    server: { proxy: { '/api/social-stats': { target: 'http://127.0.0.1:8788' } } },
    css: { postcss: { plugins: [tailwind(), autoprefixer()] } },
    optimizeDeps: {
      include: [
        'qrcode',
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
