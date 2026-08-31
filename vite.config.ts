import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'og-image.jpg'],
      manifest: {
        name: 'Mülakat Provası · Adayım',
        short_name: 'Mülakat Provası',
        description:
          'Üniversite öğrencileri ve yeni mezunlar için eğlenceli, güncel mülakat simülasyonu oyunu.',
        lang: 'tr',
        start_url: '/',
        display: 'standalone',
        background_color: '#0a1220',
        theme_color: '#2563eb',
        icons: [
          { src: '/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Tamamen client-side bir SPA: tüm derlenmiş varlıklar önbelleğe alınır,
        // bilinmeyen bir yola (ör. sayfa yenilemesi) gelen navigasyonlar
        // index.html'e düşer, veri hiçbir zaman ağdan çekilmediği için ekstra
        // bir runtime caching kuralına gerek yok.
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      },
    }),
  ],
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    strictPort: Boolean(process.env.PORT),
  },
})
