import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for major libraries
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
            'firebase/app',
            'firebase/auth',
            'firebase/firestore',
            'firebase/storage'
          ],
          // UI components chunk
          ui: [
            '@heroicons/react',
            'browser-image-compression'
          ],
          // Features chunk
          features: [
            './src/services/inventoryService.js',
            './src/services/sellersService.js',
            './src/firebase/config.js'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
