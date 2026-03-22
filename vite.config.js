import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/patches/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-image.svg', 'robots.txt', 'sitemap.xml'],
      manifest: {
        name: 'Patches - Rectangle Logic Puzzle',
        short_name: 'Patches',
        description: 'A free rectangle logic puzzle game with 250 levels across 5 difficulty tiers',
        theme_color: '#F6F1EB',
        background_color: '#F6F1EB',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/patches/',
        scope: '/patches/',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
        ],
      },
    }),
  ],
})
