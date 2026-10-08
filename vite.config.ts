import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// GitHub Pages: https://fbrecht-spec.github.io/Snowcardtracker/ (case-sensitiv)
const BASE = '/Snowcardtracker/';

export default defineConfig({
  base: BASE,
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeManifestIcons: false, // PNGs sind bereits über globPatterns im Precache
      manifest: {
        name: "Flo's Snowcard Tracker",
        short_name: "Flo's Tracker",
        description: 'Skitage tracken und Break-even der Snowcard Tirol berechnen',
        lang: 'de',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#F2F2F7',
        background_color: '#F2F2F7',
        start_url: BASE,
        scope: BASE,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Alles precachen, damit die App komplett offline läuft
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});
