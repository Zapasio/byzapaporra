import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Configuración del manifiesto de la PWA
      manifest: {
        name: 'Porra ByZapa',
        short_name: 'ByZapa',
        description: 'App para la porra de fútbol de La Liga',
        theme_color: '#1a202c', // Un color oscuro para la barra de estado
        background_color: '#000000',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.svg', // <-- Actualizado a .svg
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512x512.svg', // <-- Actualizado a .svg
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
})
