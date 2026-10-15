import { defineConfig } from 'astro/config';
import callouts from './src/lib/callouts.mjs';

// BASE_PATH permite publicar num subcaminho (o deploy do GitHub Pages usa /caderno-visual).
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'ignore',
  markdown: { rehypePlugins: [callouts] },
  devToolbar: { enabled: false },
});
