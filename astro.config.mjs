import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import compress from "astro-compress";
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://ulp.ugr.es',
  integrations: [tailwind(), compress(), sitemap()],
  redirects: {
    "/201617" : "/",
    "/201718" : "/",
    "/201819" : "/",
  },
  output: "server"
});