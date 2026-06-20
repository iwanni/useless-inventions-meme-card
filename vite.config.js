import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [
    svelte(),
    {
      name: "spa-fallback",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (/^\/\d+$/.test(req.url)) {
            req.url = '/';
          }
          next();
        });
      },
    },
  ],
  server: {
    watch: { usePolling: false },
  },
})
