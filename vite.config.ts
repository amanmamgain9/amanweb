import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
