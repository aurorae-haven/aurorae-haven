import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables from .env files
  const env = loadEnv(mode, process.cwd());
  // Use environment variable or default for GitHub Pages
  const base = env.VITE_BASE_URL || '/aurorae-haven/'

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icon-192x192.svg', 'icon-512x512.svg'],
        manifest: {
          name: 'Aurorae Haven',
          short_name: 'Aurorae',
          description:
            'A calm, astro-themed productivity app designed for neurodivergent users.',
          theme_color: '#1a1a2e',
          background_color: '#0f0f1e',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: 'icon-192x192.svg',
              sizes: '192x192',
              type: 'image/svg+xml'
            },
            {
              src: 'icon-512x512.svg',
              sizes: '512x512',
              type: 'image/svg+xml'
            }
          ]
        },
        workbox: {
          // Cache all static assets
          globPatterns: [
            '**/*.{js,css,html,svg,png,jpg,jpeg,gif,webp,woff,woff2}'
          ],
          // Runtime caching for external resources
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'jsdelivr-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            }
          ]
        }
      })
    ],
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Split vendor code for better caching
            if (
              id.includes('node_modules/@fullcalendar/core') ||
              id.includes('node_modules/@fullcalendar/daygrid')
            ) {
              return 'calendar-vendor';
            }
            if (
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-router-dom')
            ) {
              return 'react-vendor';
            }
            if (
              id.includes('node_modules/marked') ||
              id.includes('node_modules/dompurify')
            ) {
              return 'markdown-vendor';
            }
          }
        }
      }
    },
    server: {
      port: 3000,
      open: true
    },
    preview: {
      port: 4173
    },
    // Resolve configuration
    resolve: {
      alias: {
        '@': '/src'
      }
    }
  }
})
