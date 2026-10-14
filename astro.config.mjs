import { defineConfig } from 'astro/config';

// BASE_PATH permite publicar num subcaminho (ex.: GitHub Pages em /linguagens-formais).
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
});
