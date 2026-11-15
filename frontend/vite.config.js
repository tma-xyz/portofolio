import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Saat dev, request /api dan /storage diteruskan ke Laravel (php artisan serve)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/storage': 'http://127.0.0.1:8000',
    },
  },
})
