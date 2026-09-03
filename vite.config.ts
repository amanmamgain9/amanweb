import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0'  // This makes it listen on all interfaces
  },
  build: {
    // The three.js core chunk is ~800 KB raw / ~205 KB gzip and
    // cannot be split further without a custom build. Bump the
    // warning limit above it so only genuinely oversized chunks
    // trigger the Vite notice.
    chunkSizeWarningLimit: 850,
    rollupOptions: {
      input: {
        main: resolve(rootDir, 'index.html'),
        articles: resolve(rootDir, 'articles/index.html'),
      },
      output: {
        // Pull the 3D stack into its own chunk so it caches across
        // deploys when only app code changes, and so the app chunk
        // stays well under Vite's 500 KB raw warning threshold.
        manualChunks: (id) => {
          if (id.includes('node_modules/three/')) return 'three';
          if (
            id.includes('node_modules/@react-three/') ||
            id.includes('node_modules/three-stdlib/')
          ) {
            return 'three-ecosystem';
          }
        },
      },
    },
  },
})
