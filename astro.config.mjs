import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import sitemap from '@astrojs/sitemap';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://ulp.ugr.es',
  integrations: [tailwind(), compress(), sitemap(), preact()],
  redirects: {
    "/201617" : "/",
    "/201718" : "/",
    "/201819" : "/",
  }
});