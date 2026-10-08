import { defineConfig } from 'vitest/config';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/jeux-rapide/',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      pwaAssets: { config: true },
      manifest: {
        name: 'Jimees — la Corp',
        short_name: 'Jimees',
        lang: 'fr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#1d2340',
        theme_color: '#1d2340',
        start_url: '/jeux-rapide/',
        scope: '/jeux-rapide/',
      },
    }),
  ],
  test: { environment: 'jsdom' },
});
